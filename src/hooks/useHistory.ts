import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  limit,
  writeBatch,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { getDB } from '../services/firebase';
import type { HistoryEntry, ArticleAnalysis } from '../types';

const HISTORY_KEY = '@medlit:history';
const MIGRATED_KEY = '@medlit:history_migrated';
const MAX_HISTORY = 50;

function getHistoryCollection(uid: string) {
  const db = getDB();
  if (!db) return null;
  return collection(db, 'users', uid, 'history');
}

export function useHistory(uid?: string | null) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load from Firestore if authenticated, otherwise AsyncStorage
  useEffect(() => {
    if (uid) {
      const col = getHistoryCollection(uid);
      if (col) {
        const q = query(col, orderBy('analyzedAt', 'desc'), limit(MAX_HISTORY));
        getDocs(q)
          .then((snapshot) => {
            const entries = snapshot.docs.map((d) => d.data() as HistoryEntry);
            setHistory(entries);
            setLoaded(true);
          })
          .catch(() => {
            // Fall back to local
            loadLocal().then(() => setLoaded(true));
          });

        // Migrate local data on first sign-in
        migrateLocalToFirestore(uid);
        return;
      }
    }

    loadLocal().then(() => setLoaded(true));
  }, [uid]);

  const loadLocal = async () => {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (raw) {
      try {
        setHistory(JSON.parse(raw));
      } catch { /* ignore */ }
    }
  };

  const migrateLocalToFirestore = async (userId: string) => {
    try {
      const migrated = await AsyncStorage.getItem(MIGRATED_KEY);
      if (migrated) return;

      const raw = await AsyncStorage.getItem(HISTORY_KEY);
      if (!raw) {
        await AsyncStorage.setItem(MIGRATED_KEY, 'true');
        return;
      }

      const localEntries: HistoryEntry[] = JSON.parse(raw);
      if (localEntries.length === 0) {
        await AsyncStorage.setItem(MIGRATED_KEY, 'true');
        return;
      }

      const db = getDB();
      if (!db) return;

      const batch = writeBatch(db);
      for (const entry of localEntries) {
        const ref = doc(db, 'users', userId, 'history', entry.id);
        batch.set(ref, entry, { merge: true });
      }
      await batch.commit();
      await AsyncStorage.setItem(MIGRATED_KEY, 'true');
    } catch {
      // Silent fail — will retry next time
    }
  };

  const saveToHistory = useCallback(async (analysis: ArticleAnalysis) => {
    const entry: HistoryEntry = {
      id: analysis.id,
      title: analysis.article.title,
      journal: analysis.article.journal,
      year: analysis.article.year,
      url: analysis.identifier.originalUrl,
      analyzedAt: analysis.analyzedAt,
      accuracyScore: analysis.accuracyScore.score,
      biasScore: analysis.biasScore.score,
      studyDesign: analysis.studyDesign.type,
      trustworthy: analysis.verdict.trustworthy,
    };

    setHistory((prev) => {
      const filtered = prev.filter((h) => h.id !== entry.id);
      const next = [entry, ...filtered].slice(0, MAX_HISTORY);
      // Always save to AsyncStorage as cache
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });

    // Also save to Firestore if authenticated
    if (uid) {
      const db = getDB();
      const col = getHistoryCollection(uid);
      if (col && db) {
        try {
          await setDoc(doc(col, entry.id), entry);
          // Update user usage stats
          const userRef = doc(db, 'users', uid);
          await setDoc(userRef, {
            totalAnalyses: increment(1),
            lastAnalysisAt: serverTimestamp(),
            lastActiveAt: serverTimestamp(),
          }, { merge: true });
        } catch { /* silent */ }
      }
    }
  }, [uid]);

  const removeFromHistory = useCallback(async (id: string) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.id !== id);
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });

    if (uid) {
      const col = getHistoryCollection(uid);
      if (col) {
        try {
          await deleteDoc(doc(col, id));
        } catch { /* silent */ }
      }
    }
  }, [uid]);

  const clearHistory = useCallback(async () => {
    setHistory([]);
    await AsyncStorage.removeItem(HISTORY_KEY);

    if (uid) {
      const col = getHistoryCollection(uid);
      if (col) {
        try {
          const snapshot = await getDocs(col);
          const db = getDB();
          if (db) {
            const batch = writeBatch(db);
            snapshot.docs.forEach((d) => batch.delete(d.ref));
            await batch.commit();
          }
        } catch { /* silent */ }
      }
    }
  }, [uid]);

  return { history, saveToHistory, removeFromHistory, clearHistory, loaded };
}
