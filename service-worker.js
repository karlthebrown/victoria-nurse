/* Victoria Nurse — Service Worker (v46) */
const CACHE_NAME = 'victoria-nurse-v46';

const ASSETS = [
  './',

  // HTML (both canonical and versioned)
  './index.html',
  './index.html?v=2025-09-17-46',
  './app.html',
  './app.html?v=2025-09-17-46',

  // PWA manifest & icons (v46)
  './manifest.webmanifest?v=2025-09-17-46',
  './icons/icon-192.png?v=2025-09-17-46',
  './icons/icon-512.png?v=2025-09-17-46',
  './icons/icon-180.png?v=2025-09-17-46',
  './icons/favicon.png?v=2025-09-17-46',

  // Logo/hero image (your transparent PNG kept as-is)
  './images/welcome-victoria-nurse-medical.png',
  './images/welcome-victoria-nurse-medical.png?v=2025-09-17-35'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
    );
  })());
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isHTML = req.destination === 'document' || req.headers.get('accept')?.includes('text/html');

  // Network-first for documents with offline fallback
  if (isHTML) {
    event.respondWith((async () => {
      try {
        return await fetch(req);
      } catch {
        if (url.pathname.endsWith('/app.html') || url.pathname.endsWith('/app.html/')) {
          const app = await caches.match('./app.html');
          if (app) return app;
        }
        const landing = await caches.match('./index.html');
        return landing || new Response('Offline', { status: 503 });
      }
    })());
    return;
  }

  // Cache-first for same-origin static assets
  if (url.origin === location.origin) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;

      try {
        const res = await fetch(req);
        // If it's one of our ASSETS, store it
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

  // Cross-origin passthrough
  event.respondWith(fetch(req));
});