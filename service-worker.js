/* Victoria Nurse — Service Worker (v29) */
const CACHE_NAME = 'victoria-nurse-v29';

const ASSETS = [
  './',
  './index.html',
  './app.html',

  // Manifest + icons (versioned for cache-busting)
  './manifest.webmanifest?v=2025-09-17-29',
  './icons/icon-192.png?v=2025-09-17-29',
  './icons/icon-512.png?v=2025-09-17-29',
  './icons/icon-180.png?v=2025-09-17-29',
  './icons/favicon.png?v=2025-09-17-29',

  // Landing background (PNG hero)
  './images/welcome-victoria-nurse-medical.png',
  './images/welcome-victoria-nurse-medical.png?v=2025-09-17-29'
];

// INSTALL: Precache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// ACTIVATE: Clean up older caches
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter((k) => k !== CACHE_NAME)
      .map((k) => caches.delete(k)));
  })());
  self.clients.claim();
});

// FETCH: network-first for HTML; cache-first for static assets
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isHTML =
    req.destination === 'document' ||
    req.headers.get('accept')?.includes('text/html');

  // HTML → network-first with cached fallback
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

  // Same-origin static → cache-first, then network
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

  // Third-party → just go to network
  event.respondWith(fetch(req));
});