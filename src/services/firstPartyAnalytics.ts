import {getProductLoop} from '../../packages/redko-product-loop/client';
/** Dedicated telemetry partition; never imports Synaptik auth or wellbeing modules. */
export const productLoop=getProductLoop({product:'medlit',url:process.env.EXPO_PUBLIC_ENABLE_REDKO_LOOP==='true'?(process.env.EXPO_PUBLIC_REDKO_LOOP_URL??''):'',publishableKey:process.env.EXPO_PUBLIC_REDKO_LOOP_PUBLISHABLE_KEY??'',productionHosts:['medlit-evidence-appraisal.vercel.app']});
