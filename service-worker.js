/* Victoria Nurse — Service Worker (v42) */
const CACHE_NAME = 'victoria-nurse-v42';

const ASSETS = [
  './',

  // HTML
  './index.html',
  './index.html?v=2025-09-17-42',
  './app.html',
  './app.html?v=2025-09-17-42',   // <-- updated to v42

  // PWA manifest & icons (v42)
  './manifest.webmanifest?v=2025-09-17-42',   // <-- updated to v42
  './icons/icon-192.png?v=2025-09-17-42',     // <-- updated to v42
  './icons/icon-512.png?v=2025-09-17-42',     // <-- updated to v42
  './icons/icon-180.png?v=2025-09-17-42',     // <-- updated to v42
  './icons/favicon.png?v=2025-09-17-42',      // <-- updated to v42

  // Logo/hero image (kept at v35 – image unchanged)
  './images/welcome-victoria-nurse-medical.png',
  './images/welcome-victoria-nurse-medical.png?v=2025-09-17-35'
];

// (rest of your SW v42 code stays exactly the same)