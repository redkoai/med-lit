import type { ArticleIdentifier, RawArticleData } from '../types';
import { isPreprint } from './urlParser';

const NCBI_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const EUROPE_PMC_BASE = 'https://www.ebi.ac.uk/europepmc/webservices/rest';
const UNPAYWALL_BASE = 'https://api.unpaywall.org/v2';
const CROSSREF_BASE = 'https://api.crossref.org/works';
const CORS_PROXY = 'https://corsproxy.io/?';

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchWithTimeout(url: string, timeoutMs = 15000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchViaProxy(url: string): Promise<string> {
  const proxyUrl = `${CORS_PROXY}${encodeURIComponent(url)}`;
  const res = await fetchWithTimeout(proxyUrl);
  if (!res.ok) throw new Error(`Proxy fetch failed: ${res.status}`);
  return res.text();
}

function parseXmlText(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return m ? m[1].replace(/<[^>]+>/g, '').trim() : '';
}

function parseXmlArray(xml: string, tag: string): string[] {
  const results: string[] = [];
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const text = m[1].replace(/<[^>]+>/g, '').trim();
    if (text) results.push(text);
  }
  return results;
}

// ─── PubMed Fetch ─────────────────────────────────────────────────────────────

async function fetchFromPubMed(pmid: string): Promise<Partial<RawArticleData>> {
  const url = `${NCBI_BASE}/efetch.fcgi?db=pubmed&id=${pmid}&rettype=xml&retmode=xml`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`PubMed fetch failed: ${res.status}`);
  const xml = await res.text();

  const title = parseXmlText(xml, 'ArticleTitle');
  const abstractText = parseXmlText(xml, 'AbstractText');
  const journalTitle = parseXmlText(xml, 'Title');
  const yearStr = parseXmlText(xml, 'Year');

  // Authors: parse LastName + ForeName pairs
  const authors: string[] = [];
  const authorRe = /<Author[^>]*>([\s\S]*?)<\/Author>/gi;
  let aMatch: RegExpExecArray | null;
  while ((aMatch = authorRe.exec(xml)) !== null) {
    const block = aMatch[1];
    const last = parseXmlText(block, 'LastName');
    const fore = parseXmlText(block, 'ForeName');
    const coll = parseXmlText(block, 'CollectiveName');
    if (coll) authors.push(coll);
    else if (last) authors.push(fore ? `${last} ${fore}` : last);
  }

  // DOI from ArticleId
  const doiMatch = xml.match(/<ArticleId IdType="doi">([^<]+)<\/ArticleId>/i);
  const doi = doiMatch ? doiMatch[1].trim() : undefined;

  // PMC ID
  const pmcMatch = xml.match(/<ArticleId IdType="pmc">(PMC\d+)<\/ArticleId>/i);
  const pmcid = pmcMatch ? pmcMatch[1].replace('PMC', '') : undefined;

  // Keywords
  const keywords = parseXmlArray(xml, 'Keyword');

  return {
    title,
    authors,
    journal: journalTitle,
    year: yearStr ? parseInt(yearStr, 10) : null,
    doi,
    pmid,
    pmcid,
    abstract: abstractText,
    keywords,
    isPreprint: false,
  };
}

// ─── PMC Full Text Fetch ──────────────────────────────────────────────────────

async function fetchPMCFullText(pmcid: string): Promise<string | null> {
  try {
    const url = `${NCBI_BASE}/efetch.fcgi?db=pmc&id=${pmcid}&rettype=full&retmode=xml`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) return null;
    const xml = await res.text();

    // Extract body sections
    const bodyMatch = xml.match(/<body>([\s\S]*?)<\/body>/i);
    if (!bodyMatch) return null;

    // Strip XML tags but preserve structure
    const text = bodyMatch[1]
      .replace(/<title[^>]*>([^<]+)<\/title>/gi, '\n## $1\n')
      .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s{3,}/g, '\n\n')
      .trim();

    return text.length > 200 ? text : null;
  } catch {
    return null;
  }
}

// ─── Europe PMC Fetch ─────────────────────────────────────────────────────────

async function fetchFromEuropePMC(doi: string): Promise<{
  pmid?: string;
  pmcid?: string;
  fullText?: string;
} | null> {
  try {
    const searchUrl = `${EUROPE_PMC_BASE}/search?query=DOI:"${encodeURIComponent(doi)}"&format=json&resultType=core&pageSize=1`;
    const res = await fetchWithTimeout(searchUrl);
    if (!res.ok) return null;
    const data = await res.json();

    const article = data?.resultList?.result?.[0];
    if (!article) return null;

    const pmid = article.pmid?.toString();
    const pmcid = article.pmcid?.replace('PMC', '');

    // Try to get full text if PMC ID exists
    let fullText: string | undefined;
    if (pmcid) {
      try {
        const ftUrl = `${EUROPE_PMC_BASE}/PMC/${pmcid}/fullTextXML`;
        const ftRes = await fetchWithTimeout(ftUrl);
        if (ftRes.ok) {
          const ftXml = await ftRes.text();
          const bodyMatch = ftXml.match(/<body>([\s\S]*?)<\/body>/i);
          if (bodyMatch) {
            fullText = bodyMatch[1]
              .replace(/<title[^>]*>([^<]+)<\/title>/gi, '\n## $1\n')
              .replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, '\n$1\n')
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s{3,}/g, '\n\n')
              .trim();
          }
        }
      } catch { /* ignore */ }
    }

    return { pmid, pmcid, fullText };
  } catch {
    return null;
  }
}

// ─── Unpaywall Fetch ──────────────────────────────────────────────────────────

async function fetchOpenAccessUrl(
  doi: string,
  email: string
): Promise<string | null> {
  try {
    const url = `${UNPAYWALL_BASE}/${encodeURIComponent(doi)}?email=${encodeURIComponent(email)}`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) return null;
    const data = await res.json();

    if (!data.is_oa) return null;

    const loc = data.best_oa_location;
    return loc?.url_for_pdf || loc?.url || null;
  } catch {
    return null;
  }
}

// ─── Crossref Metadata Fetch ──────────────────────────────────────────────────

async function fetchFromCrossref(doi: string): Promise<Partial<RawArticleData> | null> {
  try {
    const url = `${CROSSREF_BASE}/${encodeURIComponent(doi)}`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) return null;
    const data = await res.json();
    const work = data?.message;
    if (!work) return null;

    const title = work.title?.[0] || '';
    const authors = (work.author || []).map((a: { family?: string; name?: string; given?: string }) =>
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

// ─── Page Scrape for Abstract ─────────────────────────────────────────────────

async function scrapeAbstractFromPage(url: string): Promise<{
  abstract?: string;
  doi?: string;
  title?: string;
} | null> {
  try {
    const html = await fetchViaProxy(url);

    // Look for common meta tags
    const doiMatch =
      html.match(/name="citation_doi"\s+content="([^"]+)"/i) ||
      html.match(/property="citation_doi"\s+content="([^"]+)"/i) ||
      html.match(/name="DC\.Identifier"\s+content="([^"]+)"/i);

    const abstractMatch =
      html.match(/name="citation_abstract"\s+content="([^"]+)"/i) ||
      html.match(/name="description"\s+content="([^"]+)"/i) ||
      html.match(/class="abstract[^"]*"[^>]*>([\s\S]*?)<\/(?:div|section|p)>/i);

    const titleMatch =
      html.match(/name="citation_title"\s+content="([^"]+)"/i) ||
      html.match(/<title>([^<]+)<\/title>/i);

    return {
      doi: doiMatch?.[1]?.replace(/^https?:\/\/doi\.org\//i, '').trim(),
      abstract: abstractMatch?.[1]?.replace(/<[^>]+>/g, '').trim(),
      title: titleMatch?.[1]?.trim(),
    };
  } catch {
    return null;
  }
}

// ─── Sci-Hub Fetch (Optional) ─────────────────────────────────────────────────

async function fetchFromSciHub(
  identifier: string, // DOI or PMID
  mirror: string
): Promise<string | null> {
  try {
    const url = `https://${mirror}/${identifier}`;
    const html = await fetchViaProxy(url);

    // Sci-Hub embeds PDF in an iframe or direct download link
    // We extract the abstract from the HTML if available
    const abstractMatch = html.match(
      /<div[^>]*id="article"[^>]*>([\s\S]*?)<\/div>/i
    );
    if (abstractMatch) {
      return abstractMatch[1].replace(/<[^>]+>/g, ' ').trim();
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Main Fetcher ─────────────────────────────────────────────────────────────

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

  // ── Step 1: Get metadata ────────────────────────────────────────────────────
  if (identifier.pmid) {
    progress('Fetching from PubMed...');
    const pubmedData = await fetchFromPubMed(identifier.pmid);
    partial = { ...partial, ...pubmedData };
  } else if (identifier.doi) {
    progress('Fetching metadata from Crossref...');
    const crossrefData = await fetchFromCrossref(identifier.doi);
    if (crossrefData) partial = { ...partial, ...crossrefData };
  }

  // ── Step 2: Try to get full text via PMC ───────────────────────────────────
  const pmcid = partial.pmcid || (identifier.pmcid);
  if (pmcid && !partial.fullText) {
    progress('Fetching full text from PubMed Central...');
    const fullText = await fetchPMCFullText(pmcid);
    if (fullText) {
      partial.fullText = fullText;
      partial.fetchSource = 'full_text';
    }
  }

  // ── Step 3: Try Europe PMC if we have a DOI ────────────────────────────────
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

  // ── Step 4: Unpaywall for open access ─────────────────────────────────────
  if (doi && !partial.fullText && options.unpaywallEmail) {
    progress('Checking for open access version (Unpaywall)...');
    const oaUrl = await fetchOpenAccessUrl(doi, options.unpaywallEmail);
    if (oaUrl) {
      try {
        progress('Downloading open access full text...');
        const html = await fetchViaProxy(oaUrl);
        // Quick text extraction from HTML
        const bodyText = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s{3,}/g, '\n\n')
          .trim();
        if (bodyText.length > 1000) {
          partial.fullText = bodyText.slice(0, 50000); // cap at 50k chars
          partial.fetchSource = 'full_text';
        }
      } catch { /* ignore */ }
    }
  }

  // ── Step 5: Scrape original URL if we still need more info ────────────────
  if (!partial.abstract && identifier.originalUrl) {
    progress('Scraping article page...');
    const scraped = await scrapeAbstractFromPage(identifier.originalUrl);
    if (scraped) {
      if (!partial.abstract && scraped.abstract) partial.abstract = scraped.abstract;
      if (!partial.doi && scraped.doi) partial.doi = scraped.doi;
      if (!partial.title && scraped.title) partial.title = scraped.title;
    }
  }

  // ── Step 6: Sci-Hub (optional) ────────────────────────────────────────────
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

  // ── Update fetchSource ────────────────────────────────────────────────────
  if (partial.abstract && !partial.fullText) {
    partial.fetchSource = 'abstract_only';
  }

  // ── Validate required fields ──────────────────────────────────────────────
  if (!partial.title) partial.title = 'Title not available';
  if (!partial.authors) partial.authors = [];
  if (!partial.journal) partial.journal = 'Journal not available';
  if (!partial.abstract) partial.abstract = 'Abstract not available';

  return partial as RawArticleData;
}
