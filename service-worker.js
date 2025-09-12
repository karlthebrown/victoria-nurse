/* Victoria Nurse — Service Worker */
const CACHE_NAME = 'victoria-nurse-v10';
const ASSETS = [
  './manifest.webmanifest?v=2025-09-12-10',
  './icons/icon-192.png?v=2025-09-12-10',
  './icons/favicon.png?v=2025-09-12-10'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
  })());
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);

  if (event.request.destination === 'document') {
    event.respondWith(fetch(event.request).catch(() => caches.match('./manifest.webmanifest?v=2025-09-12-10')));
    return;
  }

  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((res) => {
          if (ASSETS.includes(url.pathname + url.search)) {
            caches.open(CACHE_NAME).then((c) => c.put(event.request, res.clone()));
          }
          return res;
        });
      })
    );
  }
});
