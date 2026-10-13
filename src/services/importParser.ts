export interface ImportedArticle {
  id: string;
  url: string;
  label: string;
  source: 'url' | 'doi' | 'pmid';
}

const MAX_IMPORTS = 50;

function cleanDoi(value: string): string {
  return value
    .trim()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
    .replace(/[\s}\]>,.;:)]+$/g, '');
}

function add(
  results: ImportedArticle[],
  seen: Set<string>,
  source: ImportedArticle['source'],
  value: string,
): void {
  if (results.length >= MAX_IMPORTS) return;
  const normalized = source === 'doi' ? cleanDoi(value).toLowerCase() : value.trim();
  if (!normalized) return;
  const id = `${source}:${normalized}`;
  if (seen.has(id)) return;
  seen.add(id);
  results.push({
    id,
    source,
    label: source === 'doi' ? `DOI ${normalized}` : source === 'pmid' ? `PMID ${normalized}` : normalized,
    url: source === 'doi'
      ? `https://doi.org/${normalized}`
      : source === 'pmid'
        ? `https://pubmed.ncbi.nlm.nih.gov/${normalized}/`
        : normalized,
  });
}

/** Parse pasted URLs, DOI lists, PubMed IDs, RIS, and BibTeX/Zotero exports. */
export function parseImportText(input: string): ImportedArticle[] {
  const results: ImportedArticle[] = [];
  const seen = new Set<string>();

  for (const match of input.matchAll(/https?:\/\/[^\s<>"'}\]]+/gi)) {
    const raw = match[0].replace(/[),.;]+$/g, '');
    const doiMatch = raw.match(/(?:dx\.)?doi\.org\/(10\.\d{4,9}\/[^?#]+)/i);
    if (doiMatch) add(results, seen, 'doi', doiMatch[1]);
    else add(results, seen, 'url', raw);
  }

  for (const match of input.matchAll(/\b10\.\d{4,9}\/[\w.()/:;-]+/gi)) {
    add(results, seen, 'doi', match[0]);
  }

  for (const match of input.matchAll(/\b(?:PMID|pubmed(?:\s+id)?)\s*(?:-|:|=)\s*(\d{6,9})\b/gi)) {
    add(results, seen, 'pmid', match[1]);
  }

  return results;
}
