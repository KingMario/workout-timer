import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const BASE_PATH = '/workout-timer';
const PUBLIC_DIR = path.join(ROOT, 'public');
const PUBLIC_SW_PATH = path.join(PUBLIC_DIR, 'sw.js');
const OUT_DIR = path.join(ROOT, 'out');
const VERSION_INPUTS = [
  'package.json',
  'next.config.ts',
  'src/app/page.tsx',
  'src/app/layout.tsx',
  'src/hooks/useAudio.ts',
  'src/components/WorkoutTab.tsx',
  'src/components/PeriodicTab.tsx',
];

const args = new Set(process.argv.slice(2));

const toPublicUrl = (relativePath) =>
  `${BASE_PATH}/${relativePath.split(path.sep).join('/')}`;

const listFiles = (dir, predicate = () => true) => {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const results = [];
  const walk = (currentDir) => {
    for (const entry of fs.readdirSync(currentDir, { withFileTypes: true })) {
      const entryPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(entryPath);
      } else if (entry.isFile() && predicate(entryPath)) {
        results.push(entryPath);
      }
    }
  };

  walk(dir);
  return results.sort();
};

const getFileStamp = (filePath) => {
  const stat = fs.statSync(filePath);
  return `${path.relative(ROOT, filePath)}:${stat.size}:${Math.floor(
    stat.mtimeMs,
  )}`;
};

const getCacheVersion = () => {
  const stamps = [];
  for (const relativePath of VERSION_INPUTS) {
    const filePath = path.join(ROOT, relativePath);
    if (fs.existsSync(filePath)) {
      stamps.push(getFileStamp(filePath));
    }
  }
  const audioDir = path.join(PUBLIC_DIR, 'audio/built-in-plans/yunxi');
  for (const filePath of listFiles(audioDir, (entryPath) =>
    entryPath.endsWith('.mp3'),
  )) {
    stamps.push(getFileStamp(filePath));
  }

  let hash = 0;
  for (const char of stamps.join('|')) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return `v${hash.toString(16)}`;
};

const getPublicPrecacheUrls = () => {
  const urls = new Set([
    `${BASE_PATH}/`,
    `${BASE_PATH}/disclaimer`,
    `${BASE_PATH}/favicon.ico`,
    `${BASE_PATH}/icon.svg`,
    `${BASE_PATH}/icon-192.png`,
    `${BASE_PATH}/icon-512.png`,
    `${BASE_PATH}/manifest.webmanifest`,
  ]);

  return [...urls].sort();
};

const getOutPrecacheUrls = () => {
  if (!fs.existsSync(OUT_DIR)) {
    return [];
  }

  const staticFileExtensions = new Set([
    '.css',
    '.html',
    '.ico',
    '.js',
    '.json',
    '.png',
    '.svg',
    '.txt',
    '.webmanifest',
    '.woff',
    '.woff2',
  ]);

  return listFiles(OUT_DIR, (entryPath) => {
    const relativePath = path.relative(OUT_DIR, entryPath);
    if (
      /^audio\/built-in-plans\/yunxi\/audit\.(?:json|md)$/.test(relativePath)
    ) {
      return false;
    }
    return staticFileExtensions.has(path.extname(entryPath));
  }).map((filePath) => toPublicUrl(path.relative(OUT_DIR, filePath)));
};

const generateServiceWorker = ({ includeOutAssets }) => {
  const precacheUrls = new Set(getPublicPrecacheUrls());
  if (includeOutAssets) {
    for (const url of getOutPrecacheUrls()) {
      precacheUrls.add(url);
    }
  }

  const cacheVersion = getCacheVersion();
  const body = `const CACHE_VERSION = ${JSON.stringify(cacheVersion)};
const APP_CACHE = \`workout-timer-app-\${CACHE_VERSION}\`;
const RUNTIME_CACHE = \`workout-timer-runtime-\${CACHE_VERSION}\`;
const BASE_PATH = ${JSON.stringify(BASE_PATH)};
const PRECACHE_URLS = ${JSON.stringify([...precacheUrls].sort(), null, 2)};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(APP_CACHE)
      .then((cache) =>
        cache.addAll(PRECACHE_URLS.map((url) => new Request(url, { cache: 'reload' }))),
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
            .filter((key) =>
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

const isAppRequest = (url) => url.origin === self.location.origin && url.pathname.startsWith(BASE_PATH);
const isCacheableAsset = (url) =>
  isAppRequest(url) &&
  (url.pathname.includes('/_next/static/') ||
    url.pathname.includes('/audio/built-in-plans/') ||
    /\\.(?:css|ico|js|json|mp3|png|svg|txt|webmanifest|woff2?)$/.test(url.pathname));

const cacheFirst = async (request) => {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response.status === 200) {
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
    return cached || caches.match(\`\${BASE_PATH}/\`);
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
`;

  return `${body.trimEnd()}\n`;
};

const publicServiceWorker = generateServiceWorker({ includeOutAssets: false });
fs.writeFileSync(PUBLIC_SW_PATH, publicServiceWorker);
process.stdout.write(`Generated ${path.relative(ROOT, PUBLIC_SW_PATH)}\n`);

if (args.has('--out')) {
  if (!fs.existsSync(OUT_DIR)) {
    throw new Error(
      `Cannot write out service worker: ${OUT_DIR} does not exist`,
    );
  }
  const outServiceWorker = generateServiceWorker({ includeOutAssets: true });
  const outSwPath = path.join(OUT_DIR, 'sw.js');
  fs.writeFileSync(outSwPath, outServiceWorker);
  process.stdout.write(`Generated ${path.relative(ROOT, outSwPath)}\n`);
}
