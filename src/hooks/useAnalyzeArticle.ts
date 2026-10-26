import { useState, useCallback, useRef } from 'react';
import { router } from 'expo-router';
import { providerFailureReason } from '../services/providerTransport';
import { captureEvent } from '../services/productAnalytics';
import { cacheCurrentAnalysis, getIdentityRevision } from '../services/currentAnalysis';
import type { FetchState, ArticleAnalysis, AppSettings } from '../types';
import { activeApiKey, runAnalysisPipeline } from '../services/analysisPipeline';

export interface UseAnalyzeArticleParams {
  url: string;
  settings: AppSettings;
  saveToHistory: (analysis: ArticleAnalysis) => Promise<ArticleAnalysis>;
  onApiKeyMissing?: () => void;
}

/**
 * Single responsibility: orchestrate parse → fetch → analyze → save → navigate.
 * Depends on abstractions (services); navigation callback keeps UI dependency out (Dependency Inversion).
 */
export function useAnalyzeArticle({
  url,
  settings,
  saveToHistory,
  onApiKeyMissing,
}: UseAnalyzeArticleParams) {
  const [fetchState, setFetchState] = useState<FetchState>({
    status: 'idle',
    message: '',
    progress: 0,
  });
  const inFlight = useRef(false);

  const updateState = useCallback(
    (status: FetchState['status'], message: string, progress: number) => {
      setFetchState({ status, message, progress });
    },
    []
  );

  const handleAnalyze = useCallback(async () => {
    if (!url.trim()) {
      setFetchState({ status: 'error', message: 'Add a paper first.', error: 'Paste a PubMed link, DOI, or supported article URL to start.', progress: 0 });
      return;
    }
    if (inFlight.current) return;

    const activeKey = activeApiKey(settings);
    const identityRevision = getIdentityRevision();
    if (!activeKey) {
      onApiKeyMissing?.();
      return;
    }

    try {
      inFlight.current = true;
      void captureEvent('appraisal_started', { provider: settings.aiProvider });
      updateState('parsing_url', 'Parsing article URL...', 10);
      const analysis = await runAnalysisPipeline(url, settings, (message, progress) => {
        updateState(progress < 60 ? 'fetching_article' : 'analyzing', message, progress);
      });
      if (identityRevision !== getIdentityRevision()) throw new Error('The signed-in account changed during analysis. Please return to the original account before continuing.');

      void captureEvent('appraisal_completed', { provider: settings.aiProvider, coverage: analysis.appraisal.sourceCoverage.level });
      updateState('done', 'Analysis complete!', 100);

      await cacheCurrentAnalysis(analysis);
      let persisted = analysis;
      let saveWarning = '';
      try { if (settings.saveHistory) persisted = await saveToHistory(analysis); }
      catch { saveWarning = 'History could not be saved. Export this report before leaving or refreshing.'; }
      await cacheCurrentAnalysis(persisted);

      setTimeout(() => {
        router.push({
          pathname: '/analysis',
          params: { id: persisted.id, ...(saveWarning ? { saveWarning } : {}) },
        });
        setFetchState({ status: 'idle', message: '', progress: 0 });
      }, 600);
    } catch (error) {
      void captureEvent('appraisal_failed', { provider: settings.aiProvider, reason: providerFailureReason(error) });
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setFetchState({
        status: 'error',
        message: msg,
        progress: 0,
        error: msg,
      });
    } finally {
      inFlight.current = false;
    }
  }, [url, settings, saveToHistory, updateState, onApiKeyMissing]);

  const isLoading =
    fetchState.status !== 'idle' && fetchState.status !== 'error';

  return { handleAnalyze, fetchState, isLoading };
}
