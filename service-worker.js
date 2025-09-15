/* Victoria Nurse — Service Worker (v28) */
const CACHE_NAME = 'victoria-nurse-v28';

const ASSETS = [
  './',
  './index.html',
  './app.html',
  './manifest.webmanifest?v=2025-09-17-28',
  './icons/icon-192.png?v=2025-09-17-28',
  './icons/icon-512.png?v=2025-09-17-28',
  './icons/icon-180.png?v=2025-09-17-28',
  './icons/favicon.png?v=2025-09-17-28',
  './images/welcome-victoria-nurse-medical.png',
  './images/welcome-victoria-nurse-medical.png?v=2025-09-17-28'
];

// Install: precache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
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

// Fetch: network-first for HTML, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isHTML =
    req.destination === 'document' ||
    req.headers.get('accept')?.includes('text/html');

  // HTML: network-first, fallback to cached pages
  if (isHTML) {
    event.respondWith((async () => {
      try {
        return await fetch(req);
      } catch {
        if (url.pathname.endsWith('/app.html')) {
          const app = await caches.match('./app.html');
          if (app) return app;
        }
        const landing = await caches.match('./index.html');
        return landing || new Response('Offline', { status: 503 });
      }
    })());
    return;
  }

  // Same-origin static assets: cache-first, then network
  if (url.origin === location.origin) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;

      try {
        const res = await fetch(req);

        // If this request is one of our ASSETS (including versioned query),
        // store it for future offline use.
        const pathWithQ = url.pathname + (url.search || '');
        const normalized = pathWithQ.startsWith('.') ? pathWithQ : '.' + pathWithQ;
        if (ASSETS.includes(normalized)) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, res.clone());
        }

        return res;
      } catch {
        // No cached version and network failed
        return new Response('', { status: 504 });
      }
    })());
    return;
  }

  // Third-party: go to network
  event.respondWith(fetch(req));
});