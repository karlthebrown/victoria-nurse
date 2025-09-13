/* Victoria Nurse — Service Worker (privacy hardened) */
const CACHE_NAME = 'victoria-nurse-v11b';
const ASSETS = [
  './manifest.webmanifest?v=2025-09-12-11b',
  './icons/icon-192.png?v=2025-09-12-11b',
  './icons/favicon.png?v=2025-09-12-11b'
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

  // Never cache HTML; if offline, fall back to a tiny local asset we know is cached
  if (isHTML || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html')) {
    event.respondWith(fetch(req).catch(() => caches.match('./manifest.webmanifest?v=2025-09-12-11b')));
    return;
  }

  // Same-origin static assets (whitelisted only)
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          const withSearch = url.pathname + (url.search || '');
          const normalized = withSearch.startsWith('.') ? withSearch : '.' + withSearch;
          if (ASSETS.includes(normalized)) {
            caches.open(CACHE_NAME).then((c) => c.put(req, res.clone()));
          }
          return res;
        });
      })
    );
    return;
  }

  // Cross-origin: network-first, no cache
  event.respondWith(fetch(req).catch(() => new Response('', { status: 504 })));
});
