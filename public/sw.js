const CACHE_VERSION = 'v4cae7946';
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

const createRangeResponse = async (request, response) => {
  const range = request.headers.get('range');
  if (!range) {
    return response;
  }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match) {
    return response;
  }

  const buffer = await response.arrayBuffer();
  const size = buffer.byteLength;
  let start = match[1] ? Number(match[1]) : 0;
  let end = match[2] ? Number(match[2]) : size - 1;

  if (!match[1] && match[2]) {
    const suffixLength = Number(match[2]);
    start = Math.max(size - suffixLength, 0);
    end = size - 1;
  }

  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    start < 0 ||
    end < start ||
    start >= size
  ) {
    return new Response(null, {
      status: 416,
      statusText: 'Range Not Satisfiable',
      headers: {
        'Accept-Ranges': 'bytes',
        'Content-Range': `bytes */${size}`,
      },
    });
  }

  end = Math.min(end, size - 1);
  const body = buffer.slice(start, end + 1);
  const headers = new Headers(response.headers);
  headers.set('Accept-Ranges', 'bytes');
  headers.set('Content-Length', String(body.byteLength));
  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);

  return new Response(body, {
    status: 206,
    statusText: 'Partial Content',
    headers,
  });
};

const cacheFirst = async (request) => {
  const cached = await caches.match(request.url);
  if (cached) {
    return createRangeResponse(request, cached);
  }

  const response = await fetch(request);
  if (response.status === 200 && !request.headers.has('range')) {
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.put(request, response.clone());
  }
  return response;
};

const networkFirstNavigation = async (request) => {
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      await cache.put(request, response.clone());
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
