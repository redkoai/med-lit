import assert from 'node:assert/strict';
import test from 'node:test';
import { callProvider } from '../src/services/providerTransport';
import { checkProviderConnection } from '../src/services/providerConnection';
import type { AIProvider } from '../src/types';

const keys = { openai: 'sk-proj-synthetic-not-a-real-key', claude: 'sk-ant-synthetic-not-a-real-key', gemini: 'new-format-synthetic-gemini-key', openrouter: 'sk-or-v1-synthetic-not-a-real-key' };
for (const provider of Object.keys(keys) as AIProvider[]) {
 test(`${provider}: direct request and complete response contract`, async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
   const body = JSON.parse(String(init?.body));
   assert.equal(body.model ?? String(input).includes('gemini-3.7-flash'), provider === 'gemini' ? true : 'selected-model');
   assert.equal(body.temperature, undefined); assert.equal(init?.credentials, 'omit'); assert.equal(init?.redirect, 'error');
   assert.ok(!String(input).includes(keys[provider]));
   if (provider === 'openai') { assert.equal(body.store, false); assert.equal(body.max_tokens, undefined); assert.equal(new URL(String(input)).pathname, '/v1/responses'); }
   const data = provider === 'claude' ? { content: [{type:'text',text:'{"ok":true}'}],stop_reason:'end_turn' }
     : provider === 'gemini' ? { candidates:[{finishReason:'STOP',content:{parts:[{thought:true,text:'private'},{text:'{"ok":'},{text:'true}'}]}}] }
     : provider === 'openai' ? {status:'completed',output:[{type:'message',content:[{type:'output_text',text:'{"ok":true}'}]}]}
     : {choices:[{finish_reason:'stop',message:{content:'{"ok":true}'}}]};
   return Response.json(data);
  };
  try { assert.equal(await callProvider(provider,keys[provider],provider==='gemini'?'gemini-3.7-flash':'selected-model','JSON','Return JSON'),'{"ok":true}'); }
  finally { globalThis.fetch = original; }
 });
}
test('restricted model-list permissions do not block inference-capable keys', async () => {
 const original=globalThis.fetch;globalThis.fetch=async()=>new Response('',{status:403});
 try { assert.match((await checkProviderConnection('openai',keys.openai)).warning??'',/cannot list/); }
 finally {globalThis.fetch=original;}
});
test('truncated response is not accepted as a complete appraisal', async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>Response.json({status:'incomplete',output:[]});
 try {await assert.rejects(callProvider('openai',keys.openai,'gpt-4.1','JSON','JSON'),/output limit/);}finally{globalThis.fetch=original;}
});
test('quota errors are actionable and never expose upstream content or credentials',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>new Response(keys.openai,{status:429});
 try {await assert.rejects(callProvider('openai',keys.openai,'gpt-4.1','JSON','JSON'),e=>e instanceof Error&&/quota/.test(e.message)&&!e.message.includes(keys.openai));}finally{globalThis.fetch=original;}
});
test('Gemini catalog excludes models that cannot generate content',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>Response.json({models:[{name:'models/gemini-text',supportedGenerationMethods:['generateContent']},{name:'models/embedding',supportedGenerationMethods:['embedContent']}]});
 try {assert.deepEqual((await checkProviderConnection('gemini',keys.gemini)).models.map(m=>m.id),['gemini-text']);}finally{globalThis.fetch=original;}
});
