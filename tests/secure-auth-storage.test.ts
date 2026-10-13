import test from 'node:test';
import assert from 'node:assert/strict';
import {createSecureAuthStorage} from '../src/services/secureAuthStorageCore';
function fixture(){const entries=new Map<string,string>(),legacy:string[]=[];let seq=0,failIndex=false;
 const store=createSecureAuthStorage({getItemAsync:async key=>entries.get(key)??null,setItemAsync:async(key,value)=>{if(failIndex&&key==='auth.key')throw new Error('Keychain write failed');assert.ok(Buffer.byteLength(value)<=2048);entries.set(key,value);},deleteItemAsync:async key=>{entries.delete(key);}},async()=>'auth.key',()=>`abcd-${++seq}`,async key=>{legacy.push(key);});
 return {store,entries,legacy,fail:()=>{failIndex=true;}};
}
test('secure auth chunks preserve Unicode, remove only the requested legacy key, and delete credentials',async()=>{const f=fixture(),value=JSON.stringify({name:'🙂é汉'.repeat(750),refreshToken:'fictional-test-token'});await f.store.setItem('firebase:account-A',value);assert.equal(await f.store.getItem('firebase:account-A'),value);assert.ok(f.entries.size>2);assert.ok(f.legacy.every(key=>key==='firebase:account-A'));await f.store.removeItem('firebase:account-A');assert.equal(f.entries.size,0);});
test('failed index commit preserves the prior complete session and cleans uncommitted chunks',async()=>{const f=fixture();await f.store.setItem('firebase:A','previous');const before=[...f.entries];f.fail();await assert.rejects(f.store.setItem('firebase:A','next'.repeat(1000)));assert.deepEqual([...f.entries],before);assert.equal(await f.store.getItem('firebase:A'),'previous');});
test('incomplete and malformed secure session indices fail closed',async()=>{const f=fixture();f.entries.set('auth.key',JSON.stringify({id:'abcd-1',count:129}));await assert.rejects(f.store.getItem('firebase:A'));f.entries.set('auth.key',JSON.stringify({id:'abcd-1',count:2}));await assert.rejects(f.store.getItem('firebase:A'));});
