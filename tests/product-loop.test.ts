import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {validateEvent,summarizeEvents,LOOP_VERSION,type LoopEvent} from '../packages/redko-product-loop/core';
import {createClient} from '../packages/redko-product-loop/client';
const event=(fields:Partial<LoopEvent>={}):LoopEvent=>({id:randomUUID(),product:'synaptik',visitor:randomUUID(),session:randomUUID(),version:LOOP_VERSION,environment:'production',event:'view',surface:'home',target:'surface',at:'2026-09-11T12:00:00Z',...fields});
test('telemetry rejects unapproved content, private heatmaps and malformed values',()=>{
 assert.equal(validateEvent(event()),true);
 for(const payload of [{...event(),diagnosis:'private'},event({surface:'journal',event:'click',x:2,y:3}),event({x:2}),event({value:Infinity}),event({event:'feedback',target:'feedback-navigation',value:2})])assert.equal(validateEvent(payload),false);
 assert.equal(validateEvent(event({surface:'discovery',event:'click',target:'preview-practice',x:0,y:9})),true);
});
test('funnel matches completion and error to a start in the same visitor/session, excludes previews and deduplicates',()=>{
 const start=event({event:'flow_started'}),complete=event({...start,id:randomUUID(),event:'flow_completed'});
 const result=summarizeEvents([start,start,complete,event({event:'flow_completed'}),event({...start,id:randomUUID(),visitor:randomUUID(),event:'flow_failed'}),event({environment:'preview'})],'synaptik');
 assert.equal(result.startedSessions,1);assert.equal(result.completedSessions,1);assert.equal(result.errorSessions,0);assert.equal(result.events,4);assert.deepEqual(result.findings,[]);assert.equal(result.enoughEvidence,false);
});
test('minimum evidence gate and product partitions keep findings descriptive',()=>{
 const events=Array.from({length:35},()=>event({event:'flow_started'}));events.push(event({product:'medlit',event:'flow_started'}));
 const result=summarizeEvents(events,'synaptik');assert.equal(result.visitors,35);assert.equal(result.startedSessions,35);assert.equal(result.findings[0].id,'synaptik:completion-gap');assert.match(result.findings[0].hypothesis,/not proof/);
});
test('browser client never sends before consent, withdrawal drops queue, rotation preserves deletion credentials',async()=>{
 const saved=new Map<string,string>(),calls:{url:string;body:any}[]=[];
 const originals=Object.fromEntries(['window','localStorage','navigator','fetch'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 const install=(name:string,value:unknown)=>Object.defineProperty(globalThis,name,{configurable:true,writable:true,value});
 install('window',{location:{hostname:'test.example'},addEventListener(){}});install('navigator',{});
 install('localStorage',{getItem:(k:string)=>saved.get(k)??null,setItem:(k:string,v:string)=>saved.set(k,v),removeItem:(k:string)=>saved.delete(k)});
 install('fetch',async(url:string,options:any)=>{calls.push({url,body:JSON.parse(options.body)});return{ok:true};});
 try{
  const client=createClient({product:'synaptik',url:'https://example.supabase.co',publishableKey:'public',productionHosts:[]});client.init();
  assert.equal(client.record('view','home','surface'),false);assert.equal(saved.size,0);await client.flush();assert.equal(calls.length,0);
  client.setConsent(true);assert.equal(client.record('view','home','surface'),true);client.setConsent(false);await client.flush();assert.equal(calls.length,0);
  const identity=JSON.parse(saved.get('redko-loop:synaptik:identity')!);identity.createdAt=Date.now()-31*86400000;saved.set('redko-loop:synaptik:identity',JSON.stringify(identity));
  client.setConsent(true);client.record('view','home','surface');assert.equal(await client.flush(),true);assert.equal(calls.length,1);assert.equal(calls[0].body.batch[0].environment,'preview');
  await client.erase();assert.equal(calls.filter(c=>c.url.endsWith('delete_product_loop')).length,2);assert.equal(saved.has('redko-loop:synaptik:identity'),false);
  install('navigator',{globalPrivacyControl:true});client.setConsent(true);assert.equal(client.enabled,false);
 }finally{for(const [key,descriptor]of Object.entries(originals))descriptor?Object.defineProperty(globalThis,key,descriptor):Reflect.deleteProperty(globalThis,key);}
});
