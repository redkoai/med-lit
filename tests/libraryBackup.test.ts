import assert from 'node:assert/strict';
import test from 'node:test';
import { createLibraryBackup } from '../src/utils/libraryBackup';
import { buildAnalysisFromModel } from '../src/services/analysisValidation';
import { fixtureArticle, fixtureIdentifier, fixtureModelOutput } from './testFixture';

const fixtureAnalysis = buildAnalysisFromModel(fixtureModelOutput, fixtureArticle, fixtureIdentifier, 'fixture/offline');

test('library backup is versioned and contains complete analyses without provider keys', () => {
  const backup = createLibraryBackup([fixtureAnalysis]);
  const json = JSON.stringify(backup);
  assert.equal(backup.schema, 'medlit-library-backup-v1');
  assert.equal(backup.analyses[0].appraisal.judgments.length, fixtureAnalysis.appraisal.judgments.length);
  assert.equal(/apiKey|sk-ant|AIza/i.test(json), false);
});
