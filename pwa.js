(function () {
  "use strict";
  const isStandalone = window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const storageKey = "btc-pwa-preferences";
  let preferences = {};
  try { preferences = JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch (_) {}
  const save = () => { try { localStorage.setItem(storageKey, JSON.stringify(preferences)); } catch (_) {} };
  const meaningfulActions = new Set(["map-open", "route-missions", "enroll-course", "save-passport", "join-mission", "open-course"]);
  const style = document.createElement("style");
  style.textContent = `.pwa-notice{position:fixed;left:14px;right:14px;bottom:calc(86px + env(safe-area-inset-bottom));z-index:100;padding:13px 15px;border:1px solid rgba(120,238,229,.35);border-radius:14px;background:rgba(6,21,31,.96);box-shadow:0 12px 35px rgba(0,0,0,.35);color:#eefafa;font:12px/1.45 system-ui,sans-serif}.pwa-notice strong{display:block;color:#fff;font-size:13px;margin-bottom:3px}.pwa-notice small{display:block;color:#abc3c7}.pwa-notice-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}.pwa-notice button{min-height:36px;border:1px solid #456d77;border-radius:8px;padding:8px 11px;background:transparent;color:#eaf8f8;font-weight:700;cursor:pointer}.pwa-notice button.primary{background:#78eee5;color:#06151f;border-color:#78eee5}.pwa-offline{top:calc(66px + env(safe-area-inset-top));bottom:auto;left:50%;right:auto;transform:translateX(-50%);white-space:nowrap;padding:8px 12px;border-radius:999px}.pwa-install-guide{max-width:480px;left:50%;right:auto;bottom:50%;transform:translate(-50%,50%)}@media(max-width:560px){.pwa-install-guide{left:14px;right:14px;transform:translateY(50%)}}`;
  document.head.appendChild(style);
  function notice(title, detail, actions = [], className = "") {
    document.querySelectorAll(".pwa-notice").forEach(node => node.remove());
    const el = document.createElement("aside"); el.className = `pwa-notice ${className}`;
    el.innerHTML = `<strong>${title}</strong>${detail ? `<small>${detail}</small>` : ""}<div class="pwa-notice-actions">${actions.map(action => `<button class="${action.primary ? "primary" : ""}" data-pwa-action="${action.id}">${action.label}</button>`).join("")}</div>`;
    document.body.appendChild(el); return el;
  }
  let installEvent = null;
  function meaningfulSignal() {
    if (isStandalone || preferences.installDismissed || preferences.installShown) return;
    preferences.installShown = true; save();
    if (installEvent) {
      notice("Take Be The Change with you.", "Install for faster access, offline learning, saved missions, and field tools.", [{id:"install",label:"Install App",primary:true},{id:"dismiss-install",label:"Not Now"},{id:"learn-install",label:"Learn More"}]);
    } else if (/iphone|ipad|ipod/i.test(navigator.userAgent) && !window.navigator.standalone) {
      notice("Install Be The Change", "Open the Share menu, choose Add to Home Screen, then confirm Be The Change.", [{id:"dismiss-install",label:"Got it",primary:true}], "pwa-install-guide");
    }
  }
  window.addEventListener("beforeinstallprompt", event => { event.preventDefault(); installEvent = event; });
  window.addEventListener("appinstalled", () => { installEvent = null; preferences.installed = true; save(); document.querySelectorAll(".pwa-notice").forEach(node => node.remove()); });
  document.addEventListener("click", event => {
    const target = event.target.closest("[data-pwa-action]");
    if (target) {
      const action = target.dataset.pwaAction;
      if (action === "install" && installEvent) installEvent.prompt().catch(() => undefined);
      if (action === "dismiss-install") { preferences.installDismissed = true; save(); }
      if (action === "learn-install") { target.closest(".pwa-notice")?.remove(); notice("Install when it helps.", "You can also install later from your browser menu or App and Offline settings.", [{id:"dismiss-install",label:"Close",primary:true}]); return; }
      target.closest(".pwa-notice")?.remove(); return;
    }
    const action = event.target.closest("[data-action]")?.dataset.action;
    if (action && meaningfulActions.has(action)) meaningfulSignal();
  });
  let visits = Number(sessionStorage.getItem("btc-pwa-visits") || 0) + 1;
  try { sessionStorage.setItem("btc-pwa-visits", String(visits)); } catch (_) {}
  if (visits > 1) window.setTimeout(meaningfulSignal, 1800);

  function announceConnection(online) {
    if (!online) notice("You’re offline", "Saved content and safe drafts remain available. New server changes need a connection.", [{id:"dismiss-install",label:"Dismiss",primary:true}], "pwa-offline");
    else notice("Back online", "You can synchronize queued drafts when you’re ready.", [{id:"dismiss-install",label:"Dismiss",primary:true}], "pwa-offline");
  }
  window.addEventListener("offline", () => announceConnection(false));
  window.addEventListener("online", () => announceConnection(true));
  if (!navigator.onLine) announceConnection(false);

  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("/sw.js", {scope:"/", updateViaCache:"none"}).then(registration => {
      if (registration.waiting) showUpdate(registration);
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing; if (!worker) return;
        worker.addEventListener("statechange", () => { if (worker.state === "installed" && navigator.serviceWorker.controller) showUpdate(registration); });
      });
    }).catch(() => { window.dispatchEvent(new CustomEvent("btc:pwa-unavailable")); });
  }
  function showUpdate(registration) {
    notice("A new version of Be The Change is ready.", "Your open route and locally saved drafts will be preserved.", [{id:"update-now",label:"Update Now",primary:true},{id:"later",label:"Later"},{id:"changes",label:"View What Changed"}]);
    const node = document.querySelector(".pwa-notice");
    node?.addEventListener("click", event => {
      const action = event.target.closest("[data-pwa-action]")?.dataset.pwaAction;
      if (action === "update-now") { registration.waiting?.postMessage({type:"SKIP_WAITING"}); window.setTimeout(() => location.reload(), 300); }
      if (action === "changes") { notice("Update keeps the same mission network.", "This release adds the installable shell, offline fallback, safe cache boundaries, and mobile improvements.", [{id:"dismiss-install",label:"Close",primary:true}]); }
    });
  }
  window.__btcPwa = { isStandalone, preferences, meaningfulSignal };
})();
