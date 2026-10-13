interface RequestLike {
  headers?: Record<string, string | string[] | undefined>;
}

type LogLevel = 'info' | 'warn' | 'error';

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 60;
const rateBuckets = new Map<string, { count: number; resetAt: number }>();

function header(req: RequestLike, name: string): string {
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export function requestId(req: RequestLike): string {
  return header(req, 'x-vercel-id') || crypto.randomUUID();
}

export function clientKey(req: RequestLike): string {
  return header(req, 'x-forwarded-for').split(',')[0]?.trim()
    || header(req, 'x-real-ip')
    || 'unknown';
}

export function consumeRateLimit(req: RequestLike): { allowed: boolean; retryAfter: number } {
  const key = clientKey(req);
  const now = Date.now();
  if (rateBuckets.size > 2_000) {
    rateBuckets.forEach((bucket, bucketKey) => {
      if (bucket.resetAt <= now) rateBuckets.delete(bucketKey);
    });
  }
  const current = rateBuckets.get(key);
  if (!current || current.resetAt <= now) {
    rateBuckets.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }
  current.count += 1;
  if (current.count <= RATE_LIMIT) return { allowed: true, retryAfter: 0 };
  return { allowed: false, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
}

export function logServerEvent(
  level: LogLevel,
  event: string,
  fields: Record<string, unknown> = {},
): void {
  const payload = JSON.stringify({
    level,
    event,
    service: 'medlit',
    timestamp: new Date().toISOString(),
    ...fields,
  });
  if (level === 'error') console.error(payload);
  else if (level === 'warn') console.warn(payload);
  else console.log(payload);
}
