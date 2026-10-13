import test from 'node:test';
import assert from 'node:assert/strict';
import { accountProviderAvailability as availability } from '../src/services/accountProviderAvailability';
test('cloud and provider gates fail closed independently', () => {
  assert.deepEqual(availability(false, 'web', { googleEnabled: 'true', appleEnabled: 'true' }), { google: false, apple: false });
  assert.deepEqual(availability(true, 'web', {}), { google: false, apple: false });
  assert.deepEqual(availability(true, 'web', { googleEnabled: 'true' }), { google: true, apple: false });
});
test('native Google needs client identifiers; Apple is iOS only', () => {
  const config = { googleEnabled: 'true', appleEnabled: 'true', googleWebClientId: 'web' };
  assert.deepEqual(availability(true, 'ios', config), { google: false, apple: true });
  assert.deepEqual(availability(true, 'ios', { ...config, googleIosClientId: 'ios' }), { google: true, apple: true });
  assert.deepEqual(availability(true, 'android', config), { google: true, apple: false });
});
