import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ArticleAnalysis } from '../types';
import { fetchWithTimeout } from './network';
import { fetchFromPubMed } from './sources/pubmed';

const SEARCHES_KEY = '@medlit:saved-searches:v1';
const NCBI_ESEARCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
const CROSSREF_WORKS = 'https://api.crossref.org/works';

export interface SavedEvidenceSearch {
  id: string;
  query: string;
  createdAt: string;
  lastCheckedAt?: string;
  knownPmids: string[];
  newPmids: string[];
}

export interface PaperUpdateSignals {
  checkedAt: string;
  retractionStatus: 'no_notice_found' | 'notice_found' | 'not_checked';
  citationCount?: number;
  updateRelations: string[];
  note: string;
}

export async function loadSavedSearches(): Promise<SavedEvidenceSearch[]> {
  try {
    const raw = await AsyncStorage.getItem(SEARCHES_KEY);
    const parsed = raw ? JSON.parse(raw) as unknown : [];
    return Array.isArray(parsed) ? parsed as SavedEvidenceSearch[] : [];
  } catch {
    return [];
  }
}

async function saveSearches(searches: SavedEvidenceSearch[]): Promise<void> {
  await AsyncStorage.setItem(SEARCHES_KEY, JSON.stringify(searches.slice(0, 25)));
}

export async function addSavedSearch(query: string): Promise<SavedEvidenceSearch[]> {
  const clean = query.trim().replace(/\s+/g, ' ').slice(0, 500);
  if (!clean) return loadSavedSearches();
  const current = await loadSavedSearches();
  if (current.some((item) => item.query.toLowerCase() === clean.toLowerCase())) return current;
  const next = [{
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    query: clean,
    createdAt: new Date().toISOString(),
    knownPmids: [],
    newPmids: [],
  }, ...current].slice(0, 25);
  await saveSearches(next);
  return next;
}

export async function removeSavedSearch(id: string): Promise<SavedEvidenceSearch[]> {
  const next = (await loadSavedSearches()).filter((item) => item.id !== id);
  await saveSearches(next);
  return next;
}

export async function checkSavedSearch(id: string): Promise<SavedEvidenceSearch[]> {
  const current = await loadSavedSearches();
  const search = current.find((item) => item.id === id);
  if (!search) return current;
  const url = `${NCBI_ESEARCH}?db=pubmed&retmode=json&retmax=20&sort=pub+date&term=${encodeURIComponent(search.query)}`;
  const response = await fetchWithTimeout(url, 20000);
  if (!response.ok) throw new Error(`PubMed search check failed (${response.status}).`);
  const body = await response.json() as { esearchresult?: { idlist?: string[] } };
  const ids = body.esearchresult?.idlist ?? [];
  const previous = new Set(search.knownPmids);
  const updated: SavedEvidenceSearch = {
    ...search,
    knownPmids: [...new Set([...ids, ...search.knownPmids])].slice(0, 200),
    newPmids: search.lastCheckedAt ? ids.filter((pmid) => !previous.has(pmid)) : [],
    lastCheckedAt: new Date().toISOString(),
  };
  const next = current.map((item) => item.id === id ? updated : item);
  await saveSearches(next);
  return next;
}

export async function checkPaperUpdates(analysis: ArticleAnalysis): Promise<PaperUpdateSignals> {
  let retractionStatus = analysis.article.retractionStatus ?? 'not_checked';
  let citationCount: number | undefined;
  const updateRelations: string[] = [];

  if (analysis.article.pmid) {
    try {
      const current = await fetchFromPubMed(analysis.article.pmid);
      retractionStatus = current.retractionStatus ?? retractionStatus;
    } catch {
      // Crossref may still provide update signals below.
    }
  }
  if (analysis.article.doi) {
    try {
      const response = await fetchWithTimeout(`${CROSSREF_WORKS}/${encodeURIComponent(analysis.article.doi)}`, 15000);
      if (response.ok) {
        const work = (await response.json())?.message as Record<string, unknown> | undefined;
        if (work) {
          citationCount = typeof work['is-referenced-by-count'] === 'number' ? work['is-referenced-by-count'] : undefined;
          for (const field of ['update-to', 'updated-by'] as const) {
            const entries = Array.isArray(work[field]) ? work[field] as Array<Record<string, unknown>> : [];
            entries.forEach((entry) => {
              const relation = [entry.type, entry.DOI].filter((value) => typeof value === 'string').join(': ');
              if (relation) updateRelations.push(relation);
            });
          }
          if (updateRelations.some((relation) => /retract|withdraw/i.test(relation))) retractionStatus = 'notice_found';
        }
      }
    } catch {
      // Return the PubMed and stored signals that were available.
    }
  }
  return {
    checkedAt: new Date().toISOString(),
    retractionStatus,
    citationCount,
    updateRelations,
    note: 'These are current index signals from PubMed and Crossref, not a complete citation-context or post-publication review. Read linked notices and citing papers directly.',
  };
}
