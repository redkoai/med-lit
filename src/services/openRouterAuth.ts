/** Public-client OAuth: only a short-lived PKCE verifier is persisted.
 * User API keys are returned to page memory, never to MedLit servers/storage.
 */
export const OPENROUTER_PENDING_KEY = 'medlit.openrouter.pending.v1';
const MAX_AGE_MS = 10 * 60 * 1000;
interface StoragePort { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void; }
interface Pending { state: string; verifier: string; origin: string; createdAt: number; article: string; }
function randomHex() { return Array.from(crypto.getRandomValues(new Uint8Array(32)), b => b.toString(16).padStart(2, '0')).join(''); }
function safeOrigin(value: string): string {
  const url = new URL(value);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && url.hostname === 'localhost')) throw new Error('Use the HTTPS MedLit site to connect your account.');
  if (url.origin !== value || url.username || url.password) throw new Error('Invalid connection origin.');
  return url.origin;
}
export async function prepareOpenRouterLogin(origin: string, storage: StoragePort, article = '', now = Date.now()): Promise<string> {
  safeOrigin(origin);
  const verifier = randomHex();
  const state = randomHex();
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const challenge = btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const pending: Pending = { state, verifier, origin, createdAt: now, article: article.slice(0, 2048) };
  storage.setItem(OPENROUTER_PENDING_KEY, JSON.stringify(pending));
  const callback = new URL('/connect', origin);
  callback.searchParams.set('state', state);
  const target = new URL('https://openrouter.ai/auth');
  target.searchParams.set('callback_url', callback.href);
  target.searchParams.set('code_challenge', challenge);
  target.searchParams.set('code_challenge_method', 'S256');
  return target.href;
}
export async function finishOpenRouterLogin(callbackUrl: string, origin: string, storage: StoragePort, request: typeof fetch = fetch, now = Date.now()): Promise<{ key: string; article: string }> {
  const callback = new URL(callbackUrl);
  safeOrigin(origin);
  if (callback.origin !== origin || callback.pathname !== '/connect') throw new Error('This connection returned to the wrong site. Start again from MedLit.');
  const raw = storage.getItem(OPENROUTER_PENDING_KEY);
  if (!raw) throw new Error('This connection has expired or was already used. Please connect again.');
  let pending: Pending;
  try { pending = JSON.parse(raw); } catch { storage.removeItem(OPENROUTER_PENDING_KEY); throw new Error('Connection state could not be read. Please connect again.'); }
  if (!pending || typeof pending.createdAt !== 'number' || now < pending.createdAt || now - pending.createdAt > MAX_AGE_MS) {
    storage.removeItem(OPENROUTER_PENDING_KEY); throw new Error('This connection has expired. Please connect again.');
  }
  if (pending.origin !== origin || !/^[a-f0-9]{64}$/.test(pending.state) || !/^[a-f0-9]{64}$/.test(pending.verifier) || callback.searchParams.getAll('state').length !== 1 || callback.searchParams.get('state') !== pending.state) throw new Error('The connection could not be verified. Please start again from MedLit.');
  storage.removeItem(OPENROUTER_PENDING_KEY); // One use, including failed exchanges.
  const code = callback.searchParams.get('code');
  if (callback.searchParams.has('error') || !code || code.length > 2048 || callback.searchParams.getAll('code').length !== 1) throw new Error('Connection was cancelled or no authorization was returned. Please try again.');
  let response: Response;
  try {
    response = await request('https://openrouter.ai/api/v1/auth/keys', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, code_verifier: pending.verifier, code_challenge_method: 'S256' }),
      credentials: 'omit', redirect: 'error', cache: 'no-store', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(15000),
    });
  } catch { throw new Error('OpenRouter could not be reached. Please start a new connection.'); }
  if (!response.ok) throw new Error('OpenRouter could not complete this connection. Please connect again.');
  let result: { key?: unknown };
  try { result = await response.json(); } catch { throw new Error('OpenRouter returned an unreadable response. Please reconnect.'); }
  if (typeof result?.key !== 'string' || !/^sk-or-v1-[A-Za-z0-9_-]{20,450}$/.test(result.key)) throw new Error('OpenRouter did not return a valid connection. Please reconnect.');
  return { key: result.key, article: typeof pending.article === 'string' ? pending.article.slice(0, 2048) : '' };
}
