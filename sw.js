const CACHE_VERSION = "btc-v5";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const PUBLIC_CACHE = `${CACHE_VERSION}-public`;
const SHELL = [
  "/", "/index.html", "/map/", "/map/index.html", "/styles.css", "/boot.js", "/app.js", "/firebase-config.js", "/firebase-account.js", "/enterprise.js", "/whatsapp.js", "/whatsapp-phone.js", "/offline-db.js", "/manifest.webmanifest", "/offline.html",
  "/assets/icons/icon.svg", "/assets/icons/icon-maskable.svg", "/assets/icons/icon-monochrome.svg", "/assets/icons/icon-180.svg", "/uploads/sbtc-lo.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(STATIC_CACHE).then(cache => cache.addAll(SHELL).catch(() => undefined)));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("btc-") && ![STATIC_CACHE, PUBLIC_CACHE].includes(key)).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

function isPrivateOrMutable(url) {
  return url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin") || url.search.includes("token=") || url.search.includes("session=");
}
function isStaticAsset(url) {
  return url.origin === self.location.origin && (/\.(?:js|css|svg|webmanifest|woff2?|ttf)$/.test(url.pathname) || url.pathname.startsWith("/assets/icons/"));
}
function isPublicData(url) {
  return url.origin === self.location.origin && (url.pathname.startsWith("/public/") || url.pathname.startsWith("/api/public/"));
}
async function networkFirst(request, fallback) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    return (await caches.match(request)) || caches.match(fallback);
  }
}

self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (isPrivateOrMutable(url)) return;
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, "/offline.html"));
    return;
  }
  if (isStaticAsset(url)) {
    event.respondWith(fetch(request).then(response => {
      if (response.ok && url.origin === self.location.origin) caches.open(STATIC_CACHE).then(cache => cache.put(request, response.clone()));
      return response;
    }).catch(() => caches.match(request)));
    return;
  }
  if (isPublicData(url)) {
    event.respondWith(fetch(request).then(response => {
      if (response.ok) caches.open(PUBLIC_CACHE).then(cache => cache.put(request, response.clone()));
      return response;
    }).catch(() => caches.match(request)));
  }
});
