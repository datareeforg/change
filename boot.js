const bootUrl = new URL(import.meta.url);
const revision = bootUrl.searchParams.get("v") || "development";
const revisionKey = "btc-loaded-revision";

async function clearObsoleteAppCaches() {
  if (!("caches" in window) || revision === "development") return;

  let previousRevision = "";
  try {
    previousRevision = localStorage.getItem(revisionKey) || "";
  } catch (_) {}

  if (previousRevision === revision) return;

  try {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter(name => name.startsWith("btc-"))
        .map(name => caches.delete(name))
    );
  } catch (_) {
    // Cache storage can be unavailable in private browsing. The network
    // module load below remains the safe fallback.
  }

  try {
    localStorage.setItem(revisionKey, revision);
  } catch (_) {}
}

function showStartupRecovery(error) {
  console.error("Be The Change failed to start.", error);
  const app = document.querySelector("#app");
  if (!app) return;

  app.innerHTML = `
    <main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#06151f;color:#eefafa;font:16px/1.5 system-ui,sans-serif">
      <section style="width:min(520px,100%);padding:28px;border:1px solid #31535c;border-radius:18px;background:#0b2630;box-shadow:0 24px 70px rgba(0,0,0,.35)">
        <p style="margin:0 0 8px;color:#78eee5;font-size:12px;font-weight:800;letter-spacing:.12em;text-transform:uppercase">Connection recovery</p>
        <h1 style="margin:0 0 10px;font-size:clamp(26px,6vw,40px);line-height:1.05">The app needs a fresh start.</h1>
        <p style="margin:0 0 20px;color:#b9cdd1">A saved browser copy could not be loaded. Refresh once to reconnect to the latest version.</p>
        <button type="button" data-retry-startup style="min-height:46px;padding:0 18px;border:0;border-radius:10px;background:#78eee5;color:#06151f;font:800 14px system-ui,sans-serif;cursor:pointer">Refresh app</button>
      </section>
    </main>`;

  const retryButton = app.querySelector("[data-retry-startup]");
  if (retryButton) retryButton.addEventListener("click", async () => {
    try {
      const registrations = navigator.serviceWorker && navigator.serviceWorker.getRegistrations
        ? await navigator.serviceWorker.getRegistrations()
        : [];
      await Promise.all((registrations || []).map(registration => registration.update()));
    } catch (_) {}
    location.reload();
  });
}

// Keep the entry module free of top-level await. Firefox versions that support
// ES modules do not all support top-level await, and a parse failure here
// leaves the page looking completely blank before the recovery UI can render.
clearObsoleteAppCaches()
  .then(() => {
    const appUrl = new URL("./app.js", import.meta.url);
    if (revision !== "development") appUrl.searchParams.set("v", revision);
    return import(appUrl.href);
  })
  .catch(showStartupRecovery);
