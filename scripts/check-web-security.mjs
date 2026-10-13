import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const policy = config.headers.flatMap(rule => rule.headers).find(header => header.key === 'Content-Security-Policy')?.value ?? '';
const scripts = policy.split(';').find(part => part.trim().startsWith('script-src ')) ?? '';
if (scripts.includes("'unsafe-inline'") || scripts.includes("'unsafe-eval'") || !policy.includes("frame-ancestors 'none'")) throw new Error('Unsafe script or framing policy.');
if (!scripts.includes('https://apis.google.com') || !policy.includes('frame-src https://*.firebaseapp.com')) throw new Error('Firebase popup sign-in requires its official gapi loader and isolated auth frame.');
const root = process.argv[2] ? pathToFileURL(resolve(process.argv[2]) + '/') : new URL('../dist/', import.meta.url);
let pages = 0;
for (const filename of readdirSync(root, { recursive: true })) {
  if (/(?:^|\/)\.env|\.(?:p8|pem|key|mobileprovision)$/.test(filename)) throw new Error('A private configuration file was exported.');
  if (!filename.endsWith('.html')) continue;
  pages++;
  const html = readFileSync(new URL(filename, root), 'utf8');
  for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (!match[2].trim()) continue;
    if (/type=["']application\/ld\+json["']/.test(match[1])) { JSON.parse(match[2]); continue; }
    const hash = createHash('sha256').update(match[2]).digest('base64');
    if (!scripts.includes(`'sha256-${hash}'`)) throw new Error(`Unapproved inline script in ${filename}. Review its content and update the CSP hash before release.`);
  }
}
if (!pages) throw new Error('No exported pages found.');
console.log(`Security headers and inline script hashes verified for ${pages} pages.`);
