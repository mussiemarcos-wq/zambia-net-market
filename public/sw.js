// Kill-switch service worker. Unregisters itself and clears all caches,
// then passes every request through to the network. This prevents stale
// cached JS from causing hydration errors after deployments.
self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    (async function () {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map(function (k) { return caches.delete(k); }));
      } catch (_) { /* ignore */ }
      try {
        await self.registration.unregister();
        const clients = await self.clients.matchAll();
        clients.forEach(function (c) {
          try { c.navigate(c.url); } catch (_) { /* ignore */ }
        });
      } catch (_) { /* ignore */ }
    })()
  );
});

self.addEventListener('fetch', function (event) {
  // Pass-through: always hit the network, never serve from cache.
  event.respondWith(fetch(event.request));
});
