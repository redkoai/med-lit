import { OAuthProvider, GoogleAuthProvider, reauthenticateWithPopup, signInWithPopup, revokeAccessToken, type Auth, type User } from 'firebase/auth';
export type SocialProvider = 'google' | 'apple';
function provider(kind: SocialProvider) {
  if (kind === 'google') return new GoogleAuthProvider();
  const apple = new OAuthProvider('apple.com'); apple.addScope('email'); apple.addScope('name'); return apple;
}
export async function socialSignIn(auth: Auth, kind: SocialProvider) { return signInWithPopup(auth, provider(kind)); }
export async function socialReauthenticate(auth: Auth, user: User, kind: SocialProvider) {
  const result = await reauthenticateWithPopup(user, provider(kind));
  const token = kind === 'apple' ? OAuthProvider.credentialFromResult(result)?.accessToken : undefined;
  if(kind==='apple'&&!token)throw new Error('Apple authorization must be renewed before deletion.');
  return async () => { if (token) await revokeAccessToken(auth, token); };
}
