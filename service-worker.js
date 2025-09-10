// service-worker.js
const CACHE_NAME = 'victoria-nurse-v6';
const ASSETS = [
  '/',              // adjust if hosted under a subpath
  '/index.html',
  '/assets/nurse-hero.jpg',
  // add other static files if split: '/styles.css', '/app.js', '/favicon.ico', '/manifest.webmanifest'
];

self.addEventListener('install', (evt) => {
  self.skipWaiting();
  evt.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Navigation: network-first with index.html fallback
// Assets in ASSETS: cache-first
// Others: cache, else network
self.addEventListener('fetch', (evt) => {
  const req = evt.request;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    evt.respondWith(fetch(req).catch(() => caches.match('/index.html')));
    return;
  }

  const isStatic = ASSETS.includes(url.pathname);
  if (isStatic) {
    evt.respondWith(caches.match(req).then((cached) => cached || fetch(req)));
    return;
  }

  evt.respondWith(caches.match(req).then((cached) => cached || fetch(req)));
});
