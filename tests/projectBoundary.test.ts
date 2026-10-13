import assert from 'node:assert/strict';
import test from 'node:test';
import { isDedicatedMedLitCloud, MEDLIT_FIREBASE_APP_NAME } from '../src/services/projectBoundary';

const dedicated = {
  enabled: 'true', dedicatedProjectId: 'medlit-test-only', projectId: 'medlit-test-only',
  apiKey: 'test-placeholder', authDomain: 'medlit-test-only.firebaseapp.com', appId: 'test-app',
};
test('MedLit cloud is optional, explicit, and uses its own named app', () => {
  assert.equal(isDedicatedMedLitCloud({}), false);
  assert.equal(isDedicatedMedLitCloud({ ...dedicated, enabled: undefined }), false);
  assert.equal(isDedicatedMedLitCloud(dedicated), true);
  assert.equal(MEDLIT_FIREBASE_APP_NAME, 'medlit-workspace');
});
test('shared projects, mismatched project IDs or auth domains, and incomplete configs are rejected', () => {
  for (const projectId of ['med-lit', 'synaptik', 'synaptik-prod', 'gameer-ai']) {
    assert.equal(isDedicatedMedLitCloud({ ...dedicated, projectId, dedicatedProjectId: projectId, authDomain: `${projectId}.firebaseapp.com` }), false);
  }
  for (const field of ['dedicatedProjectId', 'projectId', 'apiKey', 'authDomain', 'appId'] as const) {
    assert.equal(isDedicatedMedLitCloud({ ...dedicated, [field]: '' }), false, field);
  }
  assert.equal(isDedicatedMedLitCloud({ ...dedicated, dedicatedProjectId: 'medlit-another' }), false);
  assert.equal(isDedicatedMedLitCloud({ ...dedicated, authDomain: 'synaptik.firebaseapp.com' }), false);
});
