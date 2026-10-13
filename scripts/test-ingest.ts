import assert from 'node:assert/strict';
import handler from '../api/ingest';

let statusCode = 200;
let payload: unknown;
const response = {
  status(code: number) { statusCode = code; return this; },
  setHeader() {},
  json(body: unknown) { payload = body; },
};

await handler({
  method: 'GET',
  query: { url: 'https://arxiv.org/pdf/1706.03762' },
  headers: { 'x-vercel-id': 'local-ingestion-smoke-test' },
}, response);

assert.equal(statusCode, 200, JSON.stringify(payload));
const result = payload as { text?: string; pages?: number; warnings?: string[] };
assert.match(result.text ?? '', /Attention Is All You Need/i);
assert.ok((result.pages ?? 0) >= 10);
assert.ok(result.warnings?.some((warning) => /PDF reading order/i.test(warning)));
console.log(`PDF ingestion smoke test passed (${result.pages} pages; ${result.text?.length ?? 0} characters).`);
