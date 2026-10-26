import test from 'node:test';
import assert from 'node:assert/strict';
test('MedLit maps real appraisal events without forwarding paper data or duplicating collectors',async()=>{
 const saved=new Map<string,string>(),requests:any[]=[];
 const originals=Object.fromEntries(['window','localStorage','navigator','fetch'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
 const put=(key:string,value:unknown)=>Object.defineProperty(globalThis,key,{configurable:true,writable:true,value});
 const storage={getItem:(k:string)=>saved.get(k)??null,setItem:(k:string,v:string)=>saved.set(k,v),removeItem:(k:string)=>saved.delete(k)};
 process.env.EXPO_PUBLIC_ENABLE_REDKO_LOOP='true';process.env.EXPO_PUBLIC_REDKO_LOOP_URL='https://example.supabase.co';process.env.EXPO_PUBLIC_REDKO_LOOP_PUBLISHABLE_KEY='public-test-key';
 process.env.EXPO_PUBLIC_ENABLE_MEDLIT_ANALYTICS='true';process.env.EXPO_PUBLIC_ANALYTICS_PRODUCT='medlit';process.env.EXPO_PUBLIC_POSTHOG_KEY='phc_test';process.env.EXPO_PUBLIC_POSTHOG_PROJECT_ID='123';process.env.EXPO_PUBLIC_POSTHOG_HOST='https://us.i.posthog.com';
 put('window',{location:{hostname:'localhost'},localStorage:storage,addEventListener(){}});put('localStorage',storage);put('navigator',{});put('fetch',async(url:string,options:any)=>{requests.push({url,body:JSON.parse(options.body)});return {ok:true,json:async()=>({accepted:JSON.parse(options.body).batch?.length})};});
 try{
  const {productLoop}=await import('../src/services/firstPartyAnalytics');
  const {captureEvent,setAnalyticsConsent}=await import('../src/services/productAnalytics');
  productLoop.init();await captureEvent('appraisal_started',{paper:'PRIVATE PAPER',key:'PRIVATE KEY'});assert.equal(requests.length,0);
  productLoop.setConsent(true);await captureEvent('appraisal_started',{paper:'PRIVATE PAPER',key:'PRIVATE KEY'});await captureEvent('appraisal_completed',{doi:'PRIVATE DOI'});await captureEvent('report_opened',{url:'PRIVATE URL'});await captureEvent('source_packet_prepared',{paper:'PRIVATE PAPER',provider:'handoff'});await productLoop.flush();
  assert.equal(requests.length,1);assert.ok(requests[0].url.endsWith('collect_product_loop'));const batch=requests[0].body.batch;
  assert.deepEqual(batch.map((e:any)=>e.event),['flow_started','flow_completed','click']);assert.ok(batch.every((e:any)=>e.product==='medlit'));assert.doesNotMatch(JSON.stringify(requests),/PRIVATE/);
  setAnalyticsConsent(true);assert.equal(productLoop.enabled,false);await captureEvent('appraisal_failed',{key:'PRIVATE KEY'});assert.equal(requests.length,2);assert.ok(requests[1].url.startsWith('https://us.i.posthog.com'));
  setAnalyticsConsent(false);
 }finally{for(const [key,d]of Object.entries(originals))d?Object.defineProperty(globalThis,key,d):Reflect.deleteProperty(globalThis,key);}
});
