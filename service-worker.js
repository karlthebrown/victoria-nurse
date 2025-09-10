// service-worker.js
// Subpath-safe SW; fresh HTML on navigations; precache index + icons.
(() => {
  const VERSION = 'v13';
  const SCOPE_PATH = new URL(self.registration.scope).pathname.replace(/\/$/, '');
  const BASE = SCOPE_PATH === '' ? '/' : SCOPE_PATH + '/';
  const CACHE_NAME = `victoria-nurse-${VERSION}`;

  const ASSETS = [
    `${BASE}`,
    `${BASE}index.html`,
    `${BASE}icons/icon-192.png`,
    `${BASE}icons/icon-512.png`,
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

  // Navigations: always try network first (no-store), fallback to cached index
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
