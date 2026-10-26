import test from 'node:test';
import assert from 'node:assert/strict';
import { testProviderConnection } from '../src/services/providerConnection';
import { analyzeArticle } from '../src/services/aiAnalyzer';
import { callProvider, providerFailureReason } from '../src/services/providerTransport';
import { validateKeyFormat } from '../src/constants/providers';
import { readLibrary, updateLibrary } from '../src/services/libraryStorage';
import { fixtureArticle, fixtureIdentifier, fixtureModelOutput } from './testFixture';
import type { AIProvider } from '../src/types';

const keys = { openai:'sk-proj-fixture-not-a-real-credential',claude:'sk-ant-api03-fixture-not-a-real-credential',gemini:'new-format-fixture-not-a-real-credential',openrouter:'sk-or-v1-fixture-not-a-real-credential' };
function response(provider: AIProvider, text: string, truncated=false) {
 return provider==='openai'?{status:truncated?'incomplete':'completed',output:[{content:[{type:'output_text',text}]}]}:
 provider==='claude'?{stop_reason:truncated?'max_tokens':'end_turn',content:[{type:'text',text}]}:
 provider==='gemini'?{candidates:[{finishReason:truncated?'MAX_TOKENS':'STOP',content:{parts:[{text}]}}]}:
 {choices:[{finish_reason:truncated?'length':'stop',message:{content:text}}]};
}
for(const provider of Object.keys(keys) as AIProvider[]) {
 test(`${provider}: fixture connection -> appraisal -> persistent save -> reopen, without persisting credentials`,async()=>{
  const original=globalThis.fetch,values=new Map<string,string>();let requests=0;
  const storage={getItem:async(k:string)=>values.get(k)??null,setItem:async(k:string,v:string)=>{values.set(k,v)}};
  globalThis.fetch=async(url,init)=>{
   requests++;const body=String(init?.body);
   assert.equal(String(url).includes(keys[provider]),false);
   assert.equal(body.includes(keys[provider]),false);
   assert.equal(init?.credentials,'omit');assert.equal(init?.redirect,'error');
   if(requests===1){assert.equal(body.includes(fixtureArticle.title),false);return Response.json(response(provider,'{"connected":true}'));}
   assert.ok(body.includes(fixtureArticle.title));return Response.json(response(provider,JSON.stringify(fixtureModelOutput)));
  };
  try{
   await testProviderConnection(provider,keys[provider],'fixture-model');
   const report=await analyzeArticle(fixtureArticle,fixtureIdentifier,provider,keys[provider],'fixture-model');
   assert.equal(report.analysisModel,provider+'/fixture-model');
   assert.equal(report.appraisal.invalidEvidenceCount,1);
   await updateLibrary(storage,undefined,items=>[report,...items]);
   const reopened=(await readLibrary(storage))[0];
   assert.equal(reopened.id,report.id);assert.deepEqual(reopened.appraisal,JSON.parse(JSON.stringify(report.appraisal)));
   assert.equal([...values.values()].join('').includes(keys[provider]),false);
   assert.equal(requests,2,'Reopening must not make another billable call');
  }finally{globalThis.fetch=original;}
 });
 test(`${provider}: connection rejects arbitrary text, false confirmation and truncated output`,async()=>{
  const original=globalThis.fetch;
  try{
   for(const text of ['Hello!','{}','{"connected":false}','null']){
    globalThis.fetch=async()=>Response.json(response(provider,text));
    await assert.rejects(testProviderConnection(provider,keys[provider],'fixture-model'),/structured connection test/);
   }
   globalThis.fetch=async()=>Response.json(response(provider,'{"connected":true}',true));
   await assert.rejects(testProviderConnection(provider,keys[provider],'fixture-model'),/output limit/);
  }finally{globalThis.fetch=original;}
 });
}
test('OpenAI standard, project and service-account keys are allowed; subscription tokens and wrong-provider keys are not',()=>{
 for(const key of ['sk-fixture-standard-key-000','sk-proj-fixture-project-key-000','sk-svcacct-fixture-service-key-000'])assert.equal(validateKeyFormat('openai',key),null);
 assert.match(validateKeyFormat('claude','sk-ant-oat01-fixture-subscription-token')??'',/subscription/);
 assert.match(validateKeyFormat('openai',keys.claude)??'',/Choose Claude/);
});
test('failure classification is a fixed enum and never includes upstream bodies',async()=>{
 const original=globalThis.fetch;
 try{
  for(const [status,reason] of [[401,'credentials'],[403,'permission'],[402,'billing'],[429,'rate_limit'],[404,'model'],[503,'provider']] as const){
   globalThis.fetch=async()=>new Response(keys.openai,{status});
   await assert.rejects(callProvider('openai',keys.openai,'fixture','JSON','JSON'),e=>{assert.equal(providerFailureReason(e),reason);assert.equal(String(e).includes(keys.openai),false);return true;});
  }
  globalThis.fetch=async()=>new Response('<private upstream content>');
  await assert.rejects(callProvider('openai',keys.openai,'fixture','JSON','JSON'),e=>providerFailureReason(e)==='output'&&!String(e).includes('private upstream'));
 }finally{globalThis.fetch=original;}
});
test('device save failure does not manufacture a persisted report',async()=>{
 const storage={getItem:async()=>null,setItem:async()=>{throw new Error('Quota exceeded')}};
 await assert.rejects(updateLibrary(storage,null,()=>[]),/Quota/);
 assert.deepEqual(await readLibrary(storage),[]);
});
