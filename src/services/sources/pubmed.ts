import type { RawArticleData } from '../../types';
import { fetchWithTimeout } from '../network';
import { parseXmlText, parseXmlArray, parseJatsDocument } from '../xmlUtils';

const NCBI_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

export async function fetchFromPubMed(pmid: string): Promise<Partial<RawArticleData>> {
  const url = `${NCBI_BASE}/efetch.fcgi?db=pubmed&id=${pmid}&rettype=xml&retmode=xml`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`PubMed fetch failed: ${res.status}`);
  const xml = await res.text();

  const title = parseXmlText(xml, 'ArticleTitle');
  const abstractText = parseXmlArray(xml, 'AbstractText').join('\n\n');
  const journalTitle = parseXmlText(xml, 'Title');
  const yearStr = parseXmlText(xml, 'Year');

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

  const doiMatch = xml.match(/<ArticleId IdType="doi">([^<]+)<\/ArticleId>/i);
  const doi = doiMatch ? doiMatch[1].trim() : undefined;

  const pmcMatch = xml.match(/<ArticleId IdType="pmc">(PMC\d+)<\/ArticleId>/i);
  const pmcid = pmcMatch ? pmcMatch[1].replace('PMC', '') : undefined;

  const keywords = parseXmlArray(xml, 'Keyword');
  const publicationTypes = parseXmlArray(xml, 'PublicationType');
  const retractionStatus = publicationTypes.some((type) => /retracted publication|retraction of publication/i.test(type))
    ? 'notice_found'
    : 'no_notice_found';

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
    availableSections: abstractText ? ['abstract'] : [],
    retractionStatus,
    sourceUrls: [`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`],
    isPreprint: false,
  };
}

export async function fetchPMCFullText(pmcid: string): Promise<{
  fullText: string;
  references: import('../../types').ArticleReference[];
  availableSections: string[];
  sourceUrl: string;
} | null> {
  try {
    const url = `${NCBI_BASE}/efetch.fcgi?db=pmc&id=${pmcid}&rettype=full&retmode=xml`;
    const res = await fetchWithTimeout(url);
    if (!res.ok) return null;
    const xml = await res.text();

    const parsed = parseJatsDocument(xml);
    if (!parsed.fullText) return null;
    return {
      fullText: parsed.fullText,
      references: parsed.references,
      availableSections: parsed.availableSections,
      sourceUrl: `https://pmc.ncbi.nlm.nih.gov/articles/PMC${pmcid}/`,
    };
  } catch {
    return null;
  }
}
