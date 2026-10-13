import Constants from 'expo-constants';
import {revokeNativeAppleToken} from './appleTokenRevocation';
import { Platform, TurboModuleRegistry } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { OAuthProvider, GoogleAuthProvider, reauthenticateWithCredential, signInWithCredential, type Auth, type User } from 'firebase/auth';
export type SocialProvider = 'google' | 'apple';
async function credentials(kind: SocialProvider) {
  if (kind === 'google') {
    const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
    const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    if (!webClientId || (Platform.OS === 'ios' && !iosClientId)) throw new Error('Google sign-in is not connected in this build.');
    if (!TurboModuleRegistry.get('RNGoogleSignin')) throw new Error('Google sign-in is unavailable in this version of the app. Continue with email or on this device.');
    const { GoogleSignin, isSuccessResponse } = await import('@react-native-google-signin/google-signin');
    GoogleSignin.configure({iosClientId, webClientId, offlineAccess:false});
    if (Platform.OS === 'android') await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog:true});
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response) || !response.data.idToken) throw new Error('Sign-in was cancelled.');
    return { credential: GoogleAuthProvider.credential(response.data.idToken), revoke: async (_auth:Auth) => { await GoogleSignin.revokeAccess(); } };
  }
  if (Platform.OS !== 'ios' || !await AppleAuthentication.isAvailableAsync()) throw new Error('Apple sign-in is unavailable on this device.');
  // Bind the Apple response to this one attempt. Never persist or log these values.
  const rawNonce = Array.from(Crypto.getRandomBytes(32), byte => byte.toString(16).padStart(2,'0')).join('');
  const nonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  const result = await AppleAuthentication.signInAsync({requestedScopes:[AppleAuthentication.AppleAuthenticationScope.EMAIL,AppleAuthentication.AppleAuthenticationScope.FULL_NAME],nonce});
  if (!result.identityToken) throw new Error('Apple did not return a sign-in token. Please try again.');
  return { credential:new OAuthProvider('apple.com').credential({idToken:result.identityToken,rawNonce}), revoke:async (auth:Auth) => {
    if (!result.authorizationCode) throw new Error('Apple authorization must be renewed before deletion.');
    const user=auth.currentUser;if(!user)throw new Error('Sign in before deleting your account.');
    await revokeNativeAppleToken({apiKey:auth.app.options.apiKey??'',idToken:await user.getIdToken(),authorizationCode:result.authorizationCode,bundleId:Constants.expoConfig?.ios?.bundleIdentifier??'',tenantId:auth.tenantId});
  }};
}
export async function socialSignIn(auth: Auth, kind: SocialProvider) { const result=await credentials(kind); return signInWithCredential(auth,result.credential); }
export async function socialReauthenticate(auth: Auth, user: User, kind: SocialProvider) {
  const result=await credentials(kind); await reauthenticateWithCredential(user,result.credential);
  return () => result.revoke(auth);
}
