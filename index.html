// service-worker.js
// Subpath-safe SW with strict HTML freshness and cache versioning.
(() => {
  const VERSION = 'v11';
  const SCOPE_PATH = new URL(self.registration.scope).pathname.replace(/\/$/, '');
  const BASE = SCOPE_PATH === '' ? '/' : SCOPE_PATH + '/';
  const CACHE_NAME = `victoria-nurse-${VERSION}`;

  const ASSETS = [
    `${BASE}`,
    `${BASE}index.html`,
    `${BASE}assets/nurse-hero.jpg`,
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

  // Navigations: network-first (no-store) so HTML is always fresh; fallback to cached index
  // Static ASSETS: cache-first
  // Others: cache, else network
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
