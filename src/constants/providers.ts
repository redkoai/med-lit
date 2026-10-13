import type { AIProvider, AppSettings } from '../types';

export const PROVIDERS: Record<AIProvider, {
  name: string; company: string; keyUrl: string; placeholder: string;
  settingsKey: 'claudeApiKey' | 'openAiApiKey' | 'geminiApiKey' | 'openRouterApiKey';
}> = {
  openai: { name: 'OpenAI', company: 'OpenAI', keyUrl: 'https://platform.openai.com/api-keys', placeholder: 'sk-…', settingsKey: 'openAiApiKey' },
  claude: { name: 'Claude', company: 'Anthropic', keyUrl: 'https://console.anthropic.com/settings/keys', placeholder: 'sk-ant-…', settingsKey: 'claudeApiKey' },
  gemini: { name: 'Gemini', company: 'Google', keyUrl: 'https://aistudio.google.com/app/apikey', placeholder: 'AIza…', settingsKey: 'geminiApiKey' },
  openrouter: { name: 'OpenRouter', company: 'OpenRouter', keyUrl: 'https://openrouter.ai/keys', placeholder: 'sk-or-v1-…', settingsKey: 'openRouterApiKey' },
};

export function providerKey(settings: AppSettings): string {
  return settings[PROVIDERS[settings.aiProvider].settingsKey];
}

export function validateKeyFormat(provider: AIProvider, key: string): string | null {
  if (!key.trim()) return 'Paste your API key to continue.';
  if (key.length > 4096 || /\s/.test(key) || /[<>]/.test(key)) return 'This does not look like an API key. Paste only the key, without spaces or extra text.';
  const prefix = provider === 'claude' ? 'sk-ant-' : provider === 'openai' ? 'sk-' : provider === 'openrouter' ? 'sk-or-v1-' : 'AIza';
  if (provider === 'openai' && key.startsWith('sk-or-')) return 'That looks like an OpenRouter key. Choose OpenRouter instead.';
  if (provider === 'openai' && key.startsWith('sk-ant-')) return 'That looks like an Anthropic key. Choose Claude above instead.';
  if ((provider !== 'gemini' && !key.startsWith(prefix)) || key.length < 20) return `Use an API key from ${PROVIDERS[provider].company}. A chat password or subscription login will not work here.`;
  return null;
}

export const MODEL_KEYS = { claude: 'claudeModel', openai: 'openAiModel', gemini: 'geminiModel', openrouter: 'openRouterModel' } as const;
