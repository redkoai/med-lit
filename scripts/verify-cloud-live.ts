// Explicitly opt-in live integration check. Uses disposable, synthetic accounts.
// Run with node --env-file=.env.cloud.local --import tsx scripts/verify-cloud-live.ts
// Set MEDLIT_LIVE_QA=medlit-evidence; optional MEDLIT_QA_KEEP_FILE retains one
// synthetic account for browser verification. Never use customer credentials.
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, getDocFromServer, deleteDoc, collection, getDocs, query, orderBy, limit, setLogLevel } from 'firebase/firestore';
import { createExampleAppraisal } from '../src/services/exampleAppraisal';

const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
assert.equal(projectId, 'medlit-evidence');
assert.equal(process.env.MEDLIT_LIVE_QA, projectId, 'Explicit live-QA opt-in required');
const config = { projectId, apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY, appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID };
setLogLevel('silent');
const run = `${Date.now()}-${randomBytes(4).toString('hex')}`;
const accounts: { app: ReturnType<typeof initializeApp>; auth: ReturnType<typeof getAuth>; db: ReturnType<typeof getFirestore>; uid: string; email: string; password: string }[] = [];
const anonymousApp = initializeApp(config, `qa-anonymous-${run}`);
let passed = 0;
let keep = false;
async function check(name: string, action: () => Promise<unknown>) { await action(); passed++; console.log(`PASS ${name}`); }
async function denied(action: () => Promise<unknown>) { await assert.rejects(action, (e: any) => e.code === 'permission-denied'); }
try {
  for (let i = 0; i < 2; i++) {
    const app = initializeApp(config, `qa-${run}-${i}`);
    const auth = getAuth(app), db = getFirestore(app);
    const email = `medlit-qa-${run}-${i}@example.com`, password = randomBytes(24).toString('base64url');
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    accounts.push({ app, auth, db, uid: user.uid, email, password });
  }
  const [a, b] = accounts;
  const path = `users/${a.uid}`;
  const analysis = JSON.parse(JSON.stringify({ ...createExampleAppraisal(), id: 'synthetic-cloud-qa', analyzedAt: new Date().toISOString(), notes: 'Synthetic QA seed. No patient data.' }));
  analysis.article.title = 'Synthetic cloud QA: fictional critical appraisal';
  await check('owner profile create and read', async () => { await setDoc(doc(a.db, path), { email: a.email, displayName: 'Synthetic QA', totalAnalyses: 1 }); assert.equal((await getDocFromServer(doc(a.db, path))).data()?.email, a.email); });
  await check('owner analysis create and read', async () => { await setDoc(doc(a.db, `${path}/analyses/${analysis.id}`), analysis); assert.equal((await getDocFromServer(doc(a.db, `${path}/analyses/${analysis.id}`))).data()?.notes, analysis.notes); });
  await check('owner analysis update', async () => { await setDoc(doc(a.db, `${path}/analyses/${analysis.id}`), { collection: 'QA verification' }, { merge: true }); assert.equal((await getDocFromServer(doc(a.db, `${path}/analyses/${analysis.id}`))).data()?.collection, 'QA verification'); });
  await check('owner preferences', async () => { await setDoc(doc(a.db, `${path}/settings/prefs`), { aiProvider: 'openai', saveHistory: true }); });
  await check('provider secret field rejected in preferences', () => denied(() => setDoc(doc(a.db, `${path}/settings/prefs`), { apiKey: 'synthetic-not-a-key' }, { merge: true })));
  await check('secret field rejected in profile', () => denied(() => setDoc(doc(a.db, path), { apiKey: 'synthetic-not-a-key' }, { merge: true })));
  await check('arbitrary settings document rejected', () => denied(() => setDoc(doc(a.db, `${path}/settings/keys`), { aiProvider: 'openai' })));
  await check('other account profile read denied', () => denied(() => getDocFromServer(doc(b.db, path))));
  await check('other account analysis read denied', () => denied(() => getDocFromServer(doc(b.db, `${path}/analyses/${analysis.id}`))));
  await check('other account analysis write denied', () => denied(() => setDoc(doc(b.db, `${path}/analyses/${analysis.id}`), { notes: 'unauthorized' })));
  await check('other account analysis delete denied', () => denied(() => deleteDoc(doc(b.db, `${path}/analyses/${analysis.id}`))));
  await check('other account library list denied', () => denied(() => getDocs(collection(b.db, `${path}/analyses`))));
  await check('anonymous analysis read denied', () => denied(() => getDocFromServer(doc(getFirestore(anonymousApp), `${path}/analyses/${analysis.id}`))));
  await check('global users list denied', () => denied(() => getDocs(collection(a.db, 'users'))));
  await check('descending bounded library query', async () => {
    // A freshly created Firestore index may take several minutes to become ready.
    for (let attempt = 0; ; attempt++) {
      try {
        const rows = await getDocs(query(collection(a.db, `${path}/analyses`), orderBy('analyzedAt', 'desc'), limit(100)));
        assert.equal(rows.size, 1); break;
      } catch (error: any) {
        if (error.code !== 'failed-precondition' || attempt >= 10) throw error;
        if (attempt === 0) console.log('Waiting for the new library index to finish building.');
        await new Promise(resolve => setTimeout(resolve, 30_000));
      }
    }
  });
  await check('owner analysis delete and absence', async () => { await deleteDoc(doc(a.db, `${path}/analyses/${analysis.id}`)); assert.equal((await getDocFromServer(doc(a.db, `${path}/analyses/${analysis.id}`))).exists(), false); });
  if (process.env.MEDLIT_QA_KEEP_FILE) {
    await setDoc(doc(a.db, `${path}/analyses/${analysis.id}`), analysis);
    writeFileSync(process.env.MEDLIT_QA_KEEP_FILE, JSON.stringify({ projectId, uid: a.uid, email: a.email, password: a.password, analysisId: analysis.id }), { mode: 0o600, flag: 'wx' });
    keep = true;
  }
  console.log(`${passed} live cloud checks passed. Browser fixture ${keep ? 'retained for cleanup after UI verification' : 'not retained'}.`);
} finally {
  for (const [index, a] of accounts.entries()) {
    if (!(index === 0 && keep)) {
      for (const name of ['analyses', 'settings']) {
        for (const row of (await getDocs(collection(a.db, 'users', a.uid, name))).docs) await deleteDoc(row.ref);
      }
      await deleteDoc(doc(a.db, 'users', a.uid));
      assert.equal((await getDoc(doc(a.db, 'users', a.uid))).exists(), false);
      if (a.auth.currentUser) await deleteUser(a.auth.currentUser);
    }
    await deleteApp(a.app);
  }
  await deleteApp(anonymousApp);
}
