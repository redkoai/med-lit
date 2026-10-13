import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('web and native headers use the configured app icon, not a substitute glyph', () => {
  const { expo } = JSON.parse(read('app.json'));
  assert.equal(expo.icon, './assets/icon.png');
  assert.match(read('src/components/BrandMark.tsx'), /require\('\.\.\/\.\.\/assets\/icon\.png'\)/);
  for (const file of ['WorkspaceHeader.tsx', 'WorkspaceHeader.native.tsx']) {
    const source = read(`src/components/${file}`);
    assert.match(source, /<BrandMark\s*\/>/);
    assert.doesNotMatch(source, /reader-outline/);
    assert.match(source, /accessibilityLabel="MedLit home"/);
  }
});

test('favicon and home-screen metadata use the reviewed app-icon exports', () => {
  const html = read('app/+html.tsx');
  assert.match(html, /rel="icon" href="\/icon-192\.png\?v=/);
  assert.match(html, /rel="apple-touch-icon" href="\/apple-touch-icon\.png\?v=/);
  assert.doesNotMatch(html, /favicon\.svg/);
  const manifest = JSON.parse(read('public/site.webmanifest'));
  assert.deepEqual(manifest.icons.map((icon: { sizes: string }) => icon.sizes), ['192x192', '512x512']);
  for (const icon of manifest.icons) {
    const pathname = new URL(icon.src, 'https://medlit.test').pathname;
    assert.match(pathname, /^\/icon-(192|512)\.png$/);
    const bytes = readFileSync(new URL(`../public${pathname}`, import.meta.url));
    assert.equal(`${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`, icon.sizes);
    assert.equal(icon.type, 'image/png');
    assert.equal(icon.purpose, 'any'); // Existing artwork is not a maskable-safe export.
  }
});
