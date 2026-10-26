import {useEffect,useState} from 'react';
import {Platform,Pressable,Text,View} from 'react-native';
import {usePathname} from 'expo-router';
import {productLoop} from '../services/firstPartyAnalytics';
import {privacySignal} from '../../packages/redko-product-loop/client';
import type {LoopEvent} from '../../packages/redko-product-loop/core';
import {setAnalyticsConsent} from '../services/productAnalytics';
import {guide as s} from './GuidePage';
const surfaces:Record<string,LoopEvent['surface']>={'/':'home','/analysis':'analysis','/history':'library','/settings':'settings','/learn':'help','/faq':'help','/methodology':'help','/privacy':'legal','/terms':'legal','/import':'search','/shared':'sharing','/compare':'analysis','/connect':'settings'};
export function ProductLoopObserver(){
 const path=usePathname();
 useEffect(()=>{if(Platform.OS!=='web')return;productLoop.init();return productLoop.observe(document.body);},[]);
 useEffect(()=>{if(Platform.OS!=='web')return;const surface=surfaces[path];if(!surface){delete document.body.dataset.loopSurface;return;}document.body.dataset.loopSurface=surface;return productLoop.observeView(surface);},[path]);
 return null;
}
export function FirstPartyAnalyticsPreferences(){
 const [mounted,setMounted]=useState(false),[,refresh]=useState(0),[message,setMessage]=useState(''),[deleting,setDeleting]=useState(false);
 useEffect(()=>{productLoop.init();setMounted(true);return productLoop.subscribe(()=>refresh(x=>x+1));},[]);
 const configured=mounted&&productLoop.configured, enabled=mounted&&productLoop.enabled, signal=mounted&&privacySignal();
 const blocked=!mounted||Platform.OS!=='web'||signal||!configured;
 return <View style={s.card}><Text style={s.heading}>Help REDKO improve MedLit</Text><Text style={s.body}>Optional first-party analytics measure navigation, appraisal starts, completions, errors and selected control clicks. Aggregate heatmaps show coarse positions inside those controls, with small cells suppressed.</Text><Text style={s.body}>No papers, source identifiers, search terms, URLs, notes, keys, email, account IDs, form contents or screen recordings. A random MedLit-only browser ID rotates after 30 days. REDKO uses a separate MedLit partition in its Supabase telemetry service; it does not join this data to Synaptik health records or your MedLit library.</Text><Pressable accessibilityRole="switch" accessibilityLabel="Share first-party product interactions" aria-checked={enabled} accessibilityState={{checked:enabled,disabled:blocked}} disabled={blocked} onPress={()=>{const next=!productLoop.enabled;if(next)setAnalyticsConsent(false);productLoop.setConsent(next);setMessage(productLoop.enabled?'Optional first-party collection is on. PostHog collection is off.':'Optional first-party collection is off. Unsent events were discarded.');}} style={s.button}><Text style={s.buttonText}>{enabled?'Turn first-party analytics off':'Allow first-party product interactions'}</Text></Pressable><Text style={s.body}>{signal?'Your browser privacy signal keeps optional analytics off.':!configured?'First-party collection is not configured in this build.':'Active-store events are pruned daily, with a target maximum retention of 90 days. Provider network/security logs and backups have separate retention.'} Analytics is separate from your library, account and AI-provider connection.</Text><Pressable accessibilityRole="button" disabled={deleting} onPress={()=>{setDeleting(true);void productLoop.erase().then(()=>setMessage('Collection is off. Deletion was confirmed for analytics identities retained by this browser.')).catch(()=>setMessage('Deletion could not be confirmed. Your deletion keys are retained; please retry when connected.')).finally(()=>setDeleting(false));}} style={s.button}><Text style={s.buttonText}>{deleting?'Deleting analytics…':'Delete this browser’s product analytics'}</Text></Pressable>{message?<Text accessibilityLiveRegion="polite" style={s.body}>{message}</Text>:null}</View>;
}
