type RevocationInput={apiKey:string;idToken:string;authorizationCode:string;bundleId:string;tenantId?:string|null};
/** Native Apple returns an authorization code, not an OAuth access token.
 * Match Firebase's iOS RevokeTokenRequest (CODE=3), including the app identity.
 * https://github.com/firebase/firebase-ios-sdk/blob/main/FirebaseAuth/Sources/Swift/Backend/RPC/RevokeTokenRequest.swift
 */
export async function revokeNativeAppleToken(input:RevocationInput,request:typeof fetch=fetch):Promise<void>{
 if(!input.apiKey||!input.idToken||!input.authorizationCode||!input.bundleId)throw new Error('Apple account deletion is not configured.');
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
 try{
  const response=await request(`https://identitytoolkit.googleapis.com/v2/accounts:revokeToken?key=${encodeURIComponent(input.apiKey)}`,{
   method:'POST',headers:{'Content-Type':'application/json','X-Ios-Bundle-Identifier':input.bundleId},signal:controller.signal,
   body:JSON.stringify({providerId:'apple.com',tokenType:'CODE',token:input.authorizationCode,idToken:input.idToken,...(input.tenantId?{tenantId:input.tenantId}:{})}),
  });
  if(!response.ok)throw new Error('revocation failed');
 }catch{
  // Provider responses can contain credential context. Do not log or display them.
  throw new Error('Apple access could not be revoked. Please confirm your Apple sign-in and try again.');
 }finally{clearTimeout(timeout);}
}
