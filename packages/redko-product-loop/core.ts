/** REDKO Product Loop v1. Shared verbatim with MedLit; no clinical or research content. */
export const LOOP_VERSION='2026-09-11.1';
export const PRODUCTS=['synaptik','medlit'] as const;
export type Product=typeof PRODUCTS[number];
export const EVENTS=['view','click','flow_started','flow_completed','flow_failed','feedback','scroll_depth'] as const;
export const SURFACES=['landing','home','discovery','practice','journal','settings','search','analysis','library','sharing','help','legal'] as const;
export const TARGETS=['surface','open-discovery','open-practice','preview-practice','save-practice','share-practice','export-summary','filter-control','search-control','start-session','finish-session','stop-session','save-checkin','auth-submit','save-preferences','open-settings','open-help','open-legal','submit-search','fetch-source','start-analysis','save-analysis','export-analysis','import-papers','open-library','share-analysis','feedback-navigation','feedback-clarity','feedback-reliability'] as const;
export type LoopEvent={id:string;product:Product;visitor:string;session:string;version:typeof LOOP_VERSION;environment:'production'|'preview'|'test';event:typeof EVENTS[number];surface:typeof SURFACES[number];target:typeof TARGETS[number];at:string;value?:number;x?:number;y?:number;viewport?:'small'|'medium'|'large'};
const uuid=(v:unknown)=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
const keys=new Set(['id','product','visitor','session','version','environment','event','surface','target','at','value','x','y','viewport']);
export function validateEvent(value:unknown):value is LoopEvent{
 if(!value||typeof value!=='object'||Array.isArray(value))return false;const e=value as LoopEvent;
 if(Object.keys(e).some(k=>!keys.has(k))||!uuid(e.id)||!uuid(e.visitor)||!uuid(e.session)||e.version!==LOOP_VERSION||!PRODUCTS.includes(e.product)||!EVENTS.includes(e.event)||!SURFACES.includes(e.surface)||!TARGETS.includes(e.target)||!['production','preview','test'].includes(e.environment)||typeof e.at!=='string'||!Number.isFinite(Date.parse(e.at)))return false;
 if(e.value!==undefined&&(!Number.isFinite(e.value)||e.value<0||e.value>600000))return false;
 if((e.x===undefined)!==(e.y===undefined))return false;
 if(e.x!==undefined&&(!Number.isInteger(e.x)||e.x<0||e.x>9||!Number.isInteger(e.y)||e.y!<0||e.y!>9||e.event!=='click'||!['landing','home','discovery'].includes(e.surface)))return false;
 if(e.viewport!==undefined&&!['small','medium','large'].includes(e.viewport))return false;
 if(e.event==='feedback'&&(!e.target.startsWith('feedback-')||![0,1].includes(e.value!)))return false;
 return true;
}
export interface LoopFinding {id:string;product:Product;severity:'investigate'|'watch';title:string;observed:string;hypothesis:string;nextStep:string;denominator:number;rate:number|null}
export function summarizeEvents(input:unknown[],product:Product){
 const valid=input.filter(validateEvent).filter(e=>e.product===product&&e.environment==='production'),events=[...new Map(valid.map(e=>[e.id,e])).values()];
 const visitors=new Set(events.map(e=>e.visitor)).size;
 const sessionKey=(e:LoopEvent)=>`${e.visitor}:${e.session}`;
 const started=new Map<string,number>();
 for(const e of events.filter(e=>e.event==='flow_started'))started.set(sessionKey(e),Math.min(started.get(sessionKey(e))??Infinity,Date.parse(e.at)));
 const matched=(kind:LoopEvent['event'])=>new Set(events.filter(e=>e.event===kind&&started.has(sessionKey(e))&&Date.parse(e.at)>=started.get(sessionKey(e))!).map(sessionKey)).size;
 const starts=started.size,completions=matched('flow_completed'),failures=matched('flow_failed');
 const byVisitor=new Map<string,Set<string>>();for(const e of events.filter(e=>e.event==='flow_completed')){const days=byVisitor.get(e.visitor)??new Set<string>();days.add(e.at.slice(0,10));byVisitor.set(e.visitor,days);}
 const returned=[...byVisitor.values()].filter(d=>d.size>1).length,eligible=byVisitor.size;
 const heatmaps:Record<string,number[]>={},cellVisitors:Record<string,Set<string>[]>={};
 for(const e of events){if(e.x===undefined)continue;const key=`${e.surface}/${e.target}/${e.viewport??'large'}`;heatmaps[key]??=Array(100).fill(0);cellVisitors[key]??=Array.from({length:100},()=>new Set());const cell=e.y!*10+e.x;heatmaps[key][cell]++;cellVisitors[key][cell].add(e.visitor);}
 for(const key of Object.keys(heatmaps))heatmaps[key]=heatmaps[key].map((count,i)=>cellVisitors[key][i].size>=5?count:0);
 const findings:LoopFinding[]=[];const enough=visitors>=30&&starts>=30;
 if(enough&&failures/starts>.1)findings.push({id:`${product}:flow-failure`,product,severity:'investigate',title:'Some attempts end in a recorded error',observed:`${failures} sessions recorded an error among ${starts} sessions with a start.`,hypothesis:'A reliability issue may interrupt the core task. Errors can overlap successful recovery.',nextStep:'Inspect the matching error category and reproduce it without reading user content. Fix one confirmed cause and compare the next complete window.',denominator:starts,rate:failures/starts});
 if(enough&&completions/starts<.6)findings.push({id:`${product}:completion-gap`,product,severity:'investigate',title:'Many starts have no recorded completion',observed:`${completions} completed sessions and ${starts} started sessions in the observed window.`,hypothesis:'This can reflect friction, voluntary stops, cross-window sessions or blocked telemetry. It is not proof of a UX defect.',nextStep:'Examine step counts and voluntary-stop observations, then run a neutral usability task. Do not lengthen sessions to improve retention.',denominator:starts,rate:completions/starts});
 return {product,version:LOOP_VERSION,events:events.length,visitors,startedSessions:starts,completedSessions:completions,errorSessions:failures,repeatValue:{visitors:returned,observedCompleters:eligible,label:'More than one completion day observed; not a cohort retention estimate'},enoughEvidence:enough,findings,heatmaps,rejected:input.length-valid.length,limitations:['Consent-based observations omit nonparticipants.','Preview and test traffic are excluded.','Counts are descriptive; human desirability and causal effects remain untested.','Client events are untrusted telemetry, not financial or clinical records.','Heatmap cells with fewer than five distinct consenting browser IDs are suppressed; zero can mean suppressed.']};
}
