import assert from 'node:assert/strict';
import test from 'node:test';
import { parseImportText } from '../src/services/importParser';

test('parses and deduplicates DOI, PubMed, RIS, BibTeX, and URL input', () => {
  const parsed = parseImportText(`
    DOI  - 10.1000/Example.1
    @article{x, doi={10.1000/example.1}}
    PMID: 26551272
    UR  - https://pubmed.ncbi.nlm.nih.gov/44123456/
    https://doi.org/10.2000/second
  `);
  assert.deepEqual(parsed.map((item) => item.id), [
    'url:https://pubmed.ncbi.nlm.nih.gov/44123456/',
    'doi:10.2000/second',
    'doi:10.1000/example.1',
    'pmid:26551272',
  ]);
});

test('caps imports and ignores unsupported free text', () => {
  assert.deepEqual(parseImportText('not an identifier'), []);
  const many = Array.from({ length: 70 }, (_, index) => `10.1234/item-${index}`).join('\n');
  assert.equal(parseImportText(many).length, 50);
});
