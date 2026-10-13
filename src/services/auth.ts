/**
 * Authentication service for MedLit.
 * Supports email/password and Google sign-in.
 * Creates/updates user profile in Firestore on sign-in.
 */

import {
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { doc, setDoc, deleteDoc, collection, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';
import { Platform } from 'react-native';
import { getAuth, getDB } from './firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { libraryKey } from './libraryStorage';
import { captureEvent } from './productAnalytics';
import {socialSignIn,socialReauthenticate} from './socialAuth';
import { configuredAccountProviders } from './accountProviderAvailability';

/** Create or update user profile document in Firestore */
async function upsertUserProfile(user: User, isNewUser = false): Promise<void> {
  const db = getDB();
  if (!db) return;
  try {
    const userRef = doc(db, 'users', user.uid);
    const data: Record<string, unknown> = {
      email: user.email,
      displayName: user.displayName || null,
      photoURL: user.photoURL || null,
      lastActiveAt: serverTimestamp(),
    };
    if (isNewUser) {
      data.createdAt = serverTimestamp();
      data.totalAnalyses = 0;
      data.provider = user.providerData[0]?.providerId || 'email';
    }
    await setDoc(userRef, data, { merge: true });
  } catch {
    // Silent fail — profile sync is non-critical
  }
}

export async function signUpWithEmail(email: string, password: string): Promise<User> {
  const auth = getAuth();
  if (!auth) throw new Error('Firebase not configured');
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  void captureEvent('account_created');
  await upsertUserProfile(credential.user, getAdditionalUserInfo(credential)?.isNewUser === true);
  return credential.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const auth = getAuth();
  if (!auth) throw new Error('Firebase not configured');
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await upsertUserProfile(credential.user);
  return credential.user;
}

async function signInWithSocial(kind:'google'|'apple'):Promise<User>{
 const auth=getAuth();if(!auth)throw new Error('Account services are not configured.');
 if(!configuredAccountProviders(true,Platform.OS)[kind])throw Object.assign(new Error('This sign-in provider is not enabled in this build.'),{code:'auth/operation-not-allowed'});
 const credential=await socialSignIn(auth,kind);
 if(getAdditionalUserInfo(credential)?.isNewUser)void captureEvent('account_created');
 await upsertUserProfile(credential.user,getAdditionalUserInfo(credential)?.isNewUser===true);return credential.user;
}
export const signInWithGoogle=()=>signInWithSocial('google');
export const signInWithApple=()=>signInWithSocial('apple');

export async function signOut(): Promise<void> {
  const auth = getAuth();
  if (!auth) return;
  await firebaseSignOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  const auth = getAuth();
  if (!auth) throw new Error('Firebase not configured');
  await sendPasswordResetEmail(auth, email);
}

export async function deleteAccount(password?: string): Promise<void> {
  const auth = getAuth();
  if (!auth || !auth.currentUser) throw new Error('Not signed in');

  const user = auth.currentUser;

  const providerId = user.providerData[0]?.providerId;
  let revoke=async()=>{};
  if (providerId === 'password' && user.email) {
    if (!password) throw new Error('Enter your password to confirm account deletion.');
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  } else if (providerId === 'google.com' || providerId === 'apple.com') {
    revoke=await socialReauthenticate(auth,user,providerId==='apple.com'?'apple':'google');
  } else throw new Error('This sign-in method cannot confirm deletion yet.');
  if(auth.currentUser?.uid!==user.uid)throw new Error('The account changed. Please try again.');

  // Delete every known user-owned subcollection before removing the profile.
  // Firestore does not cascade subcollection deletion when a parent is deleted.
  const db = getDB();
  if (db) {
    for (const collectionName of ['analyses', 'history', 'settings']) {
      const snapshot = await getDocs(collection(db, 'users', user.uid, collectionName));
      for (let start = 0; start < snapshot.docs.length; start += 400) {
        const batch = writeBatch(db);
        snapshot.docs.slice(start, start + 400).forEach((item) => batch.delete(item.ref));
        await batch.commit();
      }
    }
    await deleteDoc(doc(db, 'users', user.uid));
  }

  // Remove this account's device cache, not another account's or guest work.
  await AsyncStorage.removeItem(libraryKey(user.uid));
  await revoke();
  await deleteUser(user);
}

export function onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe | null {
  const auth = getAuth();
  if (!auth) return null;
  return firebaseOnAuthStateChanged(auth, callback);
}
