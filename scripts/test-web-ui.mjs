import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// No provider keys, saved user records, or paid generation. Use an isolated browser.
const base = (process.env.MEDLIT_SMOKE_URL || 'http://localhost:8094').replace(/\/$/, '');
const session = `medlit-ui-${Date.now()}`;
let initialized = false;
function browser(...args) {
  const init = initialized ? [] : ['--init-script', fileURLToPath(new URL('./browser-fixture-init.js', import.meta.url))];
  initialized = true;
  const raw = execFileSync('npx', ['--yes', 'agent-browser@0.37.1', '--session', session, ...init, ...args, '--json'], { encoding: 'utf8', timeout: 45000 });
  const result = JSON.parse(raw);
  if (!result.success) throw new Error(result.error || 'Browser command failed');
  return result.data;
}
try {
  browser('set', 'viewport', '1440', '1000');
  for (const path of process.env.MEDLIT_SMOKE_INTERACTIONS_ONLY ? ['/example'] : ['/', '/history', '/settings', '/chatgpt', '/import', '/shared', '/methodology', '/learn', '/faq', '/auth', '/connect', '/about', '/privacy', '/terms', '/example']) {
    browser('open', base + path);
    browser('wait', '--load', 'networkidle');
    const errors = browser('errors').errors;
    assert.deepEqual(errors, [], `Runtime/hydration error on ${path}: ${JSON.stringify(errors)}`);
    console.log(`Hydration and runtime: ${path} passed`);
  }
  browser('scrollintoview', '#tab-evidence');
  browser('click', '#tab-evidence');
  browser('wait', '[aria-label="Guided critical appraisal teaching mode"]');
  assert.equal(browser('eval', 'document.querySelector("#tab-evidence").getAttribute("aria-selected")').result, 'true');
  browser('press', 'ArrowRight');
  assert.equal(browser('eval', 'document.activeElement.id').result, 'tab-methods');
  assert.equal(browser('eval', 'document.querySelector("[role=tabpanel]").getAttribute("aria-labelledby")').result, 'tab-methods');
  browser('press', 'End');
  browser('wait', '[aria-label="Create read-only share link"]');
  assert.equal(browser('eval', 'document.querySelector("#tab-citations").getAttribute("aria-selected")').result, 'true');
  browser('press', 'Home');
  assert.equal(browser('eval', 'document.activeElement.id').result, 'tab-overview');
  console.log('Example: evidence, methods, citations and keyboard tab navigation passed.');
  browser('open', base + '/');
  browser('wait', '--load', 'networkidle');
  browser('find', 'role', 'button', 'click', '--name', 'Unknown');
  assert.equal(browser('eval', 'document.body.textContent.includes("A protocol is not supplied")').result, true);
  browser('find', 'role', 'button', 'click', '--name', 'Reported strength');
  assert.equal(browser('eval', 'document.body.textContent.includes("Randomization is described")').result, true);
  console.log('Interactive research preview distinguishes reported strengths, concerns and unknowns.');
  browser('wait', '[aria-label="Connect AI provider"]');
  browser('click', '[aria-label="Connect AI provider"]');
  browser('wait', '[role="dialog"]');
  assert.equal(browser('eval', 'document.querySelector("[role=dialog]").textContent.includes("Choose your AI provider")').result, true);
  browser('wait', 'input[aria-label="Anthropic API key"]');
  assert.equal(browser('eval', `document.querySelector('input[aria-label="Anthropic API key"]').type`).result, 'password');
  browser('press', 'Escape');
  assert.deepEqual(browser('errors').errors, []);
  console.log('Connection dialog opens and dismisses without runtime errors.');
  const fakeState = 'a'.repeat(64);
  const pending = { state: fakeState, verifier: 'b'.repeat(64), origin: new URL(base).origin, article: '10.1056/NEJMoa1511939', createdAt: Date.now() };
  browser('eval', `sessionStorage.setItem('medlit.openrouter.pending.v1', ${JSON.stringify(JSON.stringify(pending))})`);
  browser('open', `${base}/connect?state=${fakeState}&code=medlit-browser-test`);
  browser('wait', '[aria-label="Change AI connection"]');
  assert.equal(browser('eval', 'window.__medlitTestCalls.auth').result, 1);
  assert.equal(browser('eval', 'window.__medlitTestCalls.generation').result, 0);
  assert.equal(browser('eval', 'sessionStorage.getItem("medlit.openrouter.pending.v1")').result, null);
  assert.equal(browser('eval', 'Object.values(localStorage).some(value => value.includes("sk-or-v1-synthetic"))').result, false);
  assert.equal(browser('eval', `document.querySelector('input[aria-label="Article URL or DOI"]').value`).result, '10.1056/NEJMoa1511939');
  browser('fill', '[aria-label="Article URL or DOI"]', 'not-a-paper');
  browser('find', 'role', 'button', 'click', '--name', 'Appraise this paper');
  browser('wait', '[role="alert"]');
  assert.equal(browser('eval', 'window.__medlitTestCalls.generation').result, 0);
  assert.equal(browser('eval', 'document.body.textContent.includes("A supported PubMed, PMC, DOI")').result, true);
  browser('reload'); browser('wait', '[aria-label="Connect AI provider"]');
  console.log('Mocked OAuth callback: one exchange, draft restored, no automatic generation, memory-only key cleared on refresh.');

  // A disposable, isolated browser receives a synthetic report, never user data.
  const fixture = JSON.parse(execFileSync('npx', ['tsx', '-e', "import { createExampleAppraisal } from './src/services/exampleAppraisal.ts'; console.log(JSON.stringify(createExampleAppraisal()))"], { encoding: 'utf8' }));
  browser('eval', `localStorage.setItem('@medlit:analyses:v3', ${JSON.stringify(JSON.stringify([fixture]))})`);
  browser('open', base + '/history'); browser('wait', '[aria-label="Open appraisal for Fictional example: a reading app and self-reported concentration"]');
  browser('click', '[aria-label="Open appraisal for Fictional example: a reading app and self-reported concentration"]');
  browser('wait', '#tab-overview');
  assert.equal(browser('eval', 'window.__medlitTestCalls.generation').result, 0);
  console.log('Saved history reopens the full synthetic report without an AI request.');

  browser('open', base + '/faq'); browser('fill', '[aria-label="Search frequently asked questions"]', 'unlikely-no-result-xyz');
  assert.equal(browser('eval', 'document.body.textContent.includes("No matching questions")').result, true);
  browser('fill', '[aria-label="Search frequently asked questions"]', 'OpenRouter');
  assert.equal(browser('eval', 'document.body.textContent.includes("without copying a key")').result, true);
  browser('open', base + '/learn'); browser('find', 'text', '2. Read the score', 'click');
  assert.equal(browser('eval', 'document.body.textContent.includes("Traceability is not truth.")').result, true);
  console.log('FAQ search and tutorial chapter interaction passed.');
  browser('set', 'viewport', '390', '844');
  for (const path of ['/', '/example', '/faq', '/learn', '/auth', '/history', '/about', '/privacy', '/terms']) {
    browser('open', base + path);
    browser('wait', '--load', 'networkidle');
    assert.equal(browser('eval', 'document.documentElement.scrollWidth <= innerWidth').result, true, `Horizontal page overflow on ${path}`);
    assert.deepEqual(browser('errors').errors, []);
  }
  browser('open', base + '/');
  assert.equal(browser('eval', `document.querySelector('[data-layout="research-intake"]').getBoundingClientRect().bottom <= document.querySelector('[data-layout="research-preview"]').getBoundingClientRect().top`).result, true, 'Mobile intake and preview must not overlap');
  browser('find', 'role', 'button', 'click', '--name', 'See what you’ll get');
  browser('find', 'role', 'button', 'click', '--name', 'Unknown');
  assert.equal(browser('eval', 'document.body.textContent.includes("A protocol is not supplied")').result, true);
  assert.equal(browser('eval', 'document.documentElement.scrollWidth <= innerWidth').result, true);
  browser('open', base + '/privacy');
  browser('find', 'role', 'button', 'click', '--name', 'Jump to Apple, Google and email accounts', '--exact');
  assert.equal(browser('eval', `Array.from(document.querySelectorAll('[role="heading"]')).some(el => el.textContent === 'Apple, Google and email accounts' && el.getBoundingClientRect().top >= 0 && el.getBoundingClientRect().top < innerHeight)`).result, true);
  console.log('Mobile example disclosure and policy contents navigation passed.');
  browser('set', 'media', 'light', 'reduced-motion');
  browser('open', base + '/');
  assert.equal(browser('eval', 'matchMedia("(prefers-reduced-motion: reduce)").matches').result, true);
  assert.equal(browser('eval', `parseFloat(getComputedStyle(document.querySelector('[data-motion="paper"]')).animationDuration) <= 0.01`).result, true);
  console.log('Reduced-motion CSS removes the paper entrance animation.');
  browser('open', base + '/'); browser('click', '[aria-label="Open navigation"]');
  assert.equal(browser('eval', `document.querySelector('[aria-label="Close navigation"]').getAttribute('aria-expanded')`).result, 'true');
  browser('scrollintoview', '[role="navigation"] [role="link"]:nth-child(3)');
  browser('find', 'role', 'link', 'click', '--name', 'Learn', '--exact');
  browser('wait', '--url', '**/learn');
  // Expo retains hidden previous routes; a raw selector can resolve the hidden
  // header. Check the visible accessibility tree on the destination instead.
  assert.match(browser('snapshot', '-i').snapshot, /button "Open navigation" \[expanded=false/);
  console.log('Mobile home and example: no page overflow or runtime errors.');
} catch (error) {
  try { console.log('Failure URL:', browser('get', 'url')); console.log(browser('snapshot', '-i')); } catch {}
  throw error;
} finally {
  try { browser('close'); } catch { /* Keep the original test failure. */ }
}
