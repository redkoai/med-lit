interface ApiRequest {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  headers?: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  setHeader: (name: string, value: string) => void;
  send: (body: string) => void;
  json: (body: unknown) => void;
}

import { fetchAllowedSource, isAllowedSourceUrl, sourceHost } from '../src/services/sourcePolicy.js';
import { consumeRateLimit, logServerEvent, requestId } from '../src/services/serverTelemetry.js';

export { isAllowedSourceUrl } from '../src/services/sourcePolicy.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const startedAt = Date.now();
  const id = requestId(req);
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const rate = consumeRateLimit(req);
  if (!rate.allowed) {
    res.setHeader('Retry-After', String(rate.retryAfter));
    logServerEvent('warn', 'source_fetch_rate_limited', { requestId: id });
    res.status(429).json({ error: 'Too many retrieval requests. Try again shortly.' });
    return;
  }
  const raw = Array.isArray(req.query?.url) ? req.query?.url[0] : req.query?.url;
  if (!raw || !isAllowedSourceUrl(raw)) {
    logServerEvent('warn', 'source_fetch_rejected', { requestId: id, host: raw ? sourceHost(raw) : 'missing' });
    res.status(400).json({ error: 'Unsupported source URL' });
    return;
  }

  try {
    logServerEvent('info', 'source_fetch_started', { requestId: id, host: sourceHost(raw) });
    const upstream = await fetchAllowedSource(raw, {
      headers: {
        Accept: 'text/html, application/xml, text/xml, application/json, text/plain',
        'User-Agent': 'MedLitAppraisal/1.0 (literature retrieval; contact configured by deployer)',
      },
      signal: AbortSignal.timeout(20000),
    });
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'Source retrieval failed' });
      return;
    }
    const contentType = upstream.headers.get('content-type')?.toLowerCase() ?? 'text/plain';
    if (/pdf|octet-stream|image|video|audio/.test(contentType)) {
      res.status(415).json({ error: 'Only text and XML sources are accepted' });
      return;
    }
    const declaredLength = Number(upstream.headers.get('content-length') ?? 0);
    if (declaredLength > 2_000_000) {
      res.status(413).json({ error: 'Source is too large' });
      return;
    }
    const body = await upstream.text();
    if (body.length > 2_000_000) {
      res.status(413).json({ error: 'Source is too large' });
      return;
    }
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Request-Id', id);
    logServerEvent('info', 'source_fetch_completed', {
      requestId: id,
      host: sourceHost(upstream.url),
      bytes: body.length,
      durationMs: Date.now() - startedAt,
    });
    res.send(body);
  } catch (error) {
    logServerEvent('error', 'source_fetch_failed', {
      requestId: id,
      host: sourceHost(raw),
      error: error instanceof Error ? error.message : 'unknown',
      durationMs: Date.now() - startedAt,
    });
    res.status(502).json({ error: 'Source retrieval failed' });
  }
}
