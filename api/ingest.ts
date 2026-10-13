import { extractText, extractTextItems, getDocumentProxy } from 'unpdf';
import { fetchAllowedSource, isAllowedSourceUrl, sourceHost } from '../src/services/sourcePolicy.js';
import { consumeRateLimit, logServerEvent, requestId } from '../src/services/serverTelemetry.js';

interface ApiRequest {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
  headers?: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  setHeader: (name: string, value: string) => void;
  json: (body: unknown) => void;
}

const MAX_BINARY_BYTES = 12_000_000;
const MAX_PAGES = 100;
const MAX_TEXT = 180_000;
const MAX_SUPPLEMENTS = 3;

function cleanMarkup(value: string): string {
  return value
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/?(?:tr|p|div|section|article|h[1-6]|li|table|caption|title)[^>]*>/gi, '\n')
    .replace(/<\/?(?:td|th)[^>]*>/gi, '\t')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractSupplementLinks(markup: string, baseUrl: string): string[] {
  const links = [...markup.matchAll(/href=["']([^"']+)["']/gi)]
    .map((match) => match[1])
    .filter((href) => /supp|appendix|additional[-_ ]?file|data[-_ ]?set/i.test(href));
  return [...new Set(links.flatMap((href) => {
    try {
      const absolute = new URL(href, baseUrl).toString();
      return isAllowedSourceUrl(absolute) ? [absolute] : [];
    } catch {
      return [];
    }
  }))].slice(0, 25);
}

function extractHtmlTables(markup: string): string[] {
  return [...markup.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)]
    .map((match) => cleanMarkup(match[0]))
    .filter((value) => value.length >= 20)
    .slice(0, 20);
}

async function extractPdfTableCandidates(pdf: Awaited<ReturnType<typeof getDocumentProxy>>): Promise<string[]> {
  const positioned = await extractTextItems(pdf);
  const candidates: string[] = [];
  positioned.items.forEach((items, pageIndex) => {
    const rows = new Map<number, typeof items>();
    items.forEach((item) => {
      const rowKey = Math.round(item.y / 3) * 3;
      rows.set(rowKey, [...(rows.get(rowKey) ?? []), item]);
    });
    [...rows.entries()].sort((a, b) => b[0] - a[0]).forEach(([, row]) => {
      const ordered = [...row].sort((a, b) => a.x - b.x);
      const meaningfulColumns = ordered.filter((item) => item.str.trim()).length;
      if (meaningfulColumns < 3) return;
      const numericColumns = ordered.filter((item) => /^[-+]?\d+(?:[.,]\d+)?(?:%|\*|†|‡)?$/.test(item.str.trim())).length;
      const hasWideColumnGap = ordered.some((item, itemIndex) => itemIndex > 0 && item.x - (ordered[itemIndex - 1].x + ordered[itemIndex - 1].width) > 18);
      if (numericColumns < 2 || !hasWideColumnGap) return;
      const line = ordered.map((item) => item.str.trim()).filter(Boolean).join(' | ');
      if (line.length >= 20 && line.length <= 800) candidates.push(`PDF page ${pageIndex + 1}: ${line}`);
    });
  });
  return [...new Set(candidates)].slice(0, 100);
}

async function ingestSupplement(url: string, index: number): Promise<{ text: string; warning?: string } | null> {
  try {
    const response = await fetchAllowedSource(url, {
      headers: { Accept: 'application/pdf, text/html, application/xml, text/xml, text/plain' },
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) return null;
    const declaredLength = Number(response.headers.get('content-length') ?? 0);
    if (declaredLength > 4_000_000) return null;
    const contentType = response.headers.get('content-type')?.toLowerCase() ?? '';
    if (/pdf|octet-stream/.test(contentType) || response.url.toLowerCase().includes('.pdf')) {
      const bytes = new Uint8Array(await response.arrayBuffer());
      if (bytes.byteLength > 4_000_000) return null;
      const pdf = await getDocumentProxy(bytes);
      if (pdf.numPages > 30) return null;
      const extracted = await extractText(pdf, { mergePages: true });
      const value = Array.isArray(extracted.text) ? extracted.text.join('\n') : extracted.text;
      return {
        text: `\n--- SUPPLEMENT ${index + 1}: ${response.url} ---\n${value.slice(0, 30_000)}`,
        warning: 'Supplementary PDF text was extracted, but figures, scans, equations, and layout still require direct review.',
      };
    }
    const markup = await response.text();
    if (markup.length > 4_000_000) return null;
    return { text: `\n--- SUPPLEMENT ${index + 1}: ${response.url} ---\n${cleanMarkup(markup).slice(0, 30_000)}` };
  } catch {
    return null;
  }
}

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
    res.status(429).json({ error: 'Too many ingestion requests. Try again shortly.' });
    return;
  }
  const raw = Array.isArray(req.query?.url) ? req.query?.url[0] : req.query?.url;
  if (!raw || !isAllowedSourceUrl(raw)) {
    res.status(400).json({ error: 'Unsupported source URL' });
    return;
  }

  try {
    logServerEvent('info', 'ingestion_started', { requestId: id, host: sourceHost(raw) });
    const upstream = await fetchAllowedSource(raw, {
      headers: { Accept: 'application/pdf, text/html, application/xml, text/xml, text/plain' },
      signal: AbortSignal.timeout(30000),
    });
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: 'Source ingestion failed' });
      return;
    }
    const declaredLength = Number(upstream.headers.get('content-length') ?? 0);
    if (declaredLength > MAX_BINARY_BYTES) {
      res.status(413).json({ error: 'Source exceeds the 12 MB ingestion limit' });
      return;
    }
    const contentType = upstream.headers.get('content-type')?.toLowerCase() ?? '';
    let text = '';
    let pages: number | undefined;
    let tables: string[] = [];
    let supplementLinks: string[] = [];
    let supplementsIngested = 0;
    const warnings: string[] = [];

    if (/pdf|octet-stream/.test(contentType) || upstream.url.toLowerCase().includes('.pdf')) {
      const buffer = new Uint8Array(await upstream.arrayBuffer());
      if (buffer.byteLength > MAX_BINARY_BYTES) {
        res.status(413).json({ error: 'PDF exceeds the 12 MB ingestion limit' });
        return;
      }
      const pdf = await getDocumentProxy(buffer);
      if (pdf.numPages > MAX_PAGES) {
        res.status(413).json({ error: `PDF exceeds the ${MAX_PAGES}-page ingestion limit` });
        return;
      }
      const extracted = await extractText(pdf, { mergePages: false });
      const pageText = Array.isArray(extracted.text) ? extracted.text : [extracted.text];
      pages = extracted.totalPages;
      text = pageText.map((value, index) => `\n--- PDF PAGE ${index + 1} ---\n${value}`).join('\n').trim();
      tables = await extractPdfTableCandidates(pdf);
      if (tables.length) text += `\n\n--- PDF TABLE-LIKE ROW CANDIDATES; VERIFY AGAINST ORIGINAL ---\n${tables.join('\n')}`;
      warnings.push('PDF reading order and tables are reconstructed from positioned text and may be incomplete. Figures, scanned pages, and equations require source review.');
    } else {
      const markup = await upstream.text();
      if (markup.length > MAX_BINARY_BYTES) {
        res.status(413).json({ error: 'Source exceeds the ingestion limit' });
        return;
      }
      tables = extractHtmlTables(markup);
      supplementLinks = extractSupplementLinks(markup, upstream.url);
      text = cleanMarkup(markup);
      if (tables.length) text += `\n\n--- EXTRACTED TABLES ---\n${tables.join('\n\n')}`;
      if (supplementLinks.length) {
        const supplemental = await Promise.all(supplementLinks.slice(0, MAX_SUPPLEMENTS).map(ingestSupplement));
        const included = supplemental.filter((item): item is NonNullable<typeof item> => Boolean(item?.text));
        supplementsIngested = included.length;
        if (included.length) text += included.map((item) => item.text).join('\n');
        included.forEach((item) => { if (item.warning) warnings.push(item.warning); });
        if (included.length < supplementLinks.length) warnings.push(`${supplementLinks.length - included.length} detected supplement link(s) were not ingested because of format, host, size, or count limits.`);
      }
    }

    if (text.length < 200) {
      res.status(422).json({ error: 'The source did not contain enough machine-readable text' });
      return;
    }
    const wasTruncated = text.length > MAX_TEXT;
    text = text.slice(0, MAX_TEXT);
    if (wasTruncated) warnings.push('Extracted text exceeded 180,000 characters and was truncated.');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=604800');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Request-Id', id);
    logServerEvent('info', 'ingestion_completed', {
      requestId: id,
      host: sourceHost(upstream.url),
      pages,
      characters: text.length,
      tables: tables.length,
      supplements: supplementLinks.length,
      durationMs: Date.now() - startedAt,
    });
    res.status(200).json({
      text,
      contentType,
      finalUrl: upstream.url,
      pages,
      tableCount: tables.length,
      supplementLinks,
      supplementsIngested,
      warnings,
      wasTruncated,
    });
  } catch (error) {
    logServerEvent('error', 'ingestion_failed', {
      requestId: id,
      host: sourceHost(raw),
      error: error instanceof Error ? error.message : 'unknown',
      durationMs: Date.now() - startedAt,
    });
    res.status(502).json({ error: 'Source ingestion failed' });
  }
}
