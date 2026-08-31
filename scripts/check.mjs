import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, relative, join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import postcss from 'postcss';

const output = fileURLToPath(new URL('../_site/', import.meta.url));
const prefix = `/${(process.env.PATH_PREFIX || '').replace(/^\/+|\/+$/g, '')}/`.replace('//', '/');
const origin = process.env.SITE_URL || 'http://localhost:8080';
const errors = [];
const files = [];
function walk(dir) { for (const file of readdirSync(dir)) { const path = join(dir, file); if (statSync(path).isDirectory()) walk(path); else files.push(path); } }
walk(output);

function resolveTarget(value, from) {
  const url = new URL(value.replaceAll('&amp;', '&'), new URL(`${prefix}${relative(output, from)}`, origin));
  if (url.origin !== new URL(origin).origin) return null;
  if (!url.pathname.startsWith(prefix)) { errors.push(`${relative(output, from)}: link escapes the deployment prefix: ${value}`); return null; }
  const path = resolve(output, decodeURIComponent(url.pathname.slice(prefix.length)));
  return existsSync(path) && statSync(path).isDirectory() ? join(path, 'index.html') : path;
}

for (const file of files.filter(file => extname(file) === '.html')) {
  const html = readFileSync(file, 'utf8');
  const name = relative(output, file).replace(/\\/g, '/');
  if (!/<h1[\s>]/.test(html)) errors.push(`${name}: missing h1`);
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${name}: missing title`);
  if (!/<meta name="description" content="[^"]+"/.test(html)) errors.push(`${name}: missing description`);
  if (/\{\{|\{%/.test(html)) errors.push(`${name}: unrendered template markup`);
  const canonical = html.match(/rel="canonical" href="([^"]+)"/);
  if (!canonical || !canonical[1].startsWith(new URL(prefix, origin).href)) errors.push(`${name}: incorrect canonical URL`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const value = match[1];
    if (/^(#|mailto:|tel:|data:)/.test(value)) continue;
    const target = resolveTarget(value, file);
    if (target && !existsSync(target)) errors.push(`${name}: broken link ${value}`);
  }
  for (const match of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt="[^"]*"/.test(match[0])) errors.push(`${name}: image without alt text`);
  if (name.startsWith('journal/')) {
    const title = html.match(/<h1>([^<]+)<\/h1>/)?.[1];
    const ogTitle = html.match(/property="og:title" content="([^"]+)"/)?.[1];
    if (title !== ogTitle) errors.push(`${name}: social title differs from the entry title`);
  }
}

const cssPath = join(output, 'assets/styles.css');
const css = readFileSync(cssPath, 'utf8');
// Fail on malformed CSS as well as missing assets. A copied stylesheet can
// otherwise pass the static build while silently dropping entire page layouts.
postcss.parse(css, { from: cssPath, map: false });
for (const match of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) {
  if (/^(data:|https?:)/.test(match[1])) continue;
  const target = resolveTarget(match[1], cssPath);
  if (target && !existsSync(target)) errors.push(`styles.css: missing asset ${match[1]}`);
}

assert(existsSync(join(output, '.nojekyll')), 'Missing .nojekyll');
assert(existsSync(join(output, '404.html')), 'Missing custom 404');
const posts = files.filter(file => relative(output, file).replace(/\\/g, '/').startsWith('journal/') && extname(file) === '.html');
const feed = readFileSync(join(output, 'feed.xml'), 'utf8');
assert.equal((feed.match(/<entry>/g) || []).length, posts.length, 'Feed must contain every published post');
assert(feed.trimStart().startsWith('<?xml'), 'Feed must begin with its XML declaration');
for (const file of ['feed.xml', 'sitemap.xml']) {
  const content = readFileSync(join(output, file), 'utf8');
  if (process.env.SITE_URL && content.includes('http://localhost')) errors.push(`${file}: localhost URL in production output`);
}
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Verified ${files.filter(file => extname(file) === '.html').length} HTML pages, ${posts.length} posts, CSS syntax, local links and assets, metadata, RSS, and GitHub Pages paths (${prefix}).`);
