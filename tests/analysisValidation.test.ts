import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAnalysisFromModel } from '../src/services/analysisValidation';
import { fixtureArticle, fixtureIdentifier, fixtureModelOutput } from './testFixture';

test('unmatched quotes cannot support determinate judgments', () => {
  const analysis = buildAnalysisFromModel(fixtureModelOutput, fixtureArticle, fixtureIdentifier, 'fixture/offline');
  assert.equal(analysis.appraisal.invalidEvidenceCount, 1);
  assert.equal(analysis.appraisal.judgments.find((item) => item.id === 'rct.selection')?.judgment, 'unclear');
  assert.equal(analysis.riskOfBias.overallRisk, 'unclear');
});

test('abstract-only coverage caps appraisal confidence and adds a limitation', () => {
  const article = { ...fixtureArticle, fullText: undefined, fetchSource: 'abstract_only' as const };
  const analysis = buildAnalysisFromModel(fixtureModelOutput, article, fixtureIdentifier, 'fixture/offline');
  assert.ok(['lower', 'insufficient'].includes(analysis.verdict.confidence));
  assert.match(analysis.limitations[0], /abstract or metadata/i);
});

test('the model cannot set truth, applicability, or final scores', () => {
  const manipulated = {
    ...fixtureModelOutput,
    accuracyScore: { score: 10 },
    verdict: { trustworthy: true, clinicallyApplicable: true },
  };
  const analysis = buildAnalysisFromModel(manipulated, fixtureArticle, fixtureIdentifier, 'fixture/offline');
  assert.equal(analysis.verdict.applicability, 'not_assessed');
  assert.ok(!('trustworthy' in analysis.verdict));
  assert.ok(analysis.evidenceScore.score < 10);
});

test('no matched domains cannot receive a reassuring overview or confidence label', () => {
  const raw = { ...fixtureModelOutput, evidence: [], overallAssessment: { summary: 'Every domain was verified.', keyTakeaway: 'Trust this study.' } };
  const result = buildAnalysisFromModel(raw, fixtureArticle, fixtureIdentifier, 'fixture/offline');
  assert.equal(result.verdict.confidence, 'insufficient');
  assert.equal(result.riskOfBias.overallRisk, 'unclear');
  assert.match(result.verdict.overallSummary, /^0 of 5 domains/);
  assert.ok(!result.verdict.keyTakeaway.includes('Trust'));
  assert.equal(result.conflictOfInterest.industryFunded, 'unclear');
});

test('all not-applicable domains do not imply low risk', () => {
  const raw = { ...fixtureModelOutput, judgments: fixtureModelOutput.judgments.map(item => ({ ...item, judgment: 'not_applicable' })) };
  const result = buildAnalysisFromModel(raw, fixtureArticle, fixtureIdentifier, 'fixture/offline');
  assert.equal(result.riskOfBias.overallRisk, 'unclear');
  assert.equal(result.verdict.confidence, 'insufficient');
});
