import type { RawArticleData } from '../../types';
import { fetchWithTimeout } from '../network';

const CROSSREF_BASE = 'https://api.crossref.org/works';

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

    return { title, authors, journal, year, doi, abstract, volume, issue, pages };
  } catch {
    return null;
  }
}
