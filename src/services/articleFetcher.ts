import type { ArticleIdentifier, RawArticleData } from '../types';
import { isPreprint } from './urlParser';
import { fetchViaProxy } from './network';
import { fetchFromPubMed, fetchPMCFullText } from './sources/pubmed';
import { fetchFromCrossref } from './sources/crossref';
import { fetchFromEuropePMC } from './sources/europePmc';
import { fetchOpenAccessUrl } from './sources/unpaywall';
import { scrapeAbstractFromPage } from './sources/scrape';
import { fetchFromSciHub } from './sources/scihub';

/**
 * Orchestrates article fetching from multiple sources.
 * Single responsibility: pipeline coordination only.
 * New sources can be added without modifying this flow (Open/Closed).
 */
export interface FetchOptions {
  unpaywallEmail: string;
  sciHubEnabled: boolean;
  sciHubMirror: string;
  onProgress?: (message: string) => void;
}

export async function fetchArticle(
  identifier: ArticleIdentifier,
  options: FetchOptions
): Promise<RawArticleData> {
  const progress = options.onProgress || (() => {});
  let partial: Partial<RawArticleData> = {
    isPreprint: isPreprint(identifier),
    fetchSource: 'metadata_only',
  };

  if (identifier.pmid) {
    progress('Fetching from PubMed...');
    const pubmedData = await fetchFromPubMed(identifier.pmid);
    partial = { ...partial, ...pubmedData };
  } else if (identifier.doi) {
    progress('Fetching metadata from Crossref...');
    const crossrefData = await fetchFromCrossref(identifier.doi);
    if (crossrefData) partial = { ...partial, ...crossrefData };
  }

  const pmcid = partial.pmcid || identifier.pmcid;
  if (pmcid && !partial.fullText) {
    progress('Fetching full text from PubMed Central...');
    const fullText = await fetchPMCFullText(pmcid);
    if (fullText) {
      partial.fullText = fullText;
      partial.fetchSource = 'full_text';
    }
  }

  const doi = partial.doi || identifier.doi;
  if (doi && !partial.fullText) {
    progress('Checking Europe PMC...');
    const europePMC = await fetchFromEuropePMC(doi);
    if (europePMC) {
      if (!partial.pmid && europePMC.pmid) partial.pmid = europePMC.pmid;
      if (!partial.pmcid && europePMC.pmcid) partial.pmcid = europePMC.pmcid;
      if (europePMC.fullText) {
        partial.fullText = europePMC.fullText;
        partial.fetchSource = 'full_text';
      }
    }
  }

  if (doi && !partial.fullText && options.unpaywallEmail) {
    progress('Checking for open access version (Unpaywall)...');
    const oaUrl = await fetchOpenAccessUrl(doi, options.unpaywallEmail);
    if (oaUrl) {
      try {
        progress('Downloading open access full text...');
        const html = await fetchViaProxy(oaUrl);
        const bodyText = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s{3,}/g, '\n\n')
          .trim();
        if (bodyText.length > 1000) {
          partial.fullText = bodyText.slice(0, 50000);
          partial.fetchSource = 'full_text';
        }
      } catch {
        /* ignore */
      }
    }
  }

  if (!partial.abstract && identifier.originalUrl) {
    progress('Scraping article page...');
    const scraped = await scrapeAbstractFromPage(identifier.originalUrl);
    if (scraped) {
      if (!partial.abstract && scraped.abstract) partial.abstract = scraped.abstract;
      if (!partial.doi && scraped.doi) partial.doi = scraped.doi;
      if (!partial.title && scraped.title) partial.title = scraped.title;
    }
  }

  if (!partial.fullText && options.sciHubEnabled && options.sciHubMirror) {
    const lookupId = partial.doi || partial.pmid;
    if (lookupId) {
      progress('Trying Sci-Hub (enabled in settings)...');
      const scihubText = await fetchFromSciHub(lookupId, options.sciHubMirror);
      if (scihubText && scihubText.length > 500) {
        partial.fullText = scihubText;
        partial.fetchSource = 'full_text';
      }
    }
  }

  if (partial.abstract && !partial.fullText) {
    partial.fetchSource = 'abstract_only';
  }

  if (!partial.title) partial.title = 'Title not available';
  if (!partial.authors) partial.authors = [];
  if (!partial.journal) partial.journal = 'Journal not available';
  if (!partial.abstract) partial.abstract = 'Abstract not available';

  return partial as RawArticleData;
}
