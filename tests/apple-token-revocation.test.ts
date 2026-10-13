import test from 'node:test';
import assert from 'node:assert/strict';
import {revokeNativeAppleToken} from '../src/services/appleTokenRevocation';
const input={apiKey:'public-project-key',idToken:'test-id-token',authorizationCode:'test-code',bundleId:'com.example.test'};
test('native Apple deletion exchanges a code rather than mislabeling it as an access token',async()=>{
 await revokeNativeAppleToken({...input,tenantId:'tenant'},async(url,options)=>{
  assert.equal(new URL(String(url)).hostname,'identitytoolkit.googleapis.com');
  assert.equal((options?.headers as Record<string,string>)['X-Ios-Bundle-Identifier'],input.bundleId);
  assert.deepEqual(JSON.parse(String(options?.body)),{providerId:'apple.com',tokenType:'CODE',token:'test-code',idToken:'test-id-token',tenantId:'tenant'});
  return new Response('{}',{status:200});
 });
});
test('failed Apple revocation stops deletion without exposing provider response or transport secrets',async()=>{
 for(const request of [async()=>new Response('private context',{status:400}),async()=>{throw new Error('private credential');}]){
  await assert.rejects(()=>revokeNativeAppleToken(input,request),error=>error instanceof Error&&error.message==='Apple access could not be revoked. Please confirm your Apple sign-in and try again.');
 }
});
test('Apple revocation refuses incomplete app identity before sending any request',async()=>{
 await assert.rejects(()=>revokeNativeAppleToken({...input,bundleId:''},async()=>{assert.fail('must not send');}),/not configured/);
});
