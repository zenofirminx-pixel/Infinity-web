const CACHE_NAME = 'pal-app-v3';
const URLS_TO_CACHE = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(names => Promise.all(names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/') || url.hostname.includes('aur-x-backend.vercel.app')) {
    event.respondWith(fetch(event.request));
    return;
  }
  if (event.request.method !== 'GET') return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response && response.status === 200 && response.type === 'basic') {
      const copy = response.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    }
    return response;
  })).catch(() => event.request.destination === 'document' ? caches.match('/index.html') : undefined));
});
