import assert from 'node:assert/strict';
import test from 'node:test';
import { isAllowedSourceUrl } from '../api/fetch';
import { fetchAllowedSource } from '../src/services/sourcePolicy';

test('source proxy accepts only HTTPS requests to supported scientific hosts', () => {
  assert.equal(isAllowedSourceUrl('https://pubmed.ncbi.nlm.nih.gov/26551272/'), true);
  assert.equal(isAllowedSourceUrl('https://api.crossref.org/works/10.1000/example'), true);
  assert.equal(isAllowedSourceUrl('http://pubmed.ncbi.nlm.nih.gov/26551272/'), false);
  assert.equal(isAllowedSourceUrl('https://example.com/article'), false);
});

test('source proxy blocks hostname-confusion and private-network targets', () => {
  assert.equal(isAllowedSourceUrl('https://ncbi.nlm.nih.gov.attacker.example/'), false);
  assert.equal(isAllowedSourceUrl('https://127.0.0.1/'), false);
  assert.equal(isAllowedSourceUrl('https://localhost/'), false);
  assert.equal(isAllowedSourceUrl('not a url'), false);
});

test('redirect destinations are validated before they are contacted', async () => {
  const originalFetch = globalThis.fetch;
  const contacted: string[] = [];
  globalThis.fetch = (async (input: string | URL | Request) => {
    contacted.push(String(input));
    return new Response(null, { status: 302, headers: { location: 'http://127.0.0.1/private' } });
  }) as typeof fetch;
  try {
    await assert.rejects(
      fetchAllowedSource('https://pubmed.ncbi.nlm.nih.gov/26551272/', {}),
      /redirect left the allowlist/,
    );
    assert.deepEqual(contacted, ['https://pubmed.ncbi.nlm.nih.gov/26551272/']);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
