import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const base = process.env.MEDLIT_SMOKE_URL;
assert(base && new URL(base).protocol === 'https:', 'Set an explicit hosted MEDLIT_SMOKE_URL');
const expected = new URL(base).hostname === 'medlit-evidence-appraisal.vercel.app' ? 'production' : 'preview';
const session = `medlit-telemetry-${Date.now()}`;
let initialized = false;
function browser(...args) {
  const init = initialized ? [] : ['--init-script', fileURLToPath(new URL('./telemetry-browser-init.js', import.meta.url))];
  initialized = true;
  const result = JSON.parse(execFileSync('npx', ['--yes', 'agent-browser@0.37.1', '--session', session, ...init, ...args, '--json'], { encoding: 'utf8', timeout: 45000 }));
  if (!result.success) throw new Error(result.error || 'Browser command failed');
  return result.data;
}
const evalBrowser = expression => browser('eval', expression).result;
const toggle = '[aria-label="Share first-party product interactions"]';
const checked = () => evalBrowser(`[...document.querySelectorAll('${toggle}')].find(e => e.checkVisibility()).getAttribute('aria-checked')`);
let visitor;
try {
  browser('open', base + '/settings');
  browser('wait', '--load', 'networkidle');
  assert.deepEqual(browser('errors').errors, []);
  assert.equal(evalBrowser('window.__medlitTelemetryChecks.length'), 0);
  assert.equal(evalBrowser('localStorage.getItem("redko-loop:medlit:identity")'), null);
  assert.equal(checked(), 'false');
  browser('find', 'role', 'switch', 'click', '--name', 'Share first-party product interactions', '--exact');
  assert.equal(checked(), 'true');
  visitor = evalBrowser('JSON.parse(localStorage.getItem("redko-loop:medlit:identity")).visitor');
  // Client-side navigation preserves the observation and exercises real tagged controls.
  browser('scroll', 'up', '10000');
  browser('find', 'role', 'link', 'click', '--name', 'Read', '--exact');
  browser('wait', '--fn', 'window.__medlitTelemetryChecks.some(x => x.url.endsWith("collect_product_loop") && x.status === 200)');
  const calls = evalBrowser('window.__medlitTelemetryChecks');
  assert(!calls.some(x => x.url.includes('posthog.com')));
  const events = calls.flatMap(x => x.events || []);
  assert(events.length > 0);
  for (const event of events) {
    assert.equal(event.product, 'medlit');
    assert.equal(event.environment, expected);
    assert(event.fields.every(k => ['id', 'visitor', 'session', 'version', 'at', 'value', 'x', 'y', 'viewport'].includes(k)));
  }
  console.log('No identity/network before consent; opt-in sent only allowlisted MedLit events, without PostHog.');
  // Never print deletion credentials. The synthetic ID permits a narrowly scoped operator check.
  if (process.env.MEDLIT_TELEMETRY_OPERATOR_MODULE) {
    const { connect } = await import(process.env.MEDLIT_TELEMETRY_OPERATOR_MODULE);
    const db = await connect();
    try {
      const result = await db.query('select product, environment, count(*)::int as count from public.product_loop_events where visitor=$1 group by product, environment', [visitor]);
      assert.deepEqual(result.rows.map(({ product, environment }) => ({ product, environment })), [{ product: 'medlit', environment: expected }]);
      assert(result.rows[0].count > 0);
    } finally { await db.end(); }
    console.log('Server rows verified for this synthetic browser only, in the expected product/environment partition.');
  }
  browser('find', 'role', 'link', 'click', '--name', 'AI & settings', '--exact');
  browser('find', 'role', 'switch', 'click', '--name', 'Share first-party product interactions', '--exact');
  assert.equal(checked(), 'false');
  const count = evalBrowser('window.__medlitTelemetryChecks.length');
  browser('scroll', 'up', '10000');
  browser('find', 'role', 'link', 'click', '--name', 'Library', '--exact');
  browser('wait', '2200');
  assert.equal(evalBrowser('window.__medlitTelemetryChecks.length'), count);
  console.log('Withdrawal prevents further navigation capture.');
  browser('find', 'role', 'link', 'click', '--name', 'AI & settings', '--exact');
  browser('find', 'role', 'button', 'click', '--name', 'Delete this browser’s product analytics', '--exact');
  browser('wait', '--fn', 'document.body.textContent.includes("Deletion was confirmed for analytics identities retained by this browser.")');
  assert.equal(evalBrowser('localStorage.getItem("redko-loop:medlit:identity")'), null);
  if (process.env.MEDLIT_TELEMETRY_OPERATOR_MODULE) {
    const { connect } = await import(process.env.MEDLIT_TELEMETRY_OPERATOR_MODULE);
    const db = await connect();
    try {
      const result = await db.query('select count(*)::int as count from public.product_loop_events where visitor=$1', [visitor]);
      assert.equal(result.rows[0].count, 0);
    } finally { await db.end(); }
  }
  assert.deepEqual(browser('errors').errors, []);
  browser('set', 'viewport', '390', '844');
  assert.equal(evalBrowser('document.documentElement.scrollWidth <= innerWidth'), true);
  console.log('UI deletion confirmed; synthetic server rows removed; mobile settings fit without overflow.');
} finally {
  // Keep the test identity recoverable when a failed check prevented its UI deletion.
  if (visitor && evalBrowser('localStorage.getItem("redko-loop:medlit:identity")')) {
    console.log(`Telemetry check did not finish cleanup. Isolated browser session retained: ${session}`);
  } else {
    try { browser('close'); } catch {}
  }
}
