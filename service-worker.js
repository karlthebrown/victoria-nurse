/* Victoria Nurse — Service Worker */
const CACHE_NAME = 'victoria-nurse-v2'; // bump on assets change
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon/logo.png',
  './icon/logo-192.png',
  './icon/logo-512.png',
  './icon/maskable-192.png',
  './icon/maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS))
  );
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
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Same-origin: cache-first with background update
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req).then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, clone));
          return res;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Cross-origin (CDNs): network-first, fallback to cache
  event.respondWith(
    fetch(req).then((res) => {
      const clone = res.clone();
      caches.open(CACHE_NAME).then((c) => c.put(req, clone));
      return res;
    }).catch(() => caches.match(req))
  );
});
