import type {getProductLoop} from '../../packages/redko-product-loop/client';
/** Browser telemetry cannot use React Native's window shim or browser consent.
 * Keep collection off until a separate native consent/storage flow is verified.
 */
export const productLoop:ReturnType<typeof getProductLoop>={
 init:()=>{},record:()=>false,flush:async()=>false,setConsent:()=>{},erase:async()=>{},observe:()=>()=>{},subscribe:()=>()=>{},
 enabled:false,configured:false,delivery:'idle',receipt:null,
};
