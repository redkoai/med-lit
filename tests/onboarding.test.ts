import test from 'node:test';
import assert from 'node:assert/strict';
import { prepareOpenRouterLogin, finishOpenRouterLogin, OPENROUTER_PENDING_KEY } from '../src/services/openRouterAuth';
import { readLibrary, updateLibrary, libraryKey } from '../src/services/libraryStorage';
import { createExampleAppraisal } from '../src/services/exampleAppraisal';
import { appraisalScore } from '../src/services/appraisalScore';
import { eventProperties, captureEvent } from '../src/services/productAnalytics';
import { analyzeArticle } from '../src/services/aiAnalyzer';
import { fixtureArticle, fixtureIdentifier, fixtureModelOutput } from './testFixture';

function storage() { const data = new Map<string, string>(); return { data, getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); }, removeItem: (key: string) => { data.delete(key); } }; }
const origin = 'https://medlit-evidence-appraisal.vercel.app';
test('OpenRouter uses S256 PKCE and never stores the returned API key', async () => {
  const store = storage();
  const auth = new URL(await prepareOpenRouterLogin(origin, store, '10.1234/test', 100));
  assert.equal(auth.origin, 'https://openrouter.ai');
  assert.equal(auth.searchParams.get('code_challenge_method'), 'S256');
  const pending = JSON.parse(store.getItem(OPENROUTER_PENDING_KEY)!);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pending.verifier));
  assert.equal(auth.searchParams.get('code_challenge'), Buffer.from(digest).toString('base64url'));
  const callback = new URL(auth.searchParams.get('callback_url')!);
  callback.searchParams.set('code', 'one-use-test-code');
  let called = 0;
  const mock = async (url: string | URL | Request, init?: RequestInit) => {
    called++; assert.equal(url, 'https://openrouter.ai/api/v1/auth/keys');
    assert.equal(init?.credentials, 'omit'); assert.equal(init?.redirect, 'error');
    assert.equal(JSON.parse(String(init?.body)).code_verifier, pending.verifier);
    assert.equal(store.getItem(OPENROUTER_PENDING_KEY), null);
    return Response.json({ key: 'sk-or-v1-' + 'x'.repeat(64) });
  };
  const result = await finishOpenRouterLogin(callback.href, origin, store, mock as typeof fetch, 101);
  assert.equal(result.article, '10.1234/test'); assert.equal(called, 1);
  assert.equal(store.data.size, 0);
  await assert.rejects(finishOpenRouterLogin(callback.href, origin, store, mock as typeof fetch, 102), /already used/);
});
test('OpenRouter rejects stale, mismatched, duplicate, and foreign callback state before exchange', async () => {
  for (const scenario of ['stale', 'state', 'duplicate', 'foreign', 'denied']) {
    const store = storage(); const auth = new URL(await prepareOpenRouterLogin(origin, store, '', 100));
    const callback = new URL(auth.searchParams.get('callback_url')!); callback.searchParams.set('code', 'test');
    if (scenario === 'state') callback.searchParams.set('state', 'incorrect');
    if (scenario === 'duplicate') callback.searchParams.append('code', 'again');
    if (scenario === 'foreign') callback.hostname = 'example.com';
    if (scenario === 'denied') callback.searchParams.set('error', 'denied');
    let calls = 0;
    await assert.rejects(finishOpenRouterLogin(callback.href, origin, store, (async () => { calls++; return Response.json({}); }) as typeof fetch, scenario === 'stale' ? 900000 : 101));
    assert.equal(calls, 0);
  }
  await assert.rejects(prepareOpenRouterLogin('http://example.com', storage()), /HTTPS/);
});
test('provider failure bodies are never included in OAuth errors', async () => {
  const store = storage(); const auth = new URL(await prepareOpenRouterLogin(origin, store));
  const callback = new URL(auth.searchParams.get('callback_url')!); callback.searchParams.set('code', 'test');
  await assert.rejects(finishOpenRouterLogin(callback.href, origin, store, (async () => new Response('sensitive upstream detail', { status: 401 })) as typeof fetch), error => !String(error).includes('sensitive upstream detail'));
});
test('guest and signed-in libraries remain separate and concurrent saves do not overwrite one another', async () => {
  const data = new Map<string, string>(); const store = { getItem: async (k: string) => data.get(k) ?? null, setItem: async (k: string, v: string) => { data.set(k, v); } };
  const example = createExampleAppraisal();
  await updateLibrary(store, null, () => [{ ...example, id: 'guest' }]);
  assert.deepEqual(await readLibrary(store, 'alice'), []);
  await Promise.all(['a', 'b', 'c'].map(id => updateLibrary(store, 'alice', items => [...items, { ...example, id }])));
  assert.equal((await readLibrary(store, 'alice')).length, 3);
  assert.equal((await readLibrary(store, null))[0].id, 'guest');
  assert.deepEqual(await readLibrary(store, 'bob'), []);
  await updateLibrary(store, 'alice', () => []);
  assert.equal((await readLibrary(store, null)).length, 1);
  assert.notEqual(libraryKey('alice'), libraryKey('bob'));
});
test('displayed score and validator use the same formula without changing v4.1 results', () => {
  const a = createExampleAppraisal();
  assert.equal(appraisalScore(a.appraisal.sourceCoverage.level, a.appraisal.evidence, a.appraisal.judgments).score, a.evidenceScore.score);
  assert.equal(appraisalScore('full_text', [], [{ judgment: 'unclear' }]).score, 3);
  assert.equal(appraisalScore('full_text', [{ verified: true }], [{ judgment: 'high' }]).score, 10); // traceability != low bias
});
test('analytics drop arbitrary properties and remain inert without configuration and consent', async () => {
  const clean = eventProperties({ provider: 'openrouter', coverage: 'full_text', email: 'private@example.com', key: 'secret', url: 'https://private/', paper: 'confidential', notes: 'private', '$current_url': 'secret' });
  assert.deepEqual(Object.keys(clean).sort(), ['$geoip_disable', '$process_person_profile', 'coverage', 'provider'].sort());
  assert.equal(eventProperties({ provider: 'https://secret.example' }).provider, undefined);
  await captureEvent('appraisal_completed', { key: 'must-not-send' });
});
test('OpenRouter generation uses the selected fixed endpoint and ordinary evidence validation', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    assert.equal(url, 'https://openrouter.ai/api/v1/chat/completions');
    assert.equal(init?.credentials, 'omit'); assert.equal(init?.redirect, 'error');
    const body = JSON.parse(String(init?.body));
    assert.equal(body.model, 'openai/gpt-4.1-mini');
    assert.deepEqual(body.response_format, { type: 'json_object' });
    return Response.json({ choices: [{ message: { content: JSON.stringify(fixtureModelOutput) } }] });
  };
  try {
    const report = await analyzeArticle(fixtureArticle, fixtureIdentifier, 'openrouter', 'sk-or-v1-synthetic-unit-test-key', 'openai/gpt-4.1-mini');
    assert.equal(report.analysisModel, 'openrouter/openai/gpt-4.1-mini');
    assert.equal(report.appraisal.judgments.find(j => j.id === 'rct.selection')?.judgment, 'unclear');
  } finally { globalThis.fetch = original; }
});
