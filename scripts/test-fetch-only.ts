/** Live retrieval smoke test using stable public NCBI endpoints. */
import assert from 'node:assert/strict';
import { fetchArticle } from '../src/services/articleFetcher';
import { hasValidIdentifier, parseArticleUrl } from '../src/services/urlParser';

async function main() {
  const input = process.argv[2] || 'https://pubmed.ncbi.nlm.nih.gov/26551272/';
  const identifier = parseArticleUrl(input);
  assert.ok(hasValidIdentifier(identifier), 'The input must contain a PMID, PMCID, DOI, or arXiv identifier.');

  const article = await fetchArticle(identifier, {
    unpaywallEmail: '',
    onProgress: (message) => console.log(message),
  });

  assert.ok(article.title.length > 10, 'Expected article title metadata.');
  assert.ok(article.abstract.length > 100 || (article.fullText?.length ?? 0) > 1000, 'Expected assessable article text.');
  assert.notEqual(article.fetchSource, 'metadata_only', 'Metadata-only records must not enter analysis.');
  console.log(`Fetch smoke test passed: ${article.fetchSource}, ${article.title.slice(0, 80)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Fetch smoke test failed.');
  process.exitCode = 1;
});
