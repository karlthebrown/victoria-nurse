/* Victoria Nurse SW (no user data cached) */
const STATIC_CACHE = 'static-v1';
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(STATIC_CACHE).then((c) => c.addAll(PRECACHE)));
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== STATIC_CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Fetch: never cache navigations with content (avoid showing old filled forms)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // For navigations always go to network, fallback to cached shell
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

  // Everything else: network, no-store
  event.respondWith(fetch(req, { cache: 'no-store' }));
});
