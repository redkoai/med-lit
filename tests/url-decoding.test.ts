import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const queryString = require('query-string');

test('router query-string handles ordinary and malformed UTF-8 with the patched decoder', { timeout: 2000 }, () => {
  assert.equal(queryString.parse('q=caf%C3%A9').q, 'café');
  assert.equal(queryString.parse('q=%F0%9F%8C%8A').q, '🌊');
  assert.equal(queryString.parse('q=a+b').q, 'a b');
  const malformed = '%FF'.repeat(20000);
  assert.equal(queryString.parse('q=' + malformed).q, malformed);
  assert.equal(queryString.parse('q=%FF%41').q, '%FFA');
});
