// service-worker.js
// Subpath-safe SW; fresh HTML on navigations; simple precache.
(() => {
  const VERSION = 'v12';
  const SCOPE_PATH = new URL(self.registration.scope).pathname.replace(/\/$/, '');
  const BASE = SCOPE_PATH === '' ? '/' : SCOPE_PATH + '/';
  const CACHE_NAME = `victoria-nurse-${VERSION}`;

  const ASSETS = [
    `${BASE}`,
    `${BASE}index.html`,
    // (No landing image anymore)
  ];

  self.addEventListener('install', (evt) => {
    self.skipWaiting();
    evt.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
  });

  self.addEventListener('activate', (evt) => {
    evt.waitUntil(
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME && k.startsWith('victoria-nurse-'))
            .map((k) => caches.delete(k))
        )
      ).then(() => self.clients.claim())
    );
  });

  // Navigations: network-first with no-store; fallback to cached index.
  // Static ASSETS: cache-first; others: cache, else network.
  self.addEventListener('fetch', (evt) => {
    const req = evt.request;
    const url = new URL(req.url);

    if (req.mode === 'navigate') {
      evt.respondWith(
        fetch(req, { cache: 'no-store' }).catch(() => caches.match(`${BASE}index.html`))
      );
      return;
    }

    const isStatic = ASSETS.includes(url.pathname);
    if (isStatic) {
      evt.respondWith(caches.match(req).then((r) => r || fetch(req)));
      return;
    }

    evt.respondWith(caches.match(req).then((r) => r || fetch(req)));
  });
})();
