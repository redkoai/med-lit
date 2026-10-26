import {PROVIDERS, REASONS, type LoopEvent} from '../../packages/redko-product-loop/core';
import {productLoop} from './firstPartyAnalytics';
/** Opt-in, allowlisted events only. No autocapture, replay, identity, URL or paper data. */
export type ProductEvent = 'ai_authorized' | 'ai_connection_started' | 'ai_connection_failed' | 'appraisal_saved' | 'appraisal_save_failed' | 'saved_report_opened' | 'ai_connected' | 'appraisal_started' | 'appraisal_completed' | 'appraisal_failed' | 'report_opened' | 'tutorial_opened' | 'account_created' | 'source_packet_prepared';
export const EVENTS: readonly string[] = ['ai_authorized', 'ai_connection_started', 'ai_connection_failed', 'appraisal_saved', 'appraisal_save_failed', 'saved_report_opened', 'ai_connected', 'appraisal_started', 'appraisal_completed', 'appraisal_failed', 'report_opened', 'tutorial_opened', 'account_created', 'source_packet_prepared'];
export const ANALYTICS_CONSENT_KEY = 'medlit.analytics.consent.v1';
const ID_KEY = 'medlit.analytics.id.v1';
export function analyticsConfigured() {
  return process.env.EXPO_PUBLIC_ENABLE_MEDLIT_ANALYTICS === 'true'
    && process.env.EXPO_PUBLIC_ANALYTICS_PRODUCT === 'medlit'
    && /^phc_[A-Za-z0-9]+$/.test(process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '')
    && /^\d+$/.test(process.env.EXPO_PUBLIC_POSTHOG_PROJECT_ID ?? '')
    && ['https://us.i.posthog.com', 'https://eu.i.posthog.com'].includes(process.env.EXPO_PUBLIC_POSTHOG_HOST ?? '');
}
export function analyticsAllowed(): boolean {
  try { return typeof window !== 'undefined' && navigator.doNotTrack !== '1' && !(navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl && window.localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'yes'; } catch { return false; }
}
export function setAnalyticsConsent(allowed: boolean) {
  if (typeof window === 'undefined') return;
  if (allowed) productLoop.setConsent(false);
  window.localStorage.setItem(ANALYTICS_CONSENT_KEY, allowed ? 'yes' : 'no');
  if (!allowed) window.localStorage.removeItem(ID_KEY);
}
export function eventProperties(input: Record<string, unknown> = {}) {
  const output: Record<string, string | boolean> = { '$process_person_profile': false, '$geoip_disable': true };
  if (['openrouter', 'openai', 'claude', 'gemini', 'handoff'].includes(String(input.provider))) output.provider = String(input.provider);
  if (['full_text', 'abstract_only', 'metadata_only'].includes(String(input.coverage))) output.coverage = String(input.coverage);
  if (REASONS.includes(input.reason as any)) output.reason = String(input.reason);
  if (['device','cloud'].includes(String(input.destination))) output.destination = String(input.destination);
  return output;
}
export async function captureEvent(event: ProductEvent, input: Record<string, unknown> = {}): Promise<void> {
  if (!EVENTS.includes(event)) return;
  productLoop.init();
  if (productLoop.enabled) {
    const extra: Partial<Pick<LoopEvent,'provider'|'reason'>> = {};
    if (PROVIDERS.includes(input.provider as any)) extra.provider = input.provider as LoopEvent['provider'];
    if (REASONS.includes(input.reason as any)) extra.reason = input.reason as LoopEvent['reason'];
    if (event === 'ai_authorized') productLoop.record('step_completed','settings','authorize-ai',extra);
    if (event === 'ai_connection_started') productLoop.record('step_started','settings','connect-ai',extra);
    if (event === 'ai_connected') productLoop.record('step_completed','settings','connect-ai',extra);
    if (event === 'ai_connection_failed') productLoop.record('step_failed','settings','connect-ai',extra);
    if (event === 'appraisal_started') productLoop.record('flow_started','analysis','start-analysis',extra);
    if (event === 'appraisal_completed') productLoop.record('flow_completed','analysis','save-analysis',extra);
    if (event === 'appraisal_failed') productLoop.record('flow_failed','analysis','start-analysis',extra);
    if (event === 'appraisal_saved' || event === 'appraisal_save_failed') {
      if (input.destination === 'device' || input.destination === 'cloud') productLoop.record(event === 'appraisal_saved' ? 'step_completed' : 'step_failed','library',input.destination === 'cloud' ? 'save-cloud' : 'save-device',extra);
    }
    if (event === 'saved_report_opened') productLoop.record('step_completed','library','open-saved-analysis');
    if (event === 'source_packet_prepared') productLoop.record('click','analysis','fetch-source');
    // ProductLoopObserver alone owns page views. Report/tutorial opens are not retention.
    return; // Only one behavioral collector may receive this event.
  }
  if (!analyticsConfigured() || !analyticsAllowed()) return;
  try {
    let id = window.localStorage.getItem(ID_KEY);
    if (!id) { id = crypto.randomUUID(); window.localStorage.setItem(ID_KEY, id); }
    await fetch(`${process.env.EXPO_PUBLIC_POSTHOG_HOST}/i/v0/e/`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: process.env.EXPO_PUBLIC_POSTHOG_KEY, distinct_id: id, event, properties: eventProperties(input) }),
      credentials: 'omit', redirect: 'error', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(5000),
    });
  } catch { /* Measurement must never block reading or generate raw error logs. */ }
}
