/* Victoria Nurse — Service Worker (v49) */
const CACHE_NAME = 'victoria-nurse-v49';

const ASSETS = [
  './',
  './index.html',
  './app.html',
  './app.html?v=2025-09-17-49',
  './help.html',
  './manifest.webmanifest?v=2025-09-17-49',
  './icons/icon-192.png?v=2025-09-17-49',
  './icons/icon-512.png?v=2025-09-17-49',
  './icons/icon-180.png?v=2025-09-17-49',
  './icons/favicon.png?v=2025-09-17-49',
  './images/welcome-victoria-nurse-medical.png?v=2025-09-17-49'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
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

  if (isHTML) {
    event.respondWith((async () => {
      try { return await fetch(req); }
      catch {
        if (url.pathname.endsWith('/app.html')) {
          const appV = await caches.match('./app.html?v=2025-09-17-49');
          if (appV) return appV;
          const app = await caches.match('./app.html');
          if (app) return app;
        }
        const landing = await caches.match('./index.html');
        return landing || new Response('Offline', {status:503});
      }
    })());
    return;
  }

  if (url.origin === location.origin) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      try {
        const res = await fetch(req);
        if (ASSETS.includes(url.pathname + (url.search||''))) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, res.clone());
        }
        return res;
      } catch {
        return new Response('', {status:504});
      }
    })());
    return;
  }

  event.respondWith(fetch(req));
});