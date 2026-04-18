// Kill switch: unregister all service workers and clear caches.
// The service worker was causing hydration mismatches after deploys because
// it served stale JS chunks. Disabling until we implement a proper
// versioning/skipWaiting strategy.
(function () {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    registrations.forEach(function (r) { r.unregister(); });
  }).catch(function () {});
  if (typeof caches !== 'undefined') {
    caches.keys().then(function (keys) {
      keys.forEach(function (key) { caches.delete(key); });
    }).catch(function () {});
  }
})();
