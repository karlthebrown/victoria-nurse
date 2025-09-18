/* Victoria Nurse — Service Worker (v49) */
const CACHE_NAME = 'victoria-nurse-v49';

const ASSETS = [
  // HTML (cache both plain + versioned where applicable)
  './',
  './index.html',
  './index.html?v=2025-09-17-49',
  './app.html',
  './app.html?v=2025-09-17-49',
  './help.html',
  './help.html?v=2025-09-17-49',

  // PWA
  './manifest.webmanifest?v=2025-09-17-49',

  // Icons
  './icons/icon-192.png?v=2025-09-17-49',
  './icons/icon-512.png?v=2025-09-17-49',
  './icons/icon-180.png?v=2025-09-17-49',
  './icons/favicon.png?v=2025-09-17-49',

  // Images
  './images/welcome-victoria-nurse-medical.png?v=2025-09-17-49'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async ()=>{
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

  // Network-first for HTML with offline fallbacks
  if (isHTML) {
    event.respondWith((async () => {
      try {
        return await fetch(req);
      } catch {
        // Fallbacks by route
        if (url.pathname.endsWith('/app.html')) {
          const appV = await caches.match('./app.html?v=2025-09-17-49');
          if (appV) return appV;
          const app = await caches.match('./app.html');
          if (app) return app;
        }
        if (url.pathname.endsWith('/help.html')) {
          const helpV = await caches.match('./help.html?v=2025-09-17-49');
          if (helpV) return helpV;
          const help = await caches.match('./help.html');
          if (help) return help;
        }
        // Default: landing
        const indexV = await caches.match('./index.html?v=2025-09-17-49');
        if (indexV) return indexV;
        const index = await caches.match('./index.html');
        return index || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
      }
    })());
    return;
  }

  // Same-origin: cache-first for static assets
  if (url.origin === location.origin) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;

      try {
        const res = await fetch(req);
        // Only cache known app assets
        const key = url.pathname + (url.search || '');
        if (ASSETS.includes(key) || ASSETS.includes('.' + key)) {
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

  // Third-party: just go to network
  event.respondWith(fetch(req));
});