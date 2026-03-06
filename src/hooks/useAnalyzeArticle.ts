import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { parseArticleUrl, hasValidIdentifier, formatIdentifierLabel } from '../services/urlParser';
import { fetchArticle } from '../services/articleFetcher';
import { analyzeArticle } from '../services/aiAnalyzer';
import type { FetchState, ArticleAnalysis, AppSettings } from '../types';

function getActiveApiKey(settings: AppSettings): string {
  switch (settings.aiProvider) {
    case 'openai': return settings.openAiApiKey;
    case 'gemini': return settings.geminiApiKey;
    default:       return settings.claudeApiKey;
  }
}

function getActiveModel(settings: AppSettings): string {
  switch (settings.aiProvider) {
    case 'openai': return settings.openAiModel;
    case 'gemini': return settings.geminiModel;
    default:       return settings.claudeModel;
  }
}

export interface UseAnalyzeArticleParams {
  url: string;
  settings: AppSettings;
  saveToHistory: (analysis: ArticleAnalysis) => Promise<void>;
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

  const updateState = useCallback(
    (status: FetchState['status'], message: string, progress: number) => {
      setFetchState({ status, message, progress });
    },
    []
  );

  const handleAnalyze = useCallback(async () => {
    if (!url.trim()) {
      Alert.alert('No URL', 'Please paste an article URL.');
      return;
    }

    const activeKey = getActiveApiKey(settings);
    if (!activeKey) {
      onApiKeyMissing?.();
      return;
    }

    try {
      updateState('parsing_url', 'Parsing article URL...', 10);
      const identifier = parseArticleUrl(url.trim());

      if (!hasValidIdentifier(identifier)) {
        if (!url.startsWith('http')) {
          Alert.alert(
            'Could not parse URL',
            'Could not extract a PubMed ID, DOI, or recognizable identifier from this URL. Please check the link.'
          );
          setFetchState({ status: 'idle', message: '', progress: 0 });
          return;
        }
      }

      updateState(
        'fetching_article',
        `Fetching article data (${formatIdentifierLabel(identifier)})...`,
        30
      );

      const article = await fetchArticle(identifier, {
        unpaywallEmail: settings.unpaywallEmail,
        sciHubEnabled: settings.sciHubEnabled,
        sciHubMirror: settings.sciHubMirror,
        onProgress: (msg) => updateState('fetching_article', msg, 50),
      });

      const providerLabel = { claude: 'Claude', openai: 'ChatGPT', gemini: 'Gemini' }[settings.aiProvider] ?? 'AI';
      updateState('analyzing', `Analyzing with ${providerLabel}...`, 65);

      const analysis = await analyzeArticle(
        article,
        identifier,
        settings.aiProvider,
        activeKey,
        getActiveModel(settings),
        (msg) => updateState('analyzing', msg, 80)
      );

      updateState('done', 'Analysis complete!', 100);

      if (settings.saveHistory) {
        await saveToHistory(analysis);
      }

      (global as { __medlit_analysis?: ArticleAnalysis }).__medlit_analysis =
        analysis;

      setTimeout(() => {
        router.push({
          pathname: '/analysis',
          params: { id: analysis.id },
        });
        setFetchState({ status: 'idle', message: '', progress: 0 });
      }, 600);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setFetchState({
        status: 'error',
        message: msg,
        progress: 0,
        error: msg,
      });
    }
  }, [url, settings, saveToHistory, updateState, onApiKeyMissing]);

  const isLoading =
    fetchState.status !== 'idle' && fetchState.status !== 'error';

  return { handleAnalyze, fetchState, isLoading };
}
