/** Offline scientific-contract smoke test. No provider credentials are used. */
import assert from 'node:assert/strict';
import { buildAnalysisFromModel } from '../src/services/analysisValidation';
import { fixtureArticle, fixtureIdentifier, fixtureModelOutput } from '../tests/testFixture';

const analysis = buildAnalysisFromModel(
  fixtureModelOutput,
  fixtureArticle,
  fixtureIdentifier,
  'fixture/offline',
);

assert.equal(analysis.analysisVersion, '4.1.0');
assert.equal(analysis.studyDesign.type, 'Randomized Controlled Trial');
assert.equal(analysis.appraisal.sourceCoverage.level, 'full_text');
assert.equal(analysis.appraisal.invalidEvidenceCount, 1);
assert.equal(analysis.appraisal.evidence.filter((item) => item.verified).length, 5);
assert.equal(
  analysis.appraisal.judgments.find((item) => item.id === 'rct.selection')?.judgment,
  'unclear',
  'A determinate judgment must not survive when its only quote cannot be matched.',
);
assert.equal(analysis.verdict.applicability, 'not_assessed');
assert.ok(!('trustworthy' in analysis.verdict));

console.log('Analysis contract smoke test passed: verified quotes, deterministic scoring, and unable-to-assess fallback.');
