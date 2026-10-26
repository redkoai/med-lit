import test from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {classifyAcquisition} from '../packages/redko-product-loop/acquisition';
import {growthSummary} from '../packages/redko-product-loop/growth';
import {createClient} from '../packages/redko-product-loop/client';
import {LOOP_VERSION,validateEvent,type LoopEvent} from '../packages/redko-product-loop/core';
test('fixed acquisition classes handle AI tags, owned referrals, spoofed hosts and private strings',()=>{
 assert.equal(classifyAcquisition('','?utm_source=chatgpt.com&private=secret','medlit.theredko.com'),'chatgpt');
 assert.equal(classifyAcquisition('https://www.google.co.uk/search?q=PRIVATE','','synaptik.theredko.com'),'google');
 assert.equal(classifyAcquisition('https://google.com.attacker.example/','','x'),'other');
 assert.equal(classifyAcquisition('https://www.theredko.com/','','medlit.theredko.com'),'owned');
 assert.equal(classifyAcquisition('','?utm_source=PRIVATE','x'),'other');
});
test('cohorts exclude immature users and deduplicate, with per-product matching of starts',()=>{
 const visitor=randomUUID(),session=randomUUID();
 const e=(changes:Partial<LoopEvent>):LoopEvent=>({id:randomUUID(),visitor,session,product:'medlit',version:LOOP_VERSION,event:'view',environment:'production',surface:'analysis',target:'surface',at:'2026-10-01T12:00:00Z',source:'chatgpt',...changes});
 const start=e({event:'flow_started',target:'start-analysis'}),done=e({event:'flow_completed',target:'save-analysis'});
 const rows=[start,done,done,e({event:'flow_completed',target:'save-analysis',at:'2026-10-09T12:00:00Z'}),e({visitor:randomUUID(),event:'flow_completed',target:'save-analysis',at:'2026-10-24T12:00:00Z'}),e({environment:'test'})];
 const result=growthSummary(rows,'medlit','2026-10-01T00:00:00Z','2026-10-26T00:00:00Z');
 assert.equal(result.events,4);assert.equal(result.firstObservedCompleters,2);assert.deepEqual(result.repeat7to14,{eligible:1,returned:1,rate:1});assert.equal(result.bySource.chatgpt.completedAfterStart,1);
 assert.equal(growthSummary([],'medlit','2026-10-01','2026-10-26').repeat7to14.rate,null);
 assert.equal(validateEvent({...done,source:'PRIVATE'}),false);
});
test('consented session survives reload, expires after inactivity, excludes QA and requires backend acknowledgment',async()=>{
 const keys=['window','document','navigator','localStorage','sessionStorage','fetch'];const saved=Object.fromEntries(keys.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 const set=(key:string,value:unknown)=>Object.defineProperty(globalThis,key,{value,configurable:true});
 const storage=()=>{const m=new Map();return{getItem:(k:string)=>m.get(k)??null,setItem:(k:string,v:string)=>m.set(k,v),removeItem:(k:string)=>m.delete(k)}};
 const local=storage(),tab=storage();const batches:LoopEvent[][]=[];let acknowledge=true;
 set('localStorage',local);set('sessionStorage',tab);set('navigator',{});set('document',{referrer:''});set('window',{location:{hostname:'medlit.theredko.com',search:'?utm_source=chatgpt.com&analytics_qa=1'},addEventListener(){}});
 set('fetch',async(_:unknown,o:{body:string;keepalive:boolean})=>{assert.equal(o.keepalive,true);const batch=JSON.parse(o.body).batch;batches.push(batch);return{ok:true,json:async()=>({accepted:acknowledge?batch.length:0})}});
 const options={product:'medlit' as const,url:'https://example.supabase.co',publishableKey:'public',productionHosts:['medlit.theredko.com']};
 const a=createClient(options),b=createClient(options);
 try{
  a.init();assert.equal(a.record('view','help','surface'),false);assert.equal(tab.getItem('redko-loop:medlit:session'),null);
  a.setConsent(true);a.record('view','help','surface');assert.equal(await a.flush(),true);
  b.init();b.record('flow_started','analysis','start-analysis');await b.flush();
  assert.equal(batches[0][0].session,batches[1][0].session);assert.equal(batches[1][0].entry,'help');assert.equal(batches[1][0].source,'chatgpt');assert.equal(batches[1][0].environment,'test');
  acknowledge=false;b.record('flow_completed','analysis','save-analysis');assert.equal(await b.flush(),false);assert.equal(b.delivery,'failed');
  b.setConsent(false);assert.equal(tab.getItem('redko-loop:medlit:session'),null);assert.equal(b.record('view','home','surface'),false);
  const old={id:randomUUID(),visitor:JSON.parse(local.getItem('redko-loop:medlit:identity')).visitor,source:'google',entry:'home',last:Date.now()-31*60000};
  local.setItem('redko-loop:medlit:consent',JSON.stringify({allowed:true,version:LOOP_VERSION}));tab.setItem('redko-loop:medlit:session',JSON.stringify(old));
  const c=createClient(options);c.init();c.record('view','help','surface');await c.flush();assert.notEqual(batches.at(-1)![0].session,old.id);c.setConsent(false);
 }finally{a.setConsent(false);b.setConsent(false);for(const[k,v]of Object.entries(saved))v?Object.defineProperty(globalThis,k,v):Reflect.deleteProperty(globalThis,k);}
});
