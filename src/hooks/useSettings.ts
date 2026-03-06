import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getDB } from '../services/firebase';
import type { AppSettings } from '../types';

const SETTINGS_KEY = '@medlit:settings';
const SETTINGS_MIGRATED_KEY = '@medlit:settings_migrated';

const DEFAULT_SETTINGS: AppSettings = {
  aiProvider: 'claude',
  claudeApiKey: '',
  claudeModel: 'claude-sonnet-4-6',
  openAiApiKey: '',
  openAiModel: 'gpt-4o',
  geminiApiKey: '',
  geminiModel: 'gemini-2.0-flash',
  unpaywallEmail: 'medlit@example.com',
  sciHubEnabled: false,
  sciHubMirror: 'sci-hub.se',
  corsProxyUrl: 'https://corsproxy.io/?',
  saveHistory: true,
};

function getSettingsDoc(uid: string) {
  const db = getDB();
  if (!db) return null;
  return doc(db, 'users', uid, 'settings', 'prefs');
}

export function useSettings(uid?: string | null) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (uid) {
      const ref = getSettingsDoc(uid);
      if (ref) {
        getDoc(ref)
          .then((snap) => {
            if (snap.exists()) {
              setSettings({ ...DEFAULT_SETTINGS, ...snap.data() as Partial<AppSettings> });
            } else {
              // No Firestore settings yet — load local
              loadLocal();
            }
            setLoaded(true);
          })
          .catch(() => {
            loadLocal().then(() => setLoaded(true));
          });

        migrateLocalToFirestore(uid);
        return;
      }
    }

    loadLocal().then(() => setLoaded(true));
  }, [uid]);

  const loadLocal = async () => {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw) {
      try {
        const saved = JSON.parse(raw) as Partial<AppSettings>;
        setSettings({ ...DEFAULT_SETTINGS, ...saved });
      } catch { /* ignore */ }
    }
  };

  const migrateLocalToFirestore = async (userId: string) => {
    try {
      const migrated = await AsyncStorage.getItem(SETTINGS_MIGRATED_KEY);
      if (migrated) return;

      const raw = await AsyncStorage.getItem(SETTINGS_KEY);
      if (!raw) {
        await AsyncStorage.setItem(SETTINGS_MIGRATED_KEY, 'true');
        return;
      }

      const localSettings = JSON.parse(raw) as Partial<AppSettings>;
      const ref = getSettingsDoc(userId);
      if (ref) {
        await setDoc(ref, { ...DEFAULT_SETTINGS, ...localSettings }, { merge: true });
      }
      await AsyncStorage.setItem(SETTINGS_MIGRATED_KEY, 'true');
    } catch {
      // Silent fail
    }
  };

  const saveSettings = useCallback(async (updated: Partial<AppSettings>) => {
    const next = { ...settings, ...updated };
    setSettings(next);

    // Always cache locally
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));

    // Sync to Firestore if authenticated
    if (uid) {
      const ref = getSettingsDoc(uid);
      if (ref) {
        try {
          await setDoc(ref, next, { merge: true });
        } catch { /* silent */ }
      }
    }
  }, [settings, uid]);

  const clearSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    await AsyncStorage.removeItem(SETTINGS_KEY);

    if (uid) {
      const ref = getSettingsDoc(uid);
      if (ref) {
        try {
          await setDoc(ref, DEFAULT_SETTINGS);
        } catch { /* silent */ }
      }
    }
  }, [uid]);

  return { settings, saveSettings, clearSettings, loaded };
}
