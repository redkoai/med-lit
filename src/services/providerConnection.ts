import type { AIProvider } from '../types';
import { validateKeyFormat } from '../constants/providers';
import { callProvider, ProviderRequestError, providerError } from './providerTransport';
export type ProviderModel = { id: string; name: string };
export type ConnectionResult = { models: ProviderModel[]; warning?: string };
/** A model-list check is optional: restricted inference keys may not list models. */
export async function checkProviderConnection(provider: AIProvider, key: string): Promise<ConnectionResult> {
  const invalid = validateKeyFormat(provider, key);
  if (invalid) throw new Error(invalid);
  const url = provider === 'openrouter' ? 'https://openrouter.ai/api/v1/models' : provider === 'openai' ? 'https://api.openai.com/v1/models'
    : provider === 'claude' ? 'https://api.anthropic.com/v1/models?limit=100' : 'https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000';
  const headers: Record<string, string> = provider === 'openai' || provider === 'openrouter' ? { Authorization: `Bearer ${key}` }
    : provider === 'claude' ? { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' } : { 'x-goog-api-key': key };
  let response: Response;
  try { response = await fetch(url, { headers, signal: AbortSignal.timeout(15000), credentials: 'omit', redirect: 'error', cache: 'no-store' }); }
  catch { throw new Error('The provider could not be reached. Check your connection and key restrictions, then try again.'); }
  if (response.status === 403) return { models: [], warning: 'This key cannot list models. Enter a model ID and connect; generation access will be checked when you appraise a paper.' };
  if (!response.ok) throw providerError(provider, response.status);
  let data: any;
  try { data = await response.json(); } catch { throw new ProviderRequestError('The provider returned an unreadable model list. Enter a model ID and test it directly.', 'output'); }
  if (!data || typeof data !== 'object') throw new ProviderRequestError('The provider returned an unexpected model list. Enter a model ID and test it directly.', 'output');
  const rows = provider === 'gemini' ? data.models ?? [] : data.data ?? [];
  if (!Array.isArray(rows)) throw new ProviderRequestError('The provider returned an unexpected model list. Enter a model ID and test it directly.', 'output');
  const models = rows.filter((m: any) => m && typeof m === 'object' && (provider !== 'gemini' || Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent')))
    .map((m: any) => ({ id: String(m.id ?? m.name ?? '').replace(/^models\//, ''), name: String(m.display_name ?? m.displayName ?? m.name ?? m.id ?? '').replace(/^models\//, '') }))
    .filter((m: ProviderModel) => m.id && (provider !== 'openai' || /^(gpt-|o[1-9]|chatgpt-)/.test(m.id)) && !/audio|realtime|image|tts|transcribe|embedding/i.test(m.id))
    .sort((a: ProviderModel, b: ProviderModel) => a.id.localeCompare(b.id));
  return { models, ...(provider === 'openrouter' ? { warning: 'OpenRouter’s model catalog is public. Key and balance are verified when you run an appraisal.' } : {}) };
}

/** Exercise the same structured-output transport used by appraisals, without sending a paper. */
export async function testProviderConnection(provider: AIProvider, key: string, model: string): Promise<void> {
  const text = await callProvider(provider, key.trim(), model, 'Return only a JSON object.', 'Reply with {"connected":true}.', 2048);
  let result: unknown;
  try { result = JSON.parse(text.trim().replace(/^```(?:json)?\s*|\s*```$/g, '')); } catch { /* Reject unstructured output. */ }
  if (!result || typeof result !== 'object' || Array.isArray(result) || (result as {connected?: unknown}).connected !== true) {
    throw new ProviderRequestError('The model responded, but did not complete the structured connection test. Choose another text model and try again.', 'output');
  }
}
