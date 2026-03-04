import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppSettings } from '../types';

const SETTINGS_KEY = '@medlit:settings';

const DEFAULT_SETTINGS: AppSettings = {
  claudeApiKey: '',
  claudeModel: 'claude-sonnet-4-6',
  unpaywallEmail: 'medlit@example.com',
  sciHubEnabled: false,
  sciHubMirror: 'sci-hub.se',
  corsProxyUrl: 'https://corsproxy.io/?',
  saveHistory: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY).then((raw) => {
      if (raw) {
        try {
          const saved = JSON.parse(raw) as Partial<AppSettings>;
          setSettings({ ...DEFAULT_SETTINGS, ...saved });
        } catch { /* ignore */ }
      }
      setLoaded(true);
    });
  }, []);

  const saveSettings = useCallback(async (updated: Partial<AppSettings>) => {
    const next = { ...settings, ...updated };
    setSettings(next);
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  }, [settings]);

  const clearSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    await AsyncStorage.removeItem(SETTINGS_KEY);
  }, []);

  return { settings, saveSettings, clearSettings, loaded };
}
