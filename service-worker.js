/* Victoria Nurse — Service Worker (v12) */
const CACHE_NAME = 'victoria-nurse-v12';
const ASSETS = [
  './',
  './index.html',
  './app.html',
  './manifest.webmanifest?v=2025-09-12-11',
  './icons/icon-192.png?v=2025-09-12-11',
  './icons/icon-512.png?v=2025-09-12-11',
  './icons/favicon.png?v=2025-09-12-11',
  './images/welcome-victoria-nurse.jpg' // new landing background
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
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isHTML = req.destination === 'document' || req.headers.get('accept')?.includes('text/html');

  // Network-first for HTML (fallback to cached index if offline)
  if (isHTML) {
    event.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Cache-first for known static ASSETS
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          const pathWithSearch = url.pathname + (url.search || '');
          const normalized = pathWithSearch.startsWith('.') ? pathWithSearch : '.' + pathWithSearch;
          if (ASSETS.includes(normalized)) {
            caches.open(CACHE_NAME).then((c) => c.put(req, res.clone()));
          }
          return res;
        });
      })
    );
    return;
  }

  // Cross-origin: just hit network
  event.respondWith(fetch(req));
});
