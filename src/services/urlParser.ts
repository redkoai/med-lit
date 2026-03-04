import type { ArticleIdentifier, SourceType } from '../types';

// ─── URL Pattern Matchers ─────────────────────────────────────────────────────

const patterns: Array<{
  name: SourceType;
  test: (url: string) => ArticleIdentifier | null;
}> = [
  // PubMed
  {
    name: 'pubmed',
    test: (url) => {
      const m = url.match(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)/);
      if (!m) {
        const m2 = url.match(/ncbi\.nlm\.nih\.gov\/pubmed\/(\d+)/);
        if (!m2) return null;
        return { pmid: m2[1], sourceType: 'pubmed', originalUrl: url };
      }
      return { pmid: m[1], sourceType: 'pubmed', originalUrl: url };
    },
  },
  // PubMed Central
  {
    name: 'pmc',
    test: (url) => {
      const m = url.match(/ncbi\.nlm\.nih\.gov\/pmc\/articles\/PMC(\d+)/i);
      if (!m) return null;
      return { pmcid: m[1], sourceType: 'pmc', originalUrl: url };
    },
  },
  // DOI.org / dx.doi.org
  {
    name: 'doi',
    test: (url) => {
      const m = url.match(/(?:doi\.org|dx\.doi\.org)\/(.+)/);
      if (!m) return null;
      return { doi: decodeURIComponent(m[1].trim()), sourceType: 'doi', originalUrl: url };
    },
  },
  // Nature
  {
    name: 'nature',
    test: (url) => {
      const m = url.match(/nature\.com\/articles\/([a-zA-Z0-9\-_]+)/);
      if (!m) return null;
      // Nature DOI prefix is 10.1038/
      const doi = `10.1038/${m[1]}`;
      return { doi, sourceType: 'nature', originalUrl: url };
    },
  },
  // NEJM
  {
    name: 'nejm',
    test: (url) => {
      const m = url.match(/nejm\.org\/doi\/(?:full\/|abs\/|10\.[^/]+\/[^?#]+)/);
      if (!m) return null;
      const doiMatch = url.match(/nejm\.org\/doi\/(?:full\/|abs\/)?(10\.[^?#\s]+)/);
      if (!doiMatch) return null;
      return { doi: doiMatch[1].replace(/\/$/, ''), sourceType: 'nejm', originalUrl: url };
    },
  },
  // The Lancet
  {
    name: 'lancet',
    test: (url) => {
      // Pattern: thelancet.com/journals/lancet/article/PIIS0140-6736(23)01237-5/fulltext
      const piiMatch = url.match(/thelancet\.com.*?article\/(PII[^/?#]+)/i);
      if (piiMatch) {
        // Convert PII to DOI: PIIS0140-6736(23)01237-5 → 10.1016/S0140-6736(23)01237-5
        const pii = piiMatch[1];
        const doi = '10.1016/' + pii.replace(/^PII/i, '');
        return { doi, sourceType: 'lancet', originalUrl: url };
      }
      // Also try doi embedded in URL
      const doiMatch = url.match(/thelancet\.com.*?(10\.\d{4}\/[^\s?#"']+)/);
      if (doiMatch) {
        return { doi: doiMatch[1], sourceType: 'lancet', originalUrl: url };
      }
      return null;
    },
  },
  // JAMA Network
  {
    name: 'jama',
    test: (url) => {
      const m = url.match(/jamanetwork\.com.*?(10\.\d{4}\/[^\s?#"']+)/);
      if (!m) return null;
      return { doi: m[1], sourceType: 'jama', originalUrl: url };
    },
  },
  // bioRxiv
  {
    name: 'biorxiv',
    test: (url) => {
      const m = url.match(/biorxiv\.org\/content\/(10\.\d{4}\/[^\sv?#]+)/);
      if (!m) return null;
      // Strip version suffix (v1, v2, etc.)
      const doi = m[1].replace(/v\d+$/, '');
      return { doi, sourceType: 'biorxiv', originalUrl: url };
    },
  },
  // medRxiv
  {
    name: 'medrxiv',
    test: (url) => {
      const m = url.match(/medrxiv\.org\/content\/(10\.\d{4}\/[^\sv?#]+)/);
      if (!m) return null;
      const doi = m[1].replace(/v\d+$/, '');
      return { doi, sourceType: 'medrxiv', originalUrl: url };
    },
  },
  // arXiv
  {
    name: 'arxiv',
    test: (url) => {
      const m = url.match(/arxiv\.org\/(?:abs|pdf)\/(\d{4}\.\d{4,5}(?:v\d+)?)/);
      if (!m) return null;
      const arxivId = m[1].replace(/v\d+$/, '');
      return { arxivId, doi: `10.48550/arXiv.${arxivId}`, sourceType: 'arxiv', originalUrl: url };
    },
  },
  // Springer / BioMedCentral
  {
    name: 'springer',
    test: (url) => {
      const m = url.match(/(?:link\.springer\.com|biomedcentral\.com).*?(10\.\d{4}\/[^\s?#"']+)/);
      if (!m) return null;
      return { doi: m[1], sourceType: 'springer', originalUrl: url };
    },
  },
  // Sci-Hub (various mirrors)
  {
    name: 'scihub',
    test: (url) => {
      const scihubMirrors = [
        'sci-hub.se', 'sci-hub.st', 'sci-hub.ru', 'sci-hub.ren',
        'sci-hub.mksa.top', 'scihub.mksa.top',
      ];
      const isScihub = scihubMirrors.some((mirror) => url.includes(mirror));
      if (!isScihub) return null;

      // Try DOI in path
      const doiMatch = url.match(/sci-hub\.[a-z.]+\/(10\.\d{4}\/[^\s?#"']+)/);
      if (doiMatch) {
        return { doi: doiMatch[1], sourceType: 'scihub', originalUrl: url };
      }
      // Try PMID in path
      const pmidMatch = url.match(/sci-hub\.[a-z.]+\/(\d{5,9})(?:[/?#]|$)/);
      if (pmidMatch) {
        return { pmid: pmidMatch[1], sourceType: 'scihub', originalUrl: url };
      }
      return { sourceType: 'scihub', originalUrl: url };
    },
  },
];

// ─── Main Parser ──────────────────────────────────────────────────────────────

export function parseArticleUrl(rawUrl: string): ArticleIdentifier {
  const url = rawUrl.trim();

  for (const pattern of patterns) {
    const result = pattern.test(url);
    if (result) return result;
  }

  // Last resort: look for a DOI anywhere in the URL
  const genericDoi = url.match(/(10\.\d{4,9}\/[^\s?#"'<>[\]{}|\\^`]+)/);
  if (genericDoi) {
    return {
      doi: genericDoi[1].replace(/[.,;)]$/, ''),
      sourceType: 'doi',
      originalUrl: url,
    };
  }

  return { sourceType: 'unknown', originalUrl: url };
}

export function hasValidIdentifier(id: ArticleIdentifier): boolean {
  return !!(id.pmid || id.pmcid || id.doi || id.arxivId);
}

export function formatIdentifierLabel(id: ArticleIdentifier): string {
  if (id.pmid) return `PubMed: ${id.pmid}`;
  if (id.pmcid) return `PMC: ${id.pmcid}`;
  if (id.doi) return `DOI: ${id.doi}`;
  if (id.arxivId) return `arXiv: ${id.arxivId}`;
  return 'Unknown identifier';
}

export function isPreprint(id: ArticleIdentifier): boolean {
  return id.sourceType === 'biorxiv' || id.sourceType === 'medrxiv' || id.sourceType === 'arxiv';
}
