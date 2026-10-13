import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import ts from 'typescript';

// Exercise native module evaluation without installing Google sign-in in the
// host. This reproduces the Expo Go guest-start crash; no identity request runs.
function loadNative(path:string,available=false){
 const source=readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
 const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.React,esModuleInterop:true}}).outputText;
 let googleLoads=0;const exports:Record<string,any>={};
 const require=(name:string)=>{
  if(name==='react-native')return {Platform:{OS:'android'},TurboModuleRegistry:{get:()=>available?{}:null}};
  if(name==='@react-native-google-signin/google-signin'){
   googleLoads++;if(!available)throw new Error('RNGoogleSignin is missing');
   return {GoogleSignin:{configure:()=>{},hasPlayServices:async()=>true,signIn:async()=>({type:'cancelled'})},isSuccessResponse:(r:{type:string})=>r.type==='success'};
  }
  if(name==='firebase/auth')return {signInWithCredential:()=>{throw new Error('Must not contact Firebase');}};
  return {};
 };
 runInNewContext(code,{require,exports,module:{exports},process:{env:{EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID:'synthetic-client'}},console});
 return {exports,googleLoads:()=>googleLoads};
}

test('guest bootstrap tolerates an absent optional Google native module',async()=>{
 const auth=loadNative('src/services/socialAuth.native.ts');
 const buttons=loadNative('src/components/SocialButtons.native.tsx');
 assert.equal(typeof buttons.exports.default,'function');
 assert.equal(auth.googleLoads(),0);assert.equal(buttons.googleLoads(),0);
 await assert.rejects(auth.exports.socialSignIn({},'google'),/Google sign-in is unavailable/);
 assert.equal(auth.googleLoads(),0);
});

test('Google integration is loaded on demand when the native module exists',async()=>{
 const auth=loadNative('src/services/socialAuth.native.ts',true);
 assert.equal(auth.googleLoads(),0);
 await assert.rejects(auth.exports.socialSignIn({},'google'),/Sign-in was cancelled/);
 assert.equal(auth.googleLoads(),1);
});
