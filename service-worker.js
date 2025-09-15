/* Victoria Nurse — Service Worker (v30) */
const CACHE_NAME = 'victoria-nurse-v30';

const ASSETS = [
  './',
  './index.html',
  './app.html',

  // Manifest + icons (versioned)
  './manifest.webmanifest?v=2025-09-17-30',
  './icons/icon-192.png?v=2025-09-17-30',
  './icons/icon-512.png?v=2025-09-17-30',
  './icons/icon-180.png?v=2025-09-17-30',
  './icons/favicon.png?v=2025-09-17-30'
];

// INSTALL: Precache core shell
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

// ACTIVATE: Remove older caches
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)));
  })());
  self.clients.claim();
});

// FETCH: network-first for HTML; cache-first for static assets
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isHTML = req.destination === 'document' || req.headers.get('accept')?.includes('text/html');

  // HTML → network-first
  if (isHTML) {
    event.respondWith((async () => {
      try {
        return await fetch(req);
      } catch {
        if (url.pathname.endsWith('/app.html')) {
          const app = await caches.match('./app.html');
          if (app) return app;
        }
        const index = await caches.match('./index.html');
        return index || new Response('Offline', { status: 503 });
      }
    })());
    return;
  }

  // Same-origin static → cache-first
  if (url.origin === location.origin) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;

      try {
        const res = await fetch(req);

        // cache if this path is part of our ASSETS list
        const pathWithQ = url.pathname + (url.search || '');
        const normalized = pathWithQ.startsWith('.') ? pathWithQ : '.' + pathWithQ;
        if (ASSETS.includes(normalized)) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, res.clone());
        }
        return res;
      } catch {
        return new Response('', { status: 504 });
      }
    })());
    return;
  }

  // Third-party → pass-through
  event.respondWith(fetch(req));
});