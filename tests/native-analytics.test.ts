import test from 'node:test';
import assert from 'node:assert/strict';
import {productLoop} from '../src/services/firstPartyAnalytics.native';
test('native telemetry remains off with a React Native window shim and never accesses browser storage',async()=>{
 const before=Object.getOwnPropertyDescriptor(globalThis,'window');
 Object.defineProperty(globalThis,'window',{configurable:true,value:{get localStorage(){throw new Error('Native has no browser consent store');}}});
 try{productLoop.init();productLoop.setConsent(true);assert.equal(productLoop.configured,false);assert.equal(productLoop.enabled,false);assert.equal(productLoop.record('view','home','surface'),false);assert.equal(await productLoop.flush(),false);}
 finally{if(before)Object.defineProperty(globalThis,'window',before);else Reflect.deleteProperty(globalThis,'window');}
});
