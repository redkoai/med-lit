import assert from 'node:assert/strict';
import test from 'node:test';
import { hasValidIdentifier, parseArticleUrl } from '../src/services/urlParser';

test('parses PubMed, PMC, DOI, and preprint identifiers', () => {
  assert.equal(parseArticleUrl('https://pubmed.ncbi.nlm.nih.gov/26551272/').pmid, '26551272');
  assert.equal(parseArticleUrl('https://pmc.ncbi.nlm.nih.gov/articles/PMC4689591/').pmcid, '4689591');
  assert.equal(parseArticleUrl('https://doi.org/10.1000/example').doi, '10.1000/example');
  assert.equal(parseArticleUrl('https://www.medrxiv.org/content/10.1101/2025.01.01.123456v2').doi, '10.1101/2025.01.01.123456');
});

test('rejects arbitrary web pages without a scientific identifier', () => {
  assert.equal(hasValidIdentifier(parseArticleUrl('https://example.com/blog')), false);
});
