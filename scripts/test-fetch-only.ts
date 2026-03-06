/**
 * Test URL parsing + article fetch only (no API key needed).
 * Usage: npx tsx scripts/test-fetch-only.ts [url]
 */

const testUrl =
  process.argv[2] ||
  'https://www.thelancet.com/journals/landig/article/piis2589-7500%2820%2930017-0/fulltext';

async function main() {
  const { parseArticleUrl, hasValidIdentifier, formatIdentifierLabel } = await import(
    '../src/services/urlParser'
  );
  const { fetchArticle } = await import('../src/services/articleFetcher');

  console.log('URL:', testUrl);
  const identifier = parseArticleUrl(testUrl);
  console.log('Parsed:', formatIdentifierLabel(identifier), identifier.doi ? `(${identifier.doi})` : '');
  if (!hasValidIdentifier(identifier)) {
    console.error('Could not extract PMID, DOI, or PMC ID from URL.');
    process.exit(1);
  }

  console.log('\nFetching article...');
  const article = await fetchArticle(identifier, {
    unpaywallEmail: 'medlit@example.com',
    sciHubEnabled: false,
    sciHubMirror: '',
    onProgress: (msg) => console.log('  ', msg),
  });
  console.log('\n--- Fetched ---');
  console.log('Title:', article.title);
  console.log('Authors:', article.authors?.slice(0, 5).join(', '));
  console.log('Journal:', article.journal);
  console.log('Year:', article.year);
  console.log('Fetch source:', article.fetchSource);
  console.log('Abstract length:', article.abstract?.length ?? 0);
  if (article.abstract) console.log('Abstract (first 400 chars):', article.abstract.slice(0, 400) + '...');
  console.log('\nFetch works. Add EXPO_PUBLIC_ANTHROPIC_API_KEY to .env.local and run scripts/test-analyze.ts for full analysis.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
