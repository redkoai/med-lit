import type { AIProvider } from '../types';
import { PROVIDERS, validateKeyFormat } from '../constants/providers';

export type ProviderFailureReason = 'credentials' | 'permission' | 'billing' | 'rate_limit' | 'model' | 'network' | 'timeout' | 'provider' | 'output';
export class ProviderRequestError extends Error {
  constructor(message: string, readonly reason: ProviderFailureReason) { super(message); this.name = 'ProviderRequestError'; }
}
export function providerFailureReason(error: unknown): ProviderFailureReason | 'unknown' {
  return error instanceof ProviderRequestError ? error.reason : 'unknown';
}

export function providerError(provider: AIProvider, status: number): Error {
  const name = PROVIDERS[provider].name;
  const detail = status === 401 ? 'The key was not accepted. Check that it belongs to this provider and has not expired.'
    : status === 403 ? 'This key does not have permission. Check API restrictions and model access in your provider account.'
    : status === 402 ? 'Your provider balance is insufficient. Add credits in your provider account.'
    : status === 429 ? 'Your provider quota or rate limit was reached. Check billing and limits, then retry.'
    : status === 404 ? 'This model is unavailable to your account. Select another model in AI settings.'
    : status === 400 ? 'The provider rejected this request. Choose a text-generation model supported by this API and check its context limit.'
    : status >= 500 ? 'The provider is temporarily unavailable. Try again shortly.'
    : 'The request failed. Check your connection and provider settings.';
  return new ProviderRequestError(`${name}: ${detail} (${status})`, status === 401 ? 'credentials' : status === 403 ? 'permission' : status === 402 ? 'billing' : status === 429 ? 'rate_limit' : status === 400 || status === 404 ? 'model' : 'provider');
}

export async function providerFetch(provider: AIProvider, url: string, init: RequestInit): Promise<Response> {
  let response: Response;
  try {
    response = await fetch(url, { ...init, credentials: 'omit', redirect: 'error', cache: 'no-store', signal: init.signal ?? AbortSignal.timeout(120000) });
  } catch (error) {
    const timedOut = error instanceof Error && /timeout|abort/i.test(error.name);
    throw new ProviderRequestError(timedOut
      ? `${PROVIDERS[provider].name} took too long to respond. Try again or choose a faster model.`
      : `${PROVIDERS[provider].name} could not be reached. Check your connection and whether your key allows requests from this website.`, timedOut ? 'timeout' : 'network');
  }
  if (!response.ok) throw providerError(provider, response.status);
  return response;
}

/** Direct BYOK requests: credentials never pass through a MedLit server. */
export async function callProvider(provider: AIProvider, key: string, model: string, system: string, prompt: string, maxTokens = 12000): Promise<string> {
  const invalid = validateKeyFormat(provider, key);
  if (invalid) throw new ProviderRequestError(invalid, 'credentials');
  model = model.trim().replace(/^models\//, '');
  if (!model || model.length > 200 || /\s|[<>?#]/.test(model)) throw new ProviderRequestError('Choose a valid text model in AI settings.', 'model');
  let url: string, headers: Record<string, string>, body: unknown;
  if (provider === 'claude') {
    url = 'https://api.anthropic.com/v1/messages';
    headers = { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' };
    body = { model, max_tokens: maxTokens, system, messages: [{ role: 'user', content: prompt }] };
  } else if (provider === 'gemini') {
    url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    headers = { 'x-goog-api-key': key };
    body = { systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: maxTokens, responseMimeType: 'application/json' } };
  } else if (provider === 'openai') {
    url = 'https://api.openai.com/v1/responses'; headers = { Authorization: `Bearer ${key}` };
    body = { model, store: false, instructions: system, input: [{ role: 'user', content: prompt }], max_output_tokens: maxTokens, text: { format: { type: 'json_object' } } };
  } else {
    url = 'https://openrouter.ai/api/v1/chat/completions'; headers = { Authorization: `Bearer ${key}` };
    body = { model, max_tokens: maxTokens, messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }], response_format: { type: 'json_object' }, provider: { require_parameters: true } };
  }
  const response = await providerFetch(provider, url, { method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  let data: any;
  try { data = await response.json(); } catch { throw new ProviderRequestError('The provider returned an unreadable response. Try again; no appraisal was saved.', 'output'); }
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new ProviderRequestError('The provider returned an unexpected response. No appraisal was saved.', 'output');
  let text = '';
  let truncated = false;
  if (provider === 'claude') {
    truncated = data.stop_reason === 'max_tokens';
    text = (data.content ?? []).filter((part: any) => part.type === 'text').map((part: any) => part.text ?? '').join('');
  } else if (provider === 'gemini') {
    truncated = data.candidates?.[0]?.finishReason === 'MAX_TOKENS';
    text = (data.candidates?.[0]?.content?.parts ?? []).filter((part: any) => !part.thought).map((part: any) => part.text ?? '').join('');
  } else if (provider === 'openai') {
    truncated = data.status === 'incomplete';
    if (data.status === 'failed' || data.error) throw new ProviderRequestError('OpenAI could not complete the response. Check your model and account limits.', 'provider');
    text = (data.output ?? []).flatMap((item: any) => item.content ?? []).filter((part: any) => part.type === 'output_text').map((part: any) => part.text ?? '').join('');
  } else {
    truncated = data.choices?.[0]?.finish_reason === 'length';
    text = data.choices?.[0]?.message?.content ?? '';
  }
  if (truncated) throw new ProviderRequestError('The model reached its output limit before finishing. Choose another model or use a shorter article; no partial appraisal was saved.', 'output');
  if (typeof text !== 'string' || !text.trim()) throw new ProviderRequestError('The provider returned no usable text. The request may have been declined or the selected model may not support this task. Choose another text model.', 'output');
  return text;
}
