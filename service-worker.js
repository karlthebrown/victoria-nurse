/* Victoria Nurse — Service Worker (v13) */
const CACHE_NAME = 'victoria-nurse-v13';

const ASSETS = [
  './',
  './index.html',                                // landing
  './app.html',                                  // app screen (now cached)
  './manifest.webmanifest?v=2025-09-12-11',
  './icons/icon-192.png?v=2025-09-12-11',
  './icons/icon-512.png?v=2025-09-12-11',
  './icons/icon-180.png?v=2025-09-12-11',
  './icons/favicon.png?v=2025-09-12-11',
  './images/welcome-victoria-nurse.jpg'          // landing background
];

// Install: pre-cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
  })());
  self.clients.claim();
});

// Fetch strategy:
// - HTML documents: network-first (fall back to cached index/app if offline)
// - Known static assets in ASSETS: cache-first
// - Other requests: network
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isHTML =
    req.destination === 'document' ||
    req.headers.get('accept')?.includes('text/html');

  if (isHTML) {
    event.respondWith(
      (async () => {
        try {
          return await fetch(req);
        } catch {
          // Fallback: serve app.html when requesting app, otherwise index.html
          if (url.pathname.endsWith('/app.html')) {
            const cachedApp = await caches.match('./app.html');
            if (cachedApp) return cachedApp;
          }
          const cachedIndex = await caches.match('./index.html');
          return cachedIndex || new Response('Offline', { status: 503 });
        }
      })()
    );
    return;
  }

  // Same-origin static assets: cache-first for those in ASSETS
  if (url.origin === location.origin) {
    event.respondWith(
      (async () => {
        const cached = await caches.match(req);
        if (cached) return cached;

        try {
          const res = await fetch(req);
          // Only cache if the path is one of our ASSETS (normalized to leading ./)
          const pathWithSearch = url.pathname + (url.search || '');
          const normalized = pathWithSearch.startsWith('.') ? pathWithSearch : '.' + pathWithSearch;
          if (ASSETS.includes(normalized)) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(req, res.clone());
          }
          return res;
        } catch {
          // If an icon/manifest is missing offline, just fail silently
          return new Response('', { status: 504 });
        }
      })()
    );
    return;
  }

  // Cross-origin: network
  event.respondWith(fetch(req));
});
