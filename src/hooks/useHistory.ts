import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { HistoryEntry, ArticleAnalysis } from '../types';

const HISTORY_KEY = '@medlit:history';
const MAX_HISTORY = 50;

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(HISTORY_KEY).then((raw) => {
      if (raw) {
        try {
          setHistory(JSON.parse(raw));
        } catch { /* ignore */ }
      }
      setLoaded(true);
    });
  }, []);

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
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeFromHistory = useCallback(async (id: string) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.id !== id);
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(async () => {
    setHistory([]);
    await AsyncStorage.removeItem(HISTORY_KEY);
  }, []);

  return { history, saveToHistory, removeFromHistory, clearHistory, loaded };
}
