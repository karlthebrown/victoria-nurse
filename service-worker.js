/* Simple SW for Victoria Nurse - cache our own app shell only.
   We deliberately avoid caching CDN libs (html2canvas/jsPDF) to prevent
   version conflicts and CORS/taint surprises. */

const SW_VERSION = 'vn-3';
const APP_SHELL = [
  './',
  './index.html',
  './app.js?v=3'
  // NOTE: do NOT add the CDN scripts here
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SW_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== SW_VERSION).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Network-first for CDN libs to avoid stale versions
  const isCDN = /cdn\.jsdelivr\.net/.test(req.url);

  if (isCDN) {
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
    return;
  }

  // Cache-first for our app shell
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req))
  );
});