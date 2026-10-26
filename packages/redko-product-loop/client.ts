import {LOOP_VERSION,validateEvent,TARGETS,SURFACES,SOURCES,type Product,type LoopEvent} from './core';
import {classifyAcquisition} from './acquisition';
type Options={product:Product;url:string;publishableKey:string;productionHosts:string[]};
type Identity={visitor:string;eraseKey:string;createdAt:number};
const DAY=86400000;
const active=new Map<Product,ReturnType<typeof createClient>>();
export function getProductLoop(options:Options){
 if(!active.has(options.product))active.set(options.product,createClient(options));
 return active.get(options.product)!;
}
export function privacySignal(){return typeof navigator!=='undefined'&&(navigator.doNotTrack==='1'||(navigator as Navigator&{globalPrivacyControl?:boolean}).globalPrivacyControl===true);}
const isIdentity=(v:unknown):v is Identity=>!!v&&typeof v==='object'&&typeof (v as Identity).visitor==='string'&&typeof (v as Identity).eraseKey==='string'&&Number.isFinite((v as Identity).createdAt);
export function createClient(options:Options){
 const base=`redko-loop:${options.product}:`,listeners=new Set<()=>void>();
 let allowed=false,identity:Identity|null=null,session='',queue:LoopEvent[]=[],timer:ReturnType<typeof setTimeout>|undefined,initialized=false;
 const requests=new Set<AbortController>();
 let context:{id:string;visitor:string;source:NonNullable<LoopEvent['source']>;entry:LoopEvent['surface'];qa:boolean;last:number}|null=null;
 function clearSession(){context=null;try{sessionStorage.removeItem(base+'session');}catch{}}
 function sessionContext(surface:LoopEvent['surface']){
  const now=Date.now();
  if(!context){try{context=JSON.parse(sessionStorage.getItem(base+'session')??'null');}catch{}}
  if(!context||context.visitor!==identity!.visitor||!Number.isFinite(context.last)||now-context.last>=30*60000||now<context.last||!SURFACES.includes(context.entry)||!SOURCES.includes(context.source)||!/^[0-9a-f-]{36}$/.test(context.id)){
   context={id:crypto.randomUUID(),visitor:identity!.visitor,source:classifyAcquisition(typeof document==='undefined'?'':document.referrer,window.location.search??'',window.location.hostname),entry:surface,qa:false,last:now};
  }
  context.qa=context.qa||new URLSearchParams(window.location.search??'').get('analytics_qa')==='1';
  context.last=now;session=context.id;try{sessionStorage.setItem(base+'session',JSON.stringify(context));}catch{}
  return context;
 }
 let delivery:'idle'|'queued'|'sent'|'failed'='idle';
 const supported=()=>typeof window!=='undefined'&&/^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(options.url)&&!!options.publishableKey;
 const notify=()=>listeners.forEach(fn=>fn());
 function stop(){queue=[];clearTimeout(timer);requests.forEach(r=>r.abort());requests.clear();session='';clearSession();allowed=false;delivery='idle';notify();}
 function identities():Identity[]{
  const history=JSON.parse(localStorage.getItem(base+'previous')??'[]');
  const current=JSON.parse(localStorage.getItem(base+'identity')??'null');
  // A rotated identity can have events for 30 days and those can live for 90 more.
  return [...new Map([...(Array.isArray(history)?history:[]),current].filter(isIdentity).filter(i=>Date.now()-i.createdAt<120*DAY).map(i=>[i.visitor,i])).values()];
 }
 function load(){
  if(typeof window==='undefined')return;
  try{
   const receipt=JSON.parse(localStorage.getItem(base+'consent')??'null');
   allowed=receipt?.allowed===true&&receipt?.version===LOOP_VERSION&&!privacySignal();
   if(!allowed){stop();return;}
   const old=JSON.parse(localStorage.getItem(base+'identity')??'null');
   const keep=identities();
   identity=isIdentity(old)&&Date.now()-old.createdAt<30*DAY?old:{visitor:crypto.randomUUID(),eraseKey:crypto.randomUUID()+crypto.randomUUID(),createdAt:Date.now()};
   if(isIdentity(old)&&old.visitor!==identity.visitor)queue=[];
   localStorage.setItem(base+'previous',JSON.stringify(keep.filter(i=>i.visitor!==identity!.visitor)));
   localStorage.setItem(base+'identity',JSON.stringify(identity));
   session||=crypto.randomUUID();notify();
  }catch{stop();}
 }
 async function flush(){
  clearTimeout(timer);const batch=queue.splice(0,25);
  if(!allowed||privacySignal()||!identity||!supported()||!batch.length)return false;
  const request=new AbortController();requests.add(request);const timeout=setTimeout(()=>request.abort(),10000);
  try{
   const response=await fetch(options.url+'/rest/v1/rpc/collect_product_loop',{method:'POST',headers:{apikey:options.publishableKey,'Content-Type':'application/json'},credentials:'omit',referrerPolicy:'no-referrer',signal:request.signal,keepalive:true,body:JSON.stringify({batch,erase_key:identity.eraseKey})});
   if(!response.ok)throw new Error('Collection failed');
   const receipt=await response.json();if(receipt?.accepted!==batch.length)throw new Error('Collection not acknowledged');
   if(allowed)delivery='sent';return true;
  }catch{if(allowed)delivery='failed';return false;}
  finally{clearTimeout(timeout);requests.delete(request);notify();}
 }
 function record(event:LoopEvent['event'],surface:LoopEvent['surface'],target:LoopEvent['target'],extra:Partial<Pick<LoopEvent,'value'|'x'|'y'|'viewport'|'provider'|'reason'>>={}){
  if(!allowed||privacySignal()||!identity||!supported())return false;
  if(Date.now()-identity.createdAt>=30*DAY)load();
  if(!identity||!allowed)return false;
  const attribution=sessionContext(surface);
  const qa=attribution.qa;
  const e={source:attribution.source,entry:attribution.entry,id:crypto.randomUUID(),product:options.product,visitor:identity.visitor,session,version:LOOP_VERSION,environment:qa?'test' as const:options.productionHosts.includes(window.location.hostname)?'production' as const:'preview' as const,event,surface,target,at:new Date().toISOString(),...extra};
  if(!validateEvent(e))return false;
  queue.push(e);if(queue.length>25)queue.shift();delivery='queued';
  clearTimeout(timer);timer=setTimeout(()=>void flush(),1500);notify();return true;
 }
 function init(){
  if(initialized||typeof window==='undefined')return;initialized=true;load();
  window.addEventListener('pagehide',()=>{if(allowed)void flush();});
  window.addEventListener('storage',e=>{if(e.key===base+'consent'||e.key===null)load();});
 }
 function setConsent(value:boolean){
  init();if(typeof window==='undefined')return;const grant=value&&!privacySignal();stop();
  try{localStorage.setItem(base+'consent',JSON.stringify({allowed:grant,version:LOOP_VERSION,at:new Date().toISOString()}));if(!grant)identity=null;load();}catch{stop();}notify();
 }
 async function erase(){
  if(typeof window==='undefined')return;
  const stored=identities();setConsent(false);
  if(stored.length&&!supported())throw new Error('Deletion is unavailable in this build. Your deletion keys have been retained for retry.');
  for(const item of stored){
   const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),10000);
   let response:Response;
   try{response=await fetch(options.url+'/rest/v1/rpc/delete_product_loop',{method:'POST',credentials:'omit',referrerPolicy:'no-referrer',headers:{apikey:options.publishableKey,'Content-Type':'application/json'},signal:abort.signal,body:JSON.stringify({product_name:options.product,visitor_id:item.visitor,erase_key:item.eraseKey})});}catch{throw new Error('Deletion could not be confirmed. Your deletion keys are retained for retry.');}finally{clearTimeout(timeout);}
   if(!response.ok)throw new Error('Deletion could not be confirmed. Retry while this browser still has its deletion keys.');
  }
  localStorage.removeItem(base+'identity');localStorage.removeItem(base+'previous');identity=null;notify();
 }
 // Record the current coarse surface when consent is granted, without replaying pre-consent navigation.
 function observeView(surface:LoopEvent['surface']){
  init();let previous=allowed;
  const changed=()=>{const next=allowed;const granted=next&&!previous;previous=next;if(granted)record('view',surface,'surface');};
  listeners.add(changed);if(allowed)record('view',surface,'surface');
  return()=>{listeners.delete(changed);};
 }
 function observe(root:HTMLElement){
  init();
  const click=(event:MouseEvent)=>{
   const target=event.target instanceof Element?event.target.closest<HTMLElement>('[data-loop-target]'):null;
   if(!target||target.closest('[data-loop-private]'))return;
   const key=target.dataset.loopTarget as LoopEvent['target'],surface=target.closest<HTMLElement>('[data-loop-surface]')?.dataset.loopSurface as LoopEvent['surface'];
   if(!TARGETS.includes(key)||!SURFACES.includes(surface))return;
   const bounds=target.getBoundingClientRect(),extra:Partial<Pick<LoopEvent,'x'|'y'|'viewport'>>={viewport:window.innerWidth<640?'small':window.innerWidth<1100?'medium':'large'};
   if(event.detail>0&&['landing','home','discovery'].includes(surface)&&bounds.width&&bounds.height){extra.x=Math.min(9,Math.max(0,Math.floor((event.clientX-bounds.left)/bounds.width*10)));extra.y=Math.min(9,Math.max(0,Math.floor((event.clientY-bounds.top)/bounds.height*10)));}
   record('click',surface,key,extra);
  };
  // React Native Web may stop bubbling. Observe only allowlisted targets in capture phase.
  root.addEventListener('click',click,{capture:true,passive:true});return()=>root.removeEventListener('click',click,true);
 }
 return {init,record,flush,setConsent,erase,observe,observeView,subscribe:(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn);};},get enabled(){return allowed;},get configured(){return supported();},get delivery(){return delivery;},get receipt(){if(typeof window==='undefined')return null;try{return JSON.parse(localStorage.getItem(base+'consent')??'null');}catch{return null;}}};
}
