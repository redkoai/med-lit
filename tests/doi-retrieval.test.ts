import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchArticle } from '../src/services/articleFetcher';
import { fetchFromEuropePMC } from '../src/services/sources/europePmc';
import { parseArticleUrl } from '../src/services/urlParser';
test('bare DOI retrieves available abstract and follows a newly resolved PMC identifier', async () => {
  const original = globalThis.fetch; const urls: string[] = [];
  globalThis.fetch = async input => {
    const url = String(input); urls.push(url);
    if (url.includes('api.crossref.org/works/')) return Response.json({ message: { title: ['Synthetic DOI retrieval regression'], 'container-title': ['Fixture journal'], author: [], published: { 'date-parts': [[2026]] } } });
    if (url.includes('/search?')) return Response.json({ resultList: { result: [{ source: 'MED', id: '123', pmcid: 'PMC456', abstractText: '<h4>Background</h4>A synthetic abstract.', isOpenAccess: 'N' }] } });
    if (url.includes('db=pmc&id=456')) return new Response(`<article><body><sec><title>Methods</title><p>${'Synthetic source text for the regression. '.repeat(30)}</p></sec></body></article>`);
    throw new Error(`Unexpected request ${url}`);
  };
  try {
    const article = await fetchArticle(parseArticleUrl('10.1234/fixture'), { unpaywallEmail: '' });
    assert.equal(article.fetchSource, 'full_text'); assert.equal(article.pmid, '123');
    assert.match(article.abstract, /synthetic abstract/);
    assert.ok(urls.some(url => url.includes('db=pmc&id=456')));
    assert.ok(!urls.some(url => url.startsWith('10.') || url.includes('/PMC/')));
  } finally { globalThis.fetch = original; }
});
test('Europe PMC uses its documented fullTextXML path and retains core abstract', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async input => {
    const url = String(input);
    if (url.includes('/search?')) return Response.json({ resultList: { result: [{ pmid: '123', pmcid: 'PMC456', abstractText: '<p>Available abstract</p>', isOpenAccess: 'Y' }] } });
    assert.equal(url, 'https://www.ebi.ac.uk/europepmc/webservices/rest/PMC456/fullTextXML');
    return new Response('', { status: 404 });
  };
  try { const result = await fetchFromEuropePMC('10.1234/fixture'); assert.equal(result?.abstract, 'Available abstract'); }
  finally { globalThis.fetch = original; }
});
