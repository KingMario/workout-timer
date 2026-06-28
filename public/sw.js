const CACHE_VERSION = 'vcb8bbde4';
const APP_CACHE = `workout-timer-app-${CACHE_VERSION}`;
const RUNTIME_CACHE = `workout-timer-runtime-${CACHE_VERSION}`;
const BASE_PATH = '/workout-timer';
const PRECACHE_URLS = [
  '/workout-timer/',
  '/workout-timer/disclaimer',
  '/workout-timer/favicon.ico',
  '/workout-timer/icon-192.png',
  '/workout-timer/icon-512.png',
  '/workout-timer/icon.svg',
  '/workout-timer/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_CACHE)
      .then((cache) =>
        cache.addAll(
          PRECACHE_URLS.map((url) => new Request(url, { cache: 'reload' })),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key.startsWith('workout-timer-') &&
                key !== APP_CACHE &&
                key !== RUNTIME_CACHE,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

const isAppRequest = (url) =>
  url.origin === self.location.origin && url.pathname.startsWith(BASE_PATH);
const isCacheableAsset = (url) =>
  isAppRequest(url) &&
  (url.pathname.includes('/_next/static/') ||
    url.pathname.includes('/audio/built-in-plans/') ||
    /\.(?:css|ico|js|json|mp3|png|svg|txt|webmanifest|woff2?)$/.test(
      url.pathname,
    ));

const cacheFirst = async (request) => {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, response.clone());
  }
  return response;
};

const networkFirstNavigation = async (request) => {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || caches.match(`${BASE_PATH}/`);
  }
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  if (!isAppRequest(url)) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isCacheableAsset(url)) {
    event.respondWith(cacheFirst(request));
  }
});
