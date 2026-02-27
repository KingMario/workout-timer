#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports, no-console */
const fs = require('fs');
const path = require('path');

const siteUrl =
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://example.com';
const pagesDir = path.join(process.cwd(), 'src', 'app');
const outSitemap = path.join(process.cwd(), 'public', 'sitemap.xml');
const outRobots = path.join(process.cwd(), 'public', 'robots.txt');

function walk(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const res = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(res, files);
    } else {
      files.push(res);
    }
  }
  return files;
}

const pageFiles = walk(pagesDir).filter((f) =>
  /page\.(tsx|ts|js|jsx)$/.test(f),
);
const urls = new Set();

for (const f of pageFiles) {
  let rel = path.relative(pagesDir, f).replace(/\\/g, '/');
  // remove trailing page.(tsx|js) — root page has no leading slash
  rel = rel.replace(/^page\.(tsx|ts|js|jsx)$/, '');
  rel = rel.replace(/\/page\.(tsx|ts|js|jsx)$/, '');
  // remove /index
  rel = rel.replace(/\/index$/, '');
  let route = '/' + rel;
  route = route.replace(/\/+/g, '/');
  route = route.replace(/\/\/$/, '/');
  if (route === '/.') {
    route = '/';
  }
  route = route.replace(/\/.$/, '/');
  route = route.replace(/\/\/$/, '/');
  if (route === '/') {
    urls.add(siteUrl.replace(/\/$/, '') + '/');
  } else {
    urls.add(siteUrl.replace(/\/$/, '') + route);
  }
}

// Always include root
urls.add(siteUrl.replace(/\/$/, '') + '/');

const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
const urlsetOpen =
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
const urlsetClose = '\n</urlset>';

const urlEntries = Array.from(urls).map((u) => {
  return `  <url>\n    <loc>${u}</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n  </url>`;
});

const sitemap = xmlHeader + urlsetOpen + urlEntries.join('\n') + urlsetClose;

fs.mkdirSync(path.dirname(outSitemap), { recursive: true });
fs.writeFileSync(outSitemap, sitemap, 'utf8');
console.log('Wrote sitemap to', outSitemap);

const robots = `User-agent: *\nAllow: /\nSitemap: ${siteUrl.replace(/\/$/, '')}/sitemap.xml\n`;
fs.writeFileSync(outRobots, robots, 'utf8');
console.log('Wrote robots.txt to', outRobots);

process.exit(0);
