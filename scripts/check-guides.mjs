import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const guides = JSON.parse(readFileSync('public/guides.json', 'utf8'));
const sitemap = readFileSync('dist/sitemap.xml', 'utf8');
const index = readFileSync('dist/guides/index.html', 'utf8');
for (const guide of guides) {
 const path = `/guides/${guide.slug}`;
 const html = readFileSync(`dist${path}.html`, 'utf8');
 assert(html.includes(`https://medlit-evidence-appraisal.vercel.app${path}`), `Missing canonical: ${path}`);
 assert(html.includes(guide.title.replaceAll('&','&amp;')), `Missing visible title: ${path}`);
 assert(index.includes(`href="${path}"`), `Missing crawlable index link: ${path}`);
 assert(sitemap.includes(`${path}</loc>`), `Missing sitemap entry: ${path}`);
 assert(!html.includes('content="noindex, nofollow"'), `Public guide blocked: ${path}`);
 for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) JSON.parse(match[1]);
 for (const source of guide.sources) {
  if (source.url.startsWith('/templates/')) assert(existsSync(`dist${source.url}`), `Missing download: ${source.url}`);
 }
}
assert(readFileSync('dist/index.html','utf8').includes('class="ml-home"'), 'Terminal homepage was not exported');
assert(existsSync('dist/fonts/ibm-plex-mono-500.ttf'), 'Local headline font missing');
console.log(`Verified ${guides.length} static guides, sitemap, canonical references, schema, downloads and homepage assets.`);
