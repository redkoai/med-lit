import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAnalysisFromModel } from '../src/services/analysisValidation';
import { generateBibTeX } from '../src/utils/exportBibtex';
import { generateMarkdownReport } from '../src/utils/exportMarkdown';
import { generateTextReport } from '../src/utils/exportText';
import { fixtureArticle, fixtureIdentifier, fixtureModelOutput } from './testFixture';

const analysis = buildAnalysisFromModel(fixtureModelOutput, fixtureArticle, fixtureIdentifier, 'fixture/offline');

test('exports evidence and conservative product language', () => {
  for (const report of [generateMarkdownReport(analysis), generateTextReport(analysis)]) {
    assert.match(report, /SOURCE COVERAGE|Source coverage/);
    assert.match(report, /Participants were randomly assigned/);
    assert.match(report, /not peer review/i);
    assert.doesNotMatch(report, /Trustworthy:\s*(YES|NO)/i);
  }
});

test('BibTeX keeps article metadata without inventing a publication year', () => {
  const bibtex = generateBibTeX(analysis);
  assert.match(bibtex, /year = \{2025\}/);
  assert.match(bibtex, /confidence/);
  const undated = generateBibTeX({ ...analysis, article: { ...analysis.article, year: null } });
  assert.doesNotMatch(undated, /year =/);
});
