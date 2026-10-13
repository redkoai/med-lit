/**
 * Shared network helpers for fetching with timeout and CORS proxy.
 * Single responsibility: HTTP/network concerns only.
 */

export async function fetchWithTimeout(
  url: string,
  timeoutMs = 15000,
  init: RequestInit = {},
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchViaProxy(url: string): Promise<string> {
  return (await fetchTextResource(url)).text;
}

export async function fetchTextResource(url: string): Promise<{
  text: string;
  contentType: string;
  finalUrl: string;
}> {
  const isBrowser = typeof window !== 'undefined' && typeof window.location !== 'undefined';
  const proxyUrl = isBrowser ? `/api/fetch?url=${encodeURIComponent(url)}` : url;
  let res = await fetchWithTimeout(proxyUrl, 20000, {
    headers: { Accept: 'text/html, application/xml, text/xml, application/json, text/plain' },
  });

  // Expo's local static server does not host Vercel functions. Public research
  // APIs often support CORS, so use a direct request only when the local API is absent.
  if (isBrowser && res.status === 404 && window.location.hostname === 'localhost') {
    res = await fetchWithTimeout(url, 20000);
  }
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const contentType = res.headers.get('content-type')?.toLowerCase() ?? '';
  if (/application\/pdf|octet-stream/.test(contentType)) {
    throw new Error('The source returned a PDF. PDF extraction is not available from this endpoint.');
  }
  return {
    text: await res.text(),
    contentType,
    finalUrl: res.url || url,
  };
}

export interface IngestedResource {
  text: string;
  contentType: string;
  finalUrl: string;
  pages?: number;
  tableCount: number;
  supplementLinks: string[];
  warnings: string[];
  wasTruncated: boolean;
}

export async function fetchIngestedResource(url: string): Promise<IngestedResource> {
  const isBrowser = typeof window !== 'undefined' && typeof window.location !== 'undefined';
  const { PUBLIC_SITE_URL } = await import('../constants/site');
  const apiOrigin = isBrowser ? '' : PUBLIC_SITE_URL;
  const endpoint = `${apiOrigin}/api/ingest?url=${encodeURIComponent(url)}`;
  const res = await fetchWithTimeout(endpoint, 45000, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    let message = `Document ingestion failed (${res.status}).`;
    try {
      const body = await res.json() as { error?: string };
      if (body.error) message = body.error;
    } catch {
      // Use the bounded status-only message above.
    }
    throw new Error(message);
  }
  return res.json() as Promise<IngestedResource>;
}
