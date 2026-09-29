/* One versioned IndexedDB boundary for safe offline public records, saved map
   state, and explicitly queued user drafts. It never stores credentials or
   payment data. */
(function () {
  "use strict";
  const DB_NAME = "be-the-change-offline";
  const DB_VERSION = 2;
  const STORES = [
    "appMetadata", "userPreferences", "cachedCountries", "cachedLocations",
    "cachedMissions", "cachedEvents", "cachedCourses", "cachedLessons",
    "cachedOrganizations", "cachedMapLayers", "savedViews", "personalMaps",
    "personalMapItems", "offlinePacks", "draftCheckIns", "draftStatusUpdates",
    "draftPhotos", "draftEvidence", "draftMissionUpdates", "draftLocationCorrections",
    "pendingSync", "syncConflicts", "mediaBlobs", "recentSearches", "recentRecords",
    "enterpriseDrafts", "enterpriseDocuments", "enterpriseEvidence", "enterpriseAudit",
    "registrationCases", "bankingCases", "fundingReadiness", "mentorDrafts"
  ];
  let dbPromise;

  function open() {
    if (!window.indexedDB) return Promise.reject(new Error("IndexedDB unavailable"));
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        STORES.forEach(name => {
          if (!db.objectStoreNames.contains(name)) {
            const store = db.createObjectStore(name, { keyPath: "localId" });
            store.createIndex("serverId", "serverId", { unique: false });
            store.createIndex("updatedAt", "updatedAt", { unique: false });
            store.createIndex("syncStatus", "syncStatus", { unique: false });
          }
        });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Could not open offline storage"));
    });
    return dbPromise;
  }

  function transaction(store, mode, operation) {
    return open().then(db => new Promise((resolve, reject) => {
      const request = db.transaction(store, mode).objectStore(store);
      let result;
      try { result = operation(request); } catch (error) { reject(error); return; }
      if (result && typeof result.onsuccess !== "undefined") {
        result.onsuccess = () => resolve(result.result);
        result.onerror = () => reject(result.error || new Error("Offline database operation failed"));
      } else resolve(result);
    }));
  }

  const api = {
    name: DB_NAME,
    version: DB_VERSION,
    stores: STORES,
    ready: open().catch(() => null),
    get(store, localId) { return transaction(store, "readonly", request => request.get(localId)); },
    put(store, value) {
      const record = { ...value, localId: String(value.localId || value.serverId || crypto.randomUUID()), updatedAt: value.updatedAt || new Date().toISOString() };
      return transaction(store, "readwrite", request => request.put(record));
    },
    remove(store, localId) { return transaction(store, "readwrite", request => request.delete(localId)); },
    list(store) { return transaction(store, "readonly", request => request.getAll()); },
    enqueue(value) {
      return this.put("pendingSync", { ...value, localId: value.localId || crypto.randomUUID(), syncStatus: "Ready to Sync", retryCount: value.retryCount || 0 });
    },
    async cachePublicRecords(records) {
      if (!Array.isArray(records)) return;
      await Promise.all(records.map(record => this.put("cachedLocations", { localId: record.id, serverId: record.id, payload: record, cachePolicy: "public" })));
    },
    async saveMapView(view) {
      return this.put("savedViews", { ...view, localId: view.localId || crypto.randomUUID(), syncStatus: "Local Draft" });
    },
    async sync(options = {}) {
      if(!navigator.onLine) return { status: "Offline", synced: 0, failed: 0 };
      const owner=options.owner || "guest";
      const queue=(await this.list("pendingSync")).filter(item=>item.endpoint!=="/api/check-ins" || item.localOwner===owner), result={status:"Complete",synced:0,failed:0,conflicts:0};
      for(const item of queue){
        const endpoint=item.endpoint, method=item.method||"POST";
        if(!endpoint) { await this.remove("pendingSync",item.localId); continue; }
        await this.put("pendingSync",{...item,syncStatus:"Syncing"});
        try {
          const response=await fetch(endpoint,{method,headers:{"content-type":"application/json","x-idempotency-key":item.localId},body:JSON.stringify(item.payload||item)});
          if(response.ok){await this.remove("pendingSync",item.localId);result.synced++;continue;}
          if(response.status===409){await this.put("syncConflicts",{localId:`conflict-${item.localId}`,serverId:item.serverId,payload:item.payload||item,source:item,syncStatus:"Conflict"});await this.put("pendingSync",{...item,syncStatus:"Conflict",lastError:"Server and local versions differ"});result.conflicts++;continue;}
          throw new Error(`Sync failed (${response.status})`);
        } catch(error){const retry=Number(item.retryCount||0)+1;await this.put("pendingSync",{...item,syncStatus:retry>=5?"Failed":"Ready to Sync",retryCount:retry,lastError:error.message});result.failed++;}
      }
      return result;
    }
  };
  window.BTCOffline = api;
})();
