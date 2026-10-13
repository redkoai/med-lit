/**
 * Firebase initialization for MedLit.
 * Provides optional Firestore user-library sync and Auth. Production releases
 * must use a dedicated MedLit Firebase project and owner-scoped rules.
 */

import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import { getFirestore, type Firestore } from 'firebase/firestore';
import {
  getAuth as firebaseGetAuth,
  initializeAuth,
  type Persistence,
  type Auth,
} from 'firebase/auth';
import * as FirebaseAuthModule from 'firebase/auth';
import {secureAuthStorage} from './secureAuthStorage';
import { Platform } from 'react-native';
import { isDedicatedMedLitCloud, MEDLIT_FIREBASE_APP_NAME } from './projectBoundary';

// ─── Config ──────────────────────────────────────────────────────────────────

function getFirebaseConfig() {
  const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;

  if (!isDedicatedMedLitCloud({
    enabled: process.env.EXPO_PUBLIC_ENABLE_MEDLIT_CLOUD,
    dedicatedProjectId: process.env.EXPO_PUBLIC_MEDLIT_PROJECT_ID,
    apiKey, authDomain, projectId, appId,
  })) return null;
  return { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };
}

/** Authentication and cloud sync are intentionally unavailable without a
 * complete, dedicated MedLit Firebase configuration. */
export function isFirebaseConfigured(): boolean {
  return getFirebaseConfig() !== null;
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let appCheckInitialized = false;

type ReactNativePersistenceFactory = (storage: typeof secureAuthStorage) => Persistence;

function nativePersistence(): Persistence {
  // Firebase exposes this documented API only from its React Native export
  // condition. Metro selects that condition for native bundles, while the web
  // type surface intentionally omits it.
  const factory = (FirebaseAuthModule as typeof FirebaseAuthModule & {
    getReactNativePersistence?: ReactNativePersistenceFactory;
  }).getReactNativePersistence;
  if (!factory) throw new Error('Firebase React Native persistence is unavailable.');
  return factory(secureAuthStorage);
}

function initializeWebAppCheck(firebaseApp: FirebaseApp): void {
  if (appCheckInitialized || Platform.OS !== 'web' || typeof window === 'undefined') return;
  const siteKey = process.env.EXPO_PUBLIC_FIREBASE_APPCHECK_SITE_KEY;
  if (!siteKey) return;
  try {
    initializeAppCheck(firebaseApp, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
    appCheckInitialized = true;
  } catch {
    // App Check initialization can be retried on the next app load.
  }
}

function getApp(): FirebaseApp | null {
  if (app) return app;
  const config = getFirebaseConfig();
  if (!config) return null;
  try {
    const existing = getApps().find((candidate) => candidate.name === MEDLIT_FIREBASE_APP_NAME);
    if (existing && existing.options.projectId !== config.projectId) return null;
    app = existing ?? initializeApp(config, MEDLIT_FIREBASE_APP_NAME);
    initializeWebAppCheck(app);
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
    auth = Platform.OS === 'web'
      ? firebaseGetAuth(firebaseApp)
      : initializeAuth(firebaseApp, {
        persistence: nativePersistence(),
      });
    return auth;
  } catch {
    try {
      auth = firebaseGetAuth(firebaseApp);
      return auth;
    } catch {
      return null;
    }
  }
}
