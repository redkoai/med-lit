import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteField, doc, getDoc, setDoc } from 'firebase/firestore';
import { getDB } from '../services/firebase';
import {
  clearProviderSecrets,
  loadProviderSecrets,
  saveProviderSecrets,
  type ProviderSecrets,
} from '../services/secureSettings';
import type { AppSettings } from '../types';

const SETTINGS_KEY = '@medlit:preferences:v3';
const LEGACY_SETTINGS_KEY = '@medlit:settings';
const listeners = new Set<() => void>();
export function changed() { listeners.forEach(listener => listener()); }

export const DEFAULT_SETTINGS: AppSettings = {
  aiProvider: 'claude',
  claudeApiKey: '',
  claudeModel: 'claude-sonnet-4-6',
  openAiApiKey: '',
  openAiModel: 'gpt-4.1',
  geminiApiKey: '',
  geminiModel: 'gemini-3.7-flash',
  openRouterApiKey: '',
  openRouterModel: 'openai/gpt-4.1-mini',
  unpaywallEmail: '',
  saveHistory: true,
};

type CloudPreferences = Omit<AppSettings, keyof ProviderSecrets>;

function getSettingsDoc(uid: string) {
  const db = getDB();
  return db ? doc(db, 'users', uid, 'settings', 'prefs') : null;
}

function safePreferences(settings: AppSettings): CloudPreferences {
  return {
    aiProvider: settings.aiProvider,
    claudeModel: settings.claudeModel,
    openAiModel: settings.openAiModel,
    geminiModel: settings.geminiModel,
    openRouterModel: settings.openRouterModel,
    unpaywallEmail: settings.unpaywallEmail,
    saveHistory: settings.saveHistory,
  };
}

function secrets(settings: AppSettings): ProviderSecrets {
  return {
    claudeApiKey: settings.claudeApiKey,
    openAiApiKey: settings.openAiApiKey,
    geminiApiKey: settings.geminiApiKey,
    openRouterApiKey: settings.openRouterApiKey,
  };
}

function normalizeSettings(settings: AppSettings): AppSettings {
  const next = { ...settings, aiProvider: ['claude', 'openai', 'gemini', 'openrouter'].includes(settings.aiProvider) ? settings.aiProvider : 'claude' } as AppSettings;
  for (const field of ['claudeModel', 'openAiModel', 'geminiModel', 'openRouterModel'] as const) {
    const value = settings[field];
    next[field] = typeof value === 'string' && value.trim() && value.length <= 200 && !/\s|[<>?#]/.test(value.trim()) ? value.trim().replace(/^models\//, '') : DEFAULT_SETTINGS[field];
  }
  return next;
}

async function loadLocalSettings(): Promise<AppSettings> {
  let preferences: Partial<CloudPreferences> = {};
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw) preferences = JSON.parse(raw) as Partial<CloudPreferences>;
  } catch {
    // Fall back to defaults.
  }

  // One-way cleanup of the legacy object that may contain provider keys.
  try {
    const legacyRaw = await AsyncStorage.getItem(LEGACY_SETTINGS_KEY);
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as Partial<AppSettings>;
      preferences = { ...safePreferences({ ...DEFAULT_SETTINGS, ...legacy }), ...preferences };
      await saveProviderSecrets({
        claudeApiKey: legacy.claudeApiKey ?? '',
        openAiApiKey: legacy.openAiApiKey ?? '',
        geminiApiKey: legacy.geminiApiKey ?? '',
        openRouterApiKey: '',
      });
      await AsyncStorage.removeItem(LEGACY_SETTINGS_KEY);
    }
  } catch {
    await AsyncStorage.removeItem(LEGACY_SETTINGS_KEY);
  }

  return normalizeSettings({
    ...DEFAULT_SETTINGS,
    ...preferences,
    ...(await loadProviderSecrets()),
  });
}

async function removeLeakedCloudSecrets(uid: string): Promise<void> {
  const ref = getSettingsDoc(uid);
  if (!ref) return;
  await setDoc(ref, {
    claudeApiKey: deleteField(),
    openAiApiKey: deleteField(),
    geminiApiKey: deleteField(),
    openRouterApiKey: deleteField(),
    sciHubEnabled: deleteField(),
    sciHubMirror: deleteField(),
    corsProxyUrl: deleteField(),
  }, { merge: true });
}

export function useSettings(uid?: string | null) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const local = await loadLocalSettings();
      let next = local;
      if (uid) {
        const ref = getSettingsDoc(uid);
        if (ref) {
          try {
            const snapshot = await getDoc(ref);
            if (snapshot.exists()) {
              next = normalizeSettings({
                ...local,
                ...(snapshot.data() as Partial<CloudPreferences>),
                ...secrets(local),
              });
            }
            await removeLeakedCloudSecrets(uid);
          } catch {
            // Local preferences remain available offline.
          }
        }
      }
      if (!cancelled) {
        setSettings(next);
        setLoaded(true);
      }
    };
    void refresh();
    const listener = () => { void refresh(); };
    listeners.add(listener);
    return () => { cancelled = true; listeners.delete(listener); };
  }, [uid]);

  const saveSettings = useCallback(async (updated: Partial<AppSettings>) => {
    const next = normalizeSettings({ ...(await loadLocalSettings()), ...updated });
    await Promise.all([
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(safePreferences(next))),
      saveProviderSecrets(secrets(next)),
    ]);
    setSettings(next);
    changed();
    if (uid) {
      const ref = getSettingsDoc(uid);
      if (ref) await setDoc(ref, safePreferences(next), { merge: true }).catch(() => { /* Local settings stay usable offline. */ });
    }
  }, [settings, uid]);

  const clearSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    await Promise.all([
      AsyncStorage.removeItem(SETTINGS_KEY),
      AsyncStorage.removeItem(LEGACY_SETTINGS_KEY),
      clearProviderSecrets(),
    ]);
    changed();
    if (uid) {
      const ref = getSettingsDoc(uid);
      if (ref) await setDoc(ref, safePreferences(DEFAULT_SETTINGS));
    }
  }, [uid]);

  return { settings, saveSettings, clearSettings, loaded };
}
