/**
 * Shared network helpers for fetching with timeout and CORS proxy.
 * Single responsibility: HTTP/network concerns only.
 */

import { Platform } from 'react-native';

const CORS_PROXY = 'https://corsproxy.io/?';

export async function fetchWithTimeout(
  url: string,
  timeoutMs = 15000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchViaProxy(url: string): Promise<string> {
  // On native platforms, CORS is not an issue — fetch directly
  const fetchUrl = Platform.OS === 'web'
    ? `${CORS_PROXY}${encodeURIComponent(url)}`
    : url;
  const res = await fetchWithTimeout(fetchUrl);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return res.text();
}
