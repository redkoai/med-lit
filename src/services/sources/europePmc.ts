import { fetchWithTimeout } from '../network';

const EUROPE_PMC_BASE = 'https://www.ebi.ac.uk/europepmc/webservices/rest';

export async function fetchFromEuropePMC(doi: string): Promise<{
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
      } catch {
        /* ignore */
      }
    }

    return { pmid, pmcid, fullText };
  } catch {
    return null;
  }
}
