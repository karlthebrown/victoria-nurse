/* Victoria Nurse SW (no user data cached) */
const STATIC_CACHE = 'static-v2';
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== STATIC_CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Never cache navigations with potential filled forms; serve shell as fallback
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req, { cache: 'no-store' }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Static assets: cache-first
  if (/\.(png|svg|webp|ico|css|js|json|webmanifest|woff2?)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async cache => {
        const cached = await cache.match(req);
        if (cached) return cached;
        const res = await fetch(req, { cache: 'no-store' });
        cache.put(req, res.clone());
        return res;
      })
    );
    return;
  }

  // Everything else: network only, no-store
  event.respondWith(fetch(req, { cache: 'no-store' }));
});
