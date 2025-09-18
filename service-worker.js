/* Victoria Nurse — Service Worker (v49) */
const CACHE_NAME = 'victoria-nurse-v49';

const ASSETS = [
  './',
  './index.html?v=2025-09-17-49',
  './app.html?v=2025-09-17-49',
  './help.html?v=2025-09-17-49',
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
          const app = await caches.match('./app.html?v=2025-09-17-49'); if (app) return app;
        }
        if (url.pathname.endsWith('/help.html')) {
          const help = await caches.match('./help.html?v=2025-09-17-49'); if (help) return help;
        }
        const landing = await caches.match('./index.html?v=2025-09-17-49');
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
        const pathWithQ = url.pathname + (url.search || '');
        const normalized = pathWithQ.startsWith('.') ? pathWithQ : '.' + pathWithQ;
        if (ASSETS.includes(normalized)) {
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