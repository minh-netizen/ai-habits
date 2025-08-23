// public/sw.js
const CACHE = 'ai-habits-v1';
const OFFLINE_URL = '/offline';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    self.skipWaiting();
    const cache = await caches.open(CACHE);
    await cache.addAll([
      OFFLINE_URL,
      '/manifest.webmanifest',
      '/icons/icon-192.png',
      '/icons/icon-512.png',
      '/icons/maskable-192.png',
      '/icons/maskable-512.png',
    ]);
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // cleanup old caches
    const keys = await caches.keys();
    await Promise.all(keys.map(k => (k === CACHE ? null : caches.delete(k))));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // HTML navigations: network-first, fallback to cache, then /offline
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    event.respondWith((async () => {
      try {
        const net = await fetch(req);
        const cache = await caches.open(CACHE);
        cache.put(req, net.clone());
        return net;
      } catch {
        const cached = await caches.match(req);
        return cached || caches.match(OFFLINE_URL);
      }
    })());
    return;
  }

  // Static assets: stale-while-revalidate
  const url = new URL(req.url);
  if (/\.(?:js|css|png|jpg|jpeg|svg|gif|webp|ico|woff2?)$/.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      const fetchPromise = fetch(req).then((res) => {
        cache.put(req, res.clone());
        return res;
      }).catch(() => cached);
      return cached || fetchPromise;
    })());
  }
});
