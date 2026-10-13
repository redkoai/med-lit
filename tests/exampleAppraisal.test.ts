import assert from 'node:assert/strict';
import test from 'node:test';
import { createExampleAppraisal, EXAMPLE_SOURCE } from '../src/services/exampleAppraisal';

test('key-free example is clearly fictional and deterministic', () => {
  const a = createExampleAppraisal();
  assert.deepEqual(a, createExampleAppraisal());
  assert.match(a.article.title, /Fictional/);
  assert.equal(a.analysisModel, 'example/hand-authored');
  assert.equal(a.article.doi, undefined);
  assert.equal(a.article.pmid, undefined);
  assert.equal(a.referenceCheck.status, 'NOT_ASSESSED');
  assert.equal(a.verdict.applicability, 'not_assessed');
});
test('example uses real validation: unsupported claim excluded and uncertainty preserved', () => {
  const a = createExampleAppraisal();
  assert.equal(a.appraisal.invalidEvidenceCount, 1);
  assert.equal(a.appraisal.evidence.filter(e => e.verified).length, 5);
  assert.equal(a.appraisal.judgments.find(j => j.id === 'rct.selection')?.judgment, 'unclear');
  assert.equal(a.appraisal.judgments.find(j => j.id === 'rct.missing')?.judgment, 'some_concerns');
  assert.equal(a.conflictOfInterest.industryFunded, 'unclear');
  assert.ok(!EXAMPLE_SOURCE.fullText?.includes('All outcomes followed a preregistered analysis plan.'));
});
