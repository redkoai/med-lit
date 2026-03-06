/**
 * Firebase initialization for MedLit.
 * Shared Firebase project with NeuroGames.
 * Provides Firestore (user data sync) and Auth.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import {
  getAuth as firebaseGetAuth,
  type Auth,
} from 'firebase/auth';

// ─── Config ──────────────────────────────────────────────────────────────────

function getFirebaseConfig() {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !projectId) return null;
  return { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

function getApp(): FirebaseApp | null {
  if (app) return app;
  const config = getFirebaseConfig();
  if (!config) return null;
  try {
    app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
    return app;
  } catch {
    return null;
  }
}

export function getDB(): Firestore | null {
  if (db) return db;
  const firebaseApp = getApp();
  if (!firebaseApp) return null;
  try {
    db = getFirestore(firebaseApp);
    return db;
  } catch {
    return null;
  }
}

export function getAuth(): Auth | null {
  if (auth) return auth;
  const firebaseApp = getApp();
  if (!firebaseApp) return null;
  try {
    auth = firebaseGetAuth(firebaseApp);
    return auth;
  } catch {
    return null;
  }
}
