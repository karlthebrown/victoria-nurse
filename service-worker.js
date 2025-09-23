/* Victoria Nurse — Service Worker (v60) */
const CACHE_NAME = 'victoria-nurse-v60';

const ASSETS = [
  // HTML (cache both plain + versioned for offline)
  './',
  './index.html',
  './index.html?v=2025-09-23-02',
  './app.html',
  './app.html?v=2025-09-23-02',
  './help.html',
  './help.html?v=2025-09-23-02',

  // PWA
  './manifest.webmanifest?v=2025-09-23-02',

  // Icons
  './icons/icon-192.png?v=2025-09-23-02',
  './icons/icon-512.png?v=2025-09-23-02',
  './icons/icon-180.png?v=2025-09-23-02',
  './icons/favicon.png?v=2025-09-23-02',

  // Images
  './images/welcome-victoria-nurse-medical.png?v=2025-09-23-02'
];

// Don’t cache CDN (prevents stale versions and CORS surprises)
function isCDN(url) {
  return /(^https:\/\/cdn\.jsdelivr\.net)|(^https:\/\/cdn\.tailwindcss\.com)/.test(url);
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
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

  // Never cache CDN
  if (isCDN(url.href)) {
    event.respondWith(fetch(req).catch(() => new Response('', {status: 504})));
    return;
  }

  // Network-first for HTML with offline fallbacks
  if (isHTML) {
    event.respondWith((async () => {
      try {
        return await fetch(req);
      } catch {
        if (url.pathname.endsWith('/app.html')) {
          return (await caches.match('./app.html?v=2025-09-23-02')) || (await caches.match('./app.html')) || Response.error();
        }
        if (url.pathname.endsWith('/help.html')) {
          return (await caches.match('./help.html?v=2025-09-23-02')) || (await caches.match('./help.html')) || Response.error();
        }
        return (await caches.match('./index.html?v=2025-09-23-02')) || (await caches.match('./index.html')) || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
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

  // Third-party (non-CDN): go to network
  event.respondWith(fetch(req));
});