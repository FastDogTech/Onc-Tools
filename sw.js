const CACHE_NAME = 'onc-tools-v1';

const PRECACHE_URLS = [
  'index.html',
  'bsa.html',
  'auc.html',
  'weight.html',
  'misc.html',
  'anc.html',
  'calcium.html',
  'gfr.html',
  'date-finder.html',
  'settings.html',
  'css/style.css',
  'js/state.js',
  'js/ui.js',
  'js/calculators.js',
  'manifest.json',
  'img/favicon-32.png',
  'img/apple-touch-icon.png',
  'img/icon-192.png',
  'img/icon-512.png',
  'img/onctoolslogo-96.png',
  'img/fastdoglogo-240.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
