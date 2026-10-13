import assert from 'node:assert/strict';
import test from 'node:test';
import { validateKeyFormat } from '../src/constants/providers';
import { checkProviderConnection } from '../src/services/providerConnection';
import { createChatPacket, importChatResponse } from '../src/services/chatHandoff';
import { fixtureArticle, fixtureIdentifier, fixtureModelOutput } from './testFixture';

test('rejects passwords and wrong-provider keys before making a request', async () => {
  assert.match(validateKeyFormat('openai', 'my-chat-password') ?? '', /API key/);
  assert.match(validateKeyFormat('claude', 'sk-example-test-placeholder') ?? '', /Anthropic/);
  assert.match(validateKeyFormat('openai', 'sk-ant-synthetic-placeholder') ?? '', /Choose Claude/);
  const original = globalThis.fetch;
  let called = false;
  globalThis.fetch = async () => { called = true; return new Response('{}'); };
  try { await assert.rejects(checkProviderConnection('openai', 'invalid')); assert.equal(called, false); }
  finally { globalThis.fetch = original; }
});

test('connection check uses a fixed host, headers, and rejects redirects without sending article content', async () => {
  const original = globalThis.fetch;
  const syntheticKey = 'AIza-synthetic-test-not-a-real-key';
  globalThis.fetch = async (input, init) => {
    assert.equal(new URL(String(input)).hostname, 'generativelanguage.googleapis.com');
    assert.ok(!String(input).includes(syntheticKey));
    assert.equal((init?.headers as Record<string, string>)['x-goog-api-key'], syntheticKey);
    assert.equal(init?.credentials, 'omit');
    assert.equal(init?.redirect, 'error');
    assert.equal(init?.body, undefined);
    return new Response('{}', { status: 200 });
  };
  try { await checkProviderConnection('gemini', syntheticKey); }
  finally { globalThis.fetch = original; }
});

test('provider errors do not echo the provider response body or key', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response('sensitive-provider-response', { status: 401 });
  try { await assert.rejects(checkProviderConnection('openai', 'sk-synthetic-test-not-a-real-key'), error => error instanceof Error && !error.message.includes('sensitive') && /not accepted/.test(error.message)); }
  finally { globalThis.fetch = original; }
});

test('external-chat responses must match their source packet and pass ordinary evidence validation', () => {
  const packet = createChatPacket(fixtureArticle, fixtureIdentifier);
  assert.match(packet.prompt, /medlitPacketId/);
  assert.throws(() => importChatResponse(JSON.stringify(fixtureModelOutput), packet), /does not match/);
  const analysis = importChatResponse(JSON.stringify({ ...fixtureModelOutput, medlitPacketId: packet.id }), packet);
  assert.equal(analysis.appraisal.judgments.find(item => item.id === 'rct.selection')?.judgment, 'unclear');
  assert.match(analysis.limitations.at(-1) ?? '', /cannot verify the model/);
});

test('a handoff cannot verify passages omitted from the exported text', () => {
  const packet = createChatPacket({ ...fixtureArticle, fullText: 'x'.repeat(61000) + 'Secret unshared passage at the end.' }, fixtureIdentifier);
  assert.equal(packet.article.fullText?.length, 60000);
  const result = importChatResponse(JSON.stringify({ ...fixtureModelOutput, medlitPacketId: packet.id, evidence: [{ id: 'excluded', quote: 'Secret unshared passage at the end.' }] }), packet);
  assert.equal(result.appraisal.evidence[0]?.verified, false);
  assert.ok(packet.article.retrievalWarnings?.some(item => item.includes('60,000')));
});

test('metadata-only sources cannot bypass the appraisal gate through handoff', () => {
  assert.throws(() => createChatPacket({ ...fixtureArticle, fetchSource: 'metadata_only', abstract: '', fullText: undefined }, fixtureIdentifier), /Only metadata/);
});
