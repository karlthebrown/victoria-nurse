// sw.js
const CACHE_NAME = 'victoria-nurse-v5';
const ASSETS = [
  '/',              // SPA entry
  '/index.html',
  '/assets/nurse-hero.jpg',
  // add other static files if you split CSS/JS: '/styles.css', '/app.js', etc.
];

self.addEventListener('install', (evt) => {
  self.skipWaiting();
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Strategy:
// - Navigation requests: network-first, fallback to cached index.html (keeps app fresh)
// - Static assets in ASSETS: cache-first
// - Everything else: try cache, else network
self.addEventListener('fetch', (evt) => {
  const req = evt.request;

  // SPA navigations (address bar/links)
  if (req.mode === 'navigate') {
    evt.respondWith(
      fetch(req).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache-first for known static assets
  const url = new URL(req.url);
  const isStatic = ASSETS.some((p) => url.pathname === p);
  if (isStatic) {
    evt.respondWith(
      caches.match(req).then((cached) => cached || fetch(req))
    );
    return;
  }

  // Default: try cache, else network
  evt.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
