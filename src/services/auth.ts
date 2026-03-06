/**
 * Authentication service for MedLit.
 * Supports email/password and Google sign-in.
 * Creates/updates user profile in Firestore on sign-in.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { doc, setDoc, deleteDoc, collection, getDocs, writeBatch, serverTimestamp } from 'firebase/firestore';
import { getAuth, getDB } from './firebase';

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
  await upsertUserProfile(credential.user, true);
  return credential.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const auth = getAuth();
  if (!auth) throw new Error('Firebase not configured');
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await upsertUserProfile(credential.user);
  return credential.user;
}

export async function signInWithGoogle(): Promise<User> {
  const auth = getAuth();
  if (!auth) throw new Error('Firebase not configured');
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth, provider);
  // For Google sign-in, first sign-in acts as sign-up too
  await upsertUserProfile(credential.user, true);
  return credential.user;
}

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

  // Re-authenticate if email/password user
  if (password && user.email) {
    const credential = EmailAuthProvider.credential(user.email, password);
    await reauthenticateWithCredential(user, credential);
  }

  // Delete user data from Firestore
  const db = getDB();
  if (db) {
    try {
      const historyCol = collection(db, 'users', user.uid, 'history');
      const historyDocs = await getDocs(historyCol);
      if (historyDocs.size > 0) {
        const batch = writeBatch(db);
        historyDocs.docs.forEach((d) => batch.delete(d.ref));
        await batch.commit();
      }
      await deleteDoc(doc(db, 'users', user.uid));
    } catch {
      // Continue with account deletion even if data cleanup fails
    }
  }

  await deleteUser(user);
}

export function onAuthStateChanged(callback: (user: User | null) => void): Unsubscribe | null {
  const auth = getAuth();
  if (!auth) return null;
  return firebaseOnAuthStateChanged(auth, callback);
}
