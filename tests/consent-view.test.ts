import test from 'node:test';
import assert from 'node:assert/strict';
import {createClient} from '../packages/redko-product-loop/client';

test('surface arrival is recorded on grant once, without replay or collection after withdrawal',async()=>{
 const saved=new Map<string,string>();const requests:{batch:{event:string;surface:string}[]}[]=[];
 const keys=['window','localStorage','navigator','fetch'];
 const originals=Object.fromEntries(keys.map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 const set=(key:string,value:unknown)=>Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
 const storage={getItem:(k:string)=>saved.get(k)??null,setItem:(k:string,v:string)=>saved.set(k,v),removeItem:(k:string)=>saved.delete(k)};
 set('window',{location:{hostname:'synaptik-beta.vercel.app'},addEventListener(){}});set('localStorage',storage);set('navigator',{});
 set('fetch',async(_url:unknown,options:{body:string})=>{requests.push(JSON.parse(options.body));return {ok:true};});
 const client=createClient({product:'synaptik',url:'https://example.supabase.co',publishableKey:'public-test-key',productionHosts:['synaptik-beta.vercel.app']});
 let stop=()=>{};
 try{
  stop=client.observeView('home');assert.equal(await client.flush(),false);assert.equal(saved.size,0);
  client.setConsent(false);await client.flush();assert.equal(requests.length,0);
  stop();stop=client.observeView('settings');client.setConsent(true);await client.flush();
  assert.deepEqual(requests.flatMap(r=>r.batch).map(e=>[e.event,e.surface]),[['view','settings']]);
  await client.flush();assert.equal(requests.length,1);
  stop();stop=client.observeView('practice');client.record('flow_started','practice','start-session');await client.flush();
  assert.deepEqual(requests[1].batch.map(e=>e.event),['view','flow_started']);
  client.setConsent(false);client.record('flow_completed','practice','finish-session');await client.flush();assert.equal(requests.length,2);
  set('navigator',{globalPrivacyControl:true});client.setConsent(true);assert.equal(client.enabled,false);await client.flush();assert.equal(requests.length,2);
 }finally{stop();client.setConsent(false);for(const [k,d]of Object.entries(originals))d?Object.defineProperty(globalThis,k,d):Reflect.deleteProperty(globalThis,k);}
});
