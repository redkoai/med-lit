import type { ArticleIdentifier, RawArticleData } from '../types';
import { isPreprint } from './urlParser';
import { fetchIngestedResource } from './network';
import { fetchFromPubMed, fetchPMCFullText } from './sources/pubmed';
import { fetchFromCrossref, resolveReferenceIdentifier } from './sources/crossref';
import { fetchFromEuropePMC } from './sources/europePmc';
import { fetchOpenAccessUrl } from './sources/unpaywall';
import { scrapeAbstractFromPage } from './sources/scrape';

/**
 * Orchestrates article fetching from multiple sources.
 * Single responsibility: pipeline coordination only.
 * New sources can be added without modifying this flow (Open/Closed).
 */
export interface FetchOptions {
  unpaywallEmail: string;
  onProgress?: (message: string) => void;
}

async function verifyReferenceIdentifiers(
  references: NonNullable<RawArticleData['references']>,
  progress: (message: string) => void,
): Promise<NonNullable<RawArticleData['references']>> {
  const candidates = references
    .map((reference, index) => ({ reference, index }))
    .filter(({ reference }) => reference.doi)
    .slice(0, 25);
  if (!candidates.length) return references;
  progress(`Resolving ${candidates.length} reference identifier${candidates.length === 1 ? '' : 's'} through Crossref...`);
  const updated = [...references];
  for (let start = 0; start < candidates.length; start += 5) {
    const batch = candidates.slice(start, start + 5);
    const results = await Promise.all(batch.map(({ reference }) => resolveReferenceIdentifier(reference.doi!)));
    batch.forEach(({ reference, index }, batchIndex) => {
      const result = results[batchIndex];
      updated[index] = {
        ...reference,
        title: result.title ?? reference.title,
        identifierStatus: result.resolved ? 'resolved' : 'unresolved',
        retractionStatus: result.retractionNotice ? 'notice_found' : result.resolved ? 'no_notice_found' : 'not_checked',
      };
    });
  }
  return updated;
}

export async function fetchArticle(
  identifier: ArticleIdentifier,
  options: FetchOptions
): Promise<RawArticleData> {
  const progress = options.onProgress || (() => {});
  let partial: Partial<RawArticleData> = {
    isPreprint: isPreprint(identifier),
    fetchSource: 'metadata_only',
    retrievalWarnings: [],
    availableSections: [],
    sourceUrls: [],
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
    const pmc = await fetchPMCFullText(pmcid);
    if (pmc) {
      partial.fullText = pmc.fullText;
      partial.references = pmc.references;
      partial.availableSections = pmc.availableSections;
      partial.sourceUrls = [...(partial.sourceUrls ?? []), pmc.sourceUrl];
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
      if (!partial.abstract && europePMC.abstract) {
        partial.abstract = europePMC.abstract;
        partial.availableSections = [...new Set([...(partial.availableSections ?? []), 'abstract'])];
        partial.sourceUrls = [...(partial.sourceUrls ?? []), `https://europepmc.org/article/MED/${europePMC.pmid || ''}`];
      }
      if (europePMC.fullText) {
        partial.fullText = europePMC.fullText;
        partial.references = europePMC.references;
        partial.availableSections = europePMC.availableSections;
        if (europePMC.sourceUrl) partial.sourceUrls = [...(partial.sourceUrls ?? []), europePMC.sourceUrl];
        partial.fetchSource = 'full_text';
      }
    }
  }

  // DOI lookup may discover a PMC identifier after the initial PMC stage.
  // Reuse the lawful NCBI path; Europe PMC XML covers only its OA subset.
  if (partial.pmcid && partial.pmcid !== pmcid && !partial.fullText) {
    progress('Fetching resolved full text from PubMed Central...');
    const resolved = await fetchPMCFullText(partial.pmcid);
    if (resolved) {
      partial.fullText = resolved.fullText;
      partial.references = resolved.references;
      partial.availableSections = resolved.availableSections;
      partial.sourceUrls = [...(partial.sourceUrls ?? []), resolved.sourceUrl];
      partial.fetchSource = 'full_text';
    }
  }

  if (doi && !partial.fullText && options.unpaywallEmail) {
    progress('Checking for open access version (Unpaywall)...');
    const oaUrl = await fetchOpenAccessUrl(doi, options.unpaywallEmail);
    if (oaUrl) {
      try {
        progress('Downloading open access full text...');
        const resource = await fetchIngestedResource(oaUrl);
        const bodyText = resource.text.trim();
        if (bodyText.length > 1000) {
          partial.fullText = bodyText.slice(0, 50000);
          partial.availableSections = [...new Set([...(partial.availableSections ?? []), 'full-text-extract'])];
          partial.sourceUrls = [...(partial.sourceUrls ?? []), resource.finalUrl];
          partial.pdfPages = resource.pages;
          partial.extractedTableCount = resource.tableCount;
          partial.supplementLinks = resource.supplementLinks;
          partial.retrievalWarnings = [...(partial.retrievalWarnings ?? []), ...resource.warnings];
          partial.fetchSource = 'full_text';
        }
      } catch {
        /* ignore */
      }
    }
  }

  if (!partial.abstract && /^https:\/\//i.test(identifier.originalUrl)) {
    progress('Scraping article page...');
    const scraped = await scrapeAbstractFromPage(identifier.originalUrl);
    if (scraped) {
      if (!partial.abstract && scraped.abstract) partial.abstract = scraped.abstract;
      if (!partial.doi && scraped.doi) partial.doi = scraped.doi;
      if (!partial.title && scraped.title) partial.title = scraped.title;
    }
  }

  if (partial.abstract && !partial.fullText) {
    partial.fetchSource = 'abstract_only';
    partial.availableSections = [...new Set([...(partial.availableSections ?? []), 'abstract'])];
    partial.retrievalWarnings = [...(partial.retrievalWarnings ?? []), 'Only the abstract was available; methodological domains may be unable to assess.'];
  }

  if (!partial.title) partial.title = 'Title not available';
  if (!partial.authors) partial.authors = [];
  if (!partial.journal) partial.journal = 'Journal not available';
  if (!partial.abstract) partial.abstract = '';

  if (!partial.abstract && !partial.fullText) {
    throw new Error('No abstract or full text could be retrieved. MedLit will not generate an appraisal from metadata alone.');
  }

  if (partial.fullText && partial.fullText.length > 180000) {
    partial.fullText = partial.fullText.slice(0, 180000);
    partial.retrievalWarnings = [...(partial.retrievalWarnings ?? []), 'Full text exceeded the storage limit and was truncated.'];
  }

  if (partial.references?.length) {
    partial.references = await verifyReferenceIdentifiers(partial.references, progress);
  }

  return partial as RawArticleData;
}
