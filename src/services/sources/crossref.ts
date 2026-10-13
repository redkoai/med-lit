import type { RawArticleData } from '../../types';
import { fetchWithTimeout } from '../network';

const CROSSREF_BASE = 'https://api.crossref.org/works';

export async function resolveReferenceIdentifier(doi: string): Promise<{
  resolved: boolean;
  title?: string;
  retractionNotice: boolean;
}> {
  try {
    const res = await fetchWithTimeout(`${CROSSREF_BASE}/${encodeURIComponent(doi)}`, 10000);
    if (!res.ok) return { resolved: false, retractionNotice: false };
    const work = (await res.json())?.message;
    if (!work) return { resolved: false, retractionNotice: false };
    const updateTypes = [
      ...(Array.isArray(work['update-to']) ? work['update-to'] : []),
      ...(Array.isArray(work['updated-by']) ? work['updated-by'] : []),
    ].map((update: Record<string, unknown>) => String(update.type ?? '').toLowerCase());
    return {
      resolved: true,
      title: typeof work.title?.[0] === 'string' ? work.title[0] : undefined,
      retractionNotice: updateTypes.some((type: string) => /retract|withdraw/.test(type)),
    };
  } catch {
    return { resolved: false, retractionNotice: false };
  }
}

export async function fetchFromCrossref(
  doi: string
): Promise<Partial<RawArticleData> | null> {
  try {
    const url = `${CROSSREF_BASE}/${encodeURIComponent(doi)}`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) return null;
    const data = await res.json();
    const work = data?.message;
    if (!work) return null;

    const title = work.title?.[0] || '';
    const authors = (work.author || []).map(
      (a: { family?: string; name?: string; given?: string }) =>
        a.name || `${a.family || ''} ${a.given || ''}`.trim()
    );
    const journal = work['container-title']?.[0] || work.publisher || '';
    const year = work.published?.['date-parts']?.[0]?.[0] || null;
    const abstract = work.abstract
      ? work.abstract.replace(/<[^>]+>/g, '').trim()
      : '';
    const volume = work.volume;
    const issue = work.issue;
    const pages = work.page;
    const references = Array.isArray(work.reference)
      ? work.reference.slice(0, 500).map((reference: Record<string, unknown>) => {
        const doiValue = typeof reference.DOI === 'string' ? reference.DOI : undefined;
        const raw = [reference.author, reference.year, reference['article-title'], reference['journal-title'], doiValue]
          .filter((item): item is string | number => typeof item === 'string' || typeof item === 'number')
          .join('. ');
        return {
          raw: raw || doiValue || 'Reference metadata unavailable',
          doi: doiValue,
          identifierStatus: 'not_checked' as const,
          retractionStatus: 'not_checked' as const,
        };
      })
      : undefined;

    return {
      title,
      authors,
      journal,
      year,
      doi,
      abstract,
      volume,
      issue,
      pages,
      references,
      availableSections: abstract ? ['abstract'] : [],
      sourceUrls: [`https://api.crossref.org/works/${encodeURIComponent(doi)}`],
      retractionStatus: 'not_checked',
    };
  } catch {
    return null;
  }
}
