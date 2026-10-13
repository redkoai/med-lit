import assert from 'node:assert/strict';
import test from 'node:test';
import { buildAnalysisFromModel } from '../src/services/analysisValidation';
import { decodeSharedSnapshot, encodeSharedSnapshot } from '../src/services/shareSnapshot';
import { fixtureArticle, fixtureIdentifier, fixtureModelOutput } from './testFixture';

test('PICO requires a verified supporting passage for identified elements', () => {
  const model = {
    ...fixtureModelOutput,
    pico: {
      population: { value: 'Randomized participants', status: 'identified', evidenceIds: ['e-random'] },
      intervention: { value: 'Invented intervention', status: 'identified', evidenceIds: ['e-invented'] },
      comparator: { value: 'Not described', status: 'not_reported', evidenceIds: [] },
      outcomes: { value: 'Primary outcome', status: 'identified', evidenceIds: ['e-missing'] },
      timeframe: { value: 'Not described', status: 'not_reported', evidenceIds: [] },
    },
  };
  const analysis = buildAnalysisFromModel(model, fixtureArticle, fixtureIdentifier, 'fixture/offline');
  assert.equal(analysis.pico?.population.status, 'identified');
  assert.equal(analysis.pico?.intervention.status, 'not_reported');
  assert.equal(analysis.pico?.outcomes.status, 'identified');
});

test('portable share links round-trip appraisal evidence but exclude private notes and feedback', () => {
  const analysis = buildAnalysisFromModel(fixtureModelOutput, fixtureArticle, fixtureIdentifier, 'fixture/offline');
  analysis.notes = 'private note';
  analysis.feedback = [{
    id: 'review-1',
    judgmentId: 'rct.randomization',
    rating: 'disagree',
    note: 'private reviewer note',
    createdAt: new Date().toISOString(),
    analysisVersion: analysis.analysisVersion,
  }];
  const encoded = encodeSharedSnapshot(analysis);
  const decoded = decodeSharedSnapshot(encoded);
  assert.equal(decoded?.title, analysis.article.title);
  assert.ok(decoded?.judgments.some((judgment) => judgment.quote?.includes('randomly assigned')));
  assert.equal(encoded.includes('private'), false);
});
