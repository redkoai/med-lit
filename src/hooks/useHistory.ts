import { useState, useEffect, useCallback, useMemo } from 'react';
import { captureEvent } from '../services/productAnalytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, deleteDoc, doc, getDoc, getDocs, limit, orderBy, query, setDoc, writeBatch } from 'firebase/firestore';
import { getDB } from '../services/firebase';
import { clearCurrentAnalysis } from '../services/currentAnalysis';
import { libraryKey, readLibrary, subscribeLibrary, updateLibrary } from '../services/libraryStorage';
import type { ArticleAnalysis, HistoryEntry, JudgmentFeedback } from '../types';

export function useHistory(uid?: string | null) {
  const owner = libraryKey(uid);
  const [state, setState] = useState({ owner, items: [] as ArticleAnalysis[], loaded: false, message: '' });
  const analyses = state.owner === owner ? state.items : [];
  const publish = useCallback((items: ArticleAnalysis[], message = '') => setState({ owner, items, loaded: true, message }), [owner]);
  useEffect(() => {
    let cancelled = false;
    setState({ owner, items: [], loaded: false, message: '' });
    const refresh = async () => {
      try { const items = await readLibrary(AsyncStorage, uid); if (!cancelled) setState(previous => ({ ...previous, owner, items, loaded: true })); }
      catch { if (!cancelled) publish([], 'Device storage could not be read. Your cloud library has not been replaced.'); }
    };
    void (async () => {
      await refresh();
      const db = getDB();
      if (uid && db) {
        try {
          const snapshot = await getDocs(query(collection(db, 'users', uid, 'analyses'), orderBy('analyzedAt', 'desc'), limit(100)));
          if (cancelled) return;
          const cloud = snapshot.docs.map(item => item.data() as ArticleAnalysis);
          // Never copy the guest library into an account automatically.
          const next = await updateLibrary(AsyncStorage, uid, local => [...cloud, ...local.filter(item => !cloud.some(remote => remote.id === item.id))]);
          if (!cancelled) publish(next, 'Account library loaded. Device-only changes need an explicit sync.');
        } catch { if (!cancelled) setState(previous => ({ ...previous, message: 'Cloud unavailable. Showing this account’s device cache.' })); }
      }
    })();
    const unsubscribe = subscribeLibrary(key => { if (key === owner) void refresh(); });
    return () => { cancelled = true; unsubscribe(); };
  }, [owner, uid, publish]);

  const history = useMemo<HistoryEntry[]>(() => analyses.map(a => ({
    id: a.id, title: a.article.title, journal: a.article.journal, year: a.article.year,
    url: a.identifier.originalUrl, analyzedAt: a.analyzedAt, evidenceScore: a.evidenceScore.score,
    biasConcernScore: a.riskOfBias.score, studyDesign: a.studyDesign.type, confidence: a.verdict.confidence,
    coverageLevel: a.appraisal.sourceCoverage.level, collection: a.collection, tags: a.tags,
  })), [analyses]);

  const syncOne = useCallback(async (analysis: ArticleAnalysis) => {
    const db = getDB();
    if (!uid || !db) return;
    try {
      await setDoc(doc(db, 'users', uid, 'analyses', analysis.id), JSON.parse(JSON.stringify(analysis)));
      void captureEvent('appraisal_saved', { destination: 'cloud' });
      setState(previous => previous.owner === owner ? { ...previous, message: 'Latest appraisal saved to your account.' } : previous);
    } catch {
      void captureEvent('appraisal_save_failed', { destination: 'cloud', reason: 'storage' });
      setState(previous => previous.owner === owner ? { ...previous, message: 'Saved on this device. Cloud sync failed; use Sync device changes to retry.' } : previous);
      throw new Error('Cloud sync failed. Your device copy is safe.');
    }
  }, [uid, owner]);

  const saveToHistory = useCallback(async (analysis: ArticleAnalysis) => {
    let persisted = analysis;
    let next: ArticleAnalysis[];
    try { next = await updateLibrary(AsyncStorage, uid, items => {
      persisted = { ...analysis, revision: Math.max(0, ...items.filter(item => item.articleKey === analysis.articleKey).map(item => item.revision ?? 0)) + 1 };
      return [persisted, ...items.filter(item => item.id !== analysis.id)];
    }); } catch (error) {
      void captureEvent('appraisal_save_failed', { destination: 'device', reason: 'storage' });
      throw error;
    }
    void captureEvent('appraisal_saved', { destination: 'device' });
    publish(next);
    try { await syncOne(persisted); } catch { /* Return the device copy after a paid generation. */ }
    return persisted;
  }, [uid, publish, syncOne]);

  const getAnalysis = useCallback(async (id: string): Promise<ArticleAnalysis | null> => {
    const local = await readLibrary(AsyncStorage, uid);
    const match = local.find(item => item.id === id);
    if (match) return match;
    const db = getDB();
    if (uid && db) { const snapshot = await getDoc(doc(db, 'users', uid, 'analyses', id)); if (snapshot.exists()) return snapshot.data() as ArticleAnalysis; }
    return null;
  }, [uid]);

  const changeAnalysis = useCallback(async (id: string, change: (a: ArticleAnalysis) => ArticleAnalysis) => {
    const current = await getAnalysis(id);
    if (!current) return null;
    const updated = change(current);
    const next = await updateLibrary(AsyncStorage, uid, items => [updated, ...items.filter(item => item.id !== id)]);
    publish(next); await syncOne(updated); return updated;
  }, [uid, getAnalysis, publish, syncOne]);

  const updateAnalysisMetadata = useCallback((id: string, metadata: Pick<ArticleAnalysis, 'collection' | 'tags' | 'notes'>) => changeAnalysis(id, a => ({ ...a, ...metadata })), [changeAnalysis]);
  const addJudgmentFeedback = useCallback((id: string, input: Omit<JudgmentFeedback, 'id' | 'createdAt' | 'analysisVersion'>) => changeAnalysis(id, a => ({
    ...a, feedback: [...(a.feedback ?? []), { ...input, id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, createdAt: new Date().toISOString(), analysisVersion: a.analysisVersion }].slice(-200),
  })), [changeAnalysis]);

  const removeFromHistory = useCallback(async (id: string) => {
    const db = getDB();
    // Cloud-first deletion cannot claim success while a remote copy remains.
    if (uid && db) { const ref = doc(db, 'users', uid, 'analyses', id); await deleteDoc(ref); if ((await getDoc(ref)).exists()) throw new Error('Cloud deletion could not be verified.'); }
    const next = await updateLibrary(AsyncStorage, uid, items => items.filter(item => item.id !== id));
    await clearCurrentAnalysis(id); publish(next);
  }, [uid, publish]);
  const clearHistory = useCallback(async () => {
    const db = getDB();
    if (uid && db) {
      const col = collection(db, 'users', uid, 'analyses');
      const snapshot = await getDocs(col);
      for (let i = 0; i < snapshot.docs.length; i += 400) {
        const batch = writeBatch(db); snapshot.docs.slice(i, i + 400).forEach(item => batch.delete(item.ref)); await batch.commit();
      }
      if (!(await getDocs(col)).empty) throw new Error('Cloud deletion could not be verified.');
    }
    await updateLibrary(AsyncStorage, uid, () => []); await clearCurrentAnalysis(); publish([]);
  }, [uid, publish]);
  const importGuestHistory = useCallback(async () => {
    if (!uid) return;
    const guests = await readLibrary(AsyncStorage);
    const next = await updateLibrary(AsyncStorage, uid, items => [...items, ...guests.filter(item => !items.some(existing => existing.id === item.id))]);
    publish(next);
    for (const item of next) await syncOne(item);
  }, [uid, publish, syncOne]);
  const syncHistory = useCallback(async () => { for (const item of await readLibrary(AsyncStorage, uid)) await syncOne(item); }, [uid, syncOne]);
  return { analyses, history, saveToHistory, getAnalysis, updateAnalysisMetadata, addJudgmentFeedback, removeFromHistory, clearHistory, importGuestHistory, syncHistory, loaded: state.owner === owner && state.loaded, storageMessage: state.owner === owner ? state.message : '' };
}
