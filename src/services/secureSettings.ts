import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import type { AppSettings } from '../types';

export type ProviderSecrets = Pick<AppSettings, 'claudeApiKey' | 'openAiApiKey' | 'geminiApiKey' | 'openRouterApiKey'>;

const SECRET_KEY = 'medlit.provider-keys.v1';
let memorySecrets: ProviderSecrets = { claudeApiKey: '', openAiApiKey: '', geminiApiKey: '', openRouterApiKey: '' };

function removeLegacyBrowserKeys(): void {
  try { if (typeof window !== 'undefined') window.sessionStorage.removeItem(SECRET_KEY); } catch { /* Storage may be disabled. */ }
}

export async function loadProviderSecrets(): Promise<ProviderSecrets> {
  if (Platform.OS === 'web') {
    removeLegacyBrowserKeys();
    return { ...memorySecrets };
  }
  try {
    const raw = await SecureStore.getItemAsync(SECRET_KEY);
    if (!raw) return memorySecrets;
    const parsed = JSON.parse(raw) as Partial<ProviderSecrets>;
    memorySecrets = {
      claudeApiKey: typeof parsed.claudeApiKey === 'string' ? parsed.claudeApiKey : '',
      openAiApiKey: typeof parsed.openAiApiKey === 'string' ? parsed.openAiApiKey : '',
      geminiApiKey: typeof parsed.geminiApiKey === 'string' ? parsed.geminiApiKey : '',
      openRouterApiKey: typeof parsed.openRouterApiKey === 'string' ? parsed.openRouterApiKey : '',
    };
  } catch {
    // Keep the in-memory values if secure storage is unavailable.
  }
  return { ...memorySecrets };
}

export async function saveProviderSecrets(secrets: ProviderSecrets): Promise<void> {
  if (Platform.OS === 'web') {
    removeLegacyBrowserKeys();
    memorySecrets = { ...secrets };
    return;
  }
  await SecureStore.setItemAsync(SECRET_KEY, JSON.stringify(secrets), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  memorySecrets = { ...secrets };
}

export async function clearProviderSecrets(): Promise<void> {
  memorySecrets = { claudeApiKey: '', openAiApiKey: '', geminiApiKey: '', openRouterApiKey: '' };
  if (Platform.OS === 'web') {
    removeLegacyBrowserKeys();
    return;
  }
  await SecureStore.deleteItemAsync(SECRET_KEY);
}
