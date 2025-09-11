const STATIC_CACHE='static-light-v1';
const PRECACHE=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(STATIC_CACHE).then(c=>c.addAll(PRECACHE)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==STATIC_CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.mode==='navigate'){e.respondWith(fetch(req,{cache:'no-store'}).catch(()=>caches.match('./index.html')));return;}
  if(/\.(png|svg|ico|css|js|json|webmanifest)$/i.test(new URL(req.url).pathname)){
    e.respondWith(caches.open(STATIC_CACHE).then(async cache=>{const cached=await cache.match(req);if(cached)return cached;const res=await fetch(req,{cache:'no-store'});cache.put(req,res.clone());return res;}));
    return;
  }
  e.respondWith(fetch(req,{cache:'no-store'}));
});
