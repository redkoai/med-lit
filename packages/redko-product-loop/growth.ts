import {validateEvent,type Product,type LoopEvent} from './core';
/** Bounded, consent-based cohorts. A browser's first observed completion is not necessarily its first ever use. */
export function growthSummary(input:unknown[],product:Product,from:string,to:string){
 const end=Date.parse(to),begin=Date.parse(from);
 if(!Number.isFinite(end)||!Number.isFinite(begin)||end<=begin)throw new Error('Invalid report window');
 const all=[...new Map(input.filter(validateEvent).filter(e=>e.product===product&&e.environment==='production'&&Date.parse(e.at)<end).map(e=>[e.id,e])).values()].sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));
 const inWindow=all.filter(e=>Date.parse(e.at)>=begin);
 const target=product==='medlit'?'start-analysis':'start-session';
 const completion=product==='medlit'?'save-analysis':'finish-session';
 const isStart=(e:LoopEvent)=>e.event==='flow_started'&&e.target===target;
 const isComplete=(e:LoopEvent)=>e.event==='flow_completed'&&e.target===completion;
 const sessions=new Map<string,LoopEvent[]>();
 for(const e of inWindow){const key=e.visitor+':'+e.session;const list=sessions.get(key)??[];list.push(e);sessions.set(key,list);}
 const funnels:Record<string,{observedSessions:number;viewedSessions:number;startedSessions:number;completedAfterStart:number}>={};
 for(const records of sessions.values()){
  const key=records[0].source??'unknown';const f=funnels[key]??={observedSessions:0,viewedSessions:0,startedSessions:0,completedAfterStart:0};f.observedSessions++;
  if(records.some(e=>e.event==='view'))f.viewedSessions++;
  const start=records.find(isStart);if(start){f.startedSessions++;if(records.some(e=>isComplete(e)&&Date.parse(e.at)>=Date.parse(start.at)))f.completedAfterStart++;}
 }
 const sessionsFor=(predicate:(e:LoopEvent)=>boolean)=>new Set(inWindow.filter(predicate).map(e=>e.visitor+':'+e.session)).size;
 const connectionByProvider:Record<string,{startedSessions:number;connectedSessions:number;failedSessions:number;authorizedSessions:number}>={};
 for(const provider of ['openai','claude','gemini','openrouter'] as const){
  const match=(kind:LoopEvent['event'],target:string)=>(e:LoopEvent)=>e.provider===provider&&e.event===kind&&e.target===target;
  connectionByProvider[provider]={startedSessions:sessionsFor(match('step_started','connect-ai')),connectedSessions:sessionsFor(match('step_completed','connect-ai')),failedSessions:sessionsFor(match('step_failed','connect-ai')),authorizedSessions:sessionsFor(match('step_completed','authorize-ai'))};
 }
 const persistence={deviceSavedSessions:sessionsFor(e=>e.event==='step_completed'&&e.target==='save-device'),cloudSavedSessions:sessionsFor(e=>e.event==='step_completed'&&e.target==='save-cloud'),reopenedSavedSessions:sessionsFor(e=>e.event==='step_completed'&&e.target==='open-saved-analysis'),saveFailedSessions:sessionsFor(e=>e.event==='step_failed'&&['save-device','save-cloud','save-practice'].includes(e.target))};
 const failuresByReason:Record<string,number>={};
 for(const reason of new Set(inWindow.filter(e=>e.event==='flow_failed'||e.event==='step_failed').map(e=>e.reason??'unknown')))failuresByReason[reason]=sessionsFor(e=>(e.event==='flow_failed'||e.event==='step_failed')&&(e.reason??'unknown')===reason);
 const first=new Map<string,number>();const completed=new Map<string,number[]>();
 for(const e of all.filter(isComplete)){const t=Date.parse(e.at);if(!first.has(e.visitor))first.set(e.visitor,t);const days=completed.get(e.visitor)??[];days.push(t);completed.set(e.visitor,days);}
 // Exact elapsed-day window [7d,14d); everyone in the denominator has a complete 14-day follow-up.
 const day=86400000,cohort=[...first].filter(([,t])=>t>=begin&&t+14*day<=end);
 const returned=cohort.filter(([id,t])=>completed.get(id)!.some(n=>n>=t+7*day&&n<t+14*day)).length;
 const firstObservedCompleters=[...first].filter(([,t])=>t>=begin).length;
 return {product,from,to,events:inWindow.length,observedBrowsers:new Set(inWindow.map(e=>e.visitor)).size,firstObservedCompleters,bySource:funnels,...(product==='medlit'?{connectionByProvider}:{}),persistence,failuresByReason,repeat7to14:{eligible:cohort.length,returned,rate:cohort.length?returned/cohort.length:null},status:inWindow.length?'observed':'no-recorded-events',limitations:['Sources begin at the first event observed after consent; earlier navigation is not reconstructed.','Session completion is a session-level outcome, not per-attempt reliability.','First observed completion is limited by lookback, consent, browser changes and 30-day identifier rotation.','Only mature cohorts enter the 7-to-14-day return denominator.','Connection, authorization, generation, persistence and reopening are separate observations. Step counts use distinct sessions and can overlap after a retry.', 'No cross-product identity stitching. Missing observations are not proof of zero real use.']};
}
