/* Victoria Nurse — Service Worker (privacy hardened) */
const CACHE_NAME = 'victoria-nurse-v4';
const ASSETS = [
  './manifest.webmanifest',
  './icon/logo.png',
  './icon/logo-192.png',
  './icon/logo-512.png',
  './icon/maskable-192.png',
  './icon/maskable-512.png'
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

  // Never cache HTML or form pages
  if (isHTML || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html')) {
    event.respondWith(fetch(req).catch(() => caches.match('./manifest.webmanifest')));
    return;
  }

  // Same-origin static assets (whitelisted)
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          const path = url.pathname.startsWith('/') ? `.${url.pathname}` : url.pathname;
          if (ASSETS.includes(path)) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, clone));
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
