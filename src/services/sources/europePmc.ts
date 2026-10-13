import { fetchWithTimeout } from '../network';
import { parseJatsDocument, stripXml } from '../xmlUtils';
import type { ArticleReference } from '../../types';

const EUROPE_PMC_BASE = 'https://www.ebi.ac.uk/europepmc/webservices/rest';

export async function fetchFromEuropePMC(doi: string): Promise<{
  pmid?: string;
  pmcid?: string;
  abstract?: string;
  fullText?: string;
  references?: ArticleReference[];
  availableSections?: string[];
  sourceUrl?: string;
} | null> {
  try {
    const searchUrl = `${EUROPE_PMC_BASE}/search?query=DOI:"${encodeURIComponent(doi)}"&format=json&resultType=core&pageSize=1`;
    const res = await fetchWithTimeout(searchUrl);
    if (!res.ok) return null;
    const data = await res.json();

    const article = data?.resultList?.result?.[0];
    if (!article) return null;

    const pmidValue = article.pmid?.toString() || (article.source === 'MED' ? article.id?.toString() : '');
    const pmid = /^\d+$/.test(pmidValue ?? '') ? pmidValue : undefined;
    const pmcidValue = typeof article.pmcid === 'string' ? article.pmcid.replace(/^PMC/i, '') : '';
    const pmcid = /^\d+$/.test(pmcidValue) ? pmcidValue : undefined;
    const abstract = typeof article.abstractText === 'string' ? stripXml(article.abstractText) : undefined;

    let fullText: string | undefined;
    let references: ArticleReference[] | undefined;
    let availableSections: string[] | undefined;
    let sourceUrl: string | undefined;
    if (pmcid && article.isOpenAccess !== 'N') {
      try {
        const ftUrl = `${EUROPE_PMC_BASE}/PMC${pmcid}/fullTextXML`;
        const ftRes = await fetchWithTimeout(ftUrl);
        if (ftRes.ok) {
          const ftXml = await ftRes.text();
          const parsed = parseJatsDocument(ftXml);
          fullText = parsed.fullText;
          references = parsed.references;
          availableSections = parsed.availableSections;
          sourceUrl = `https://europepmc.org/articles/PMC${pmcid}`;
        }
      } catch {
        /* ignore */
      }
    }

    return { pmid, pmcid, abstract, fullText, references, availableSections, sourceUrl };
  } catch {
    return null;
  }
}
