import type { AppSettings, ArticleAnalysis } from '../types';
import { analyzeArticle } from './aiAnalyzer';
import { fetchArticle } from './articleFetcher';
import { formatIdentifierLabel, hasValidIdentifier, parseArticleUrl } from './urlParser';

export function activeApiKey(settings: AppSettings): string {
  if (settings.aiProvider === 'openai') return settings.openAiApiKey;
  if (settings.aiProvider === 'gemini') return settings.geminiApiKey;
  if (settings.aiProvider === 'openrouter') return settings.openRouterApiKey;
  return settings.claudeApiKey;
}

export function activeModel(settings: AppSettings): string {
  if (settings.aiProvider === 'openai') return settings.openAiModel;
  if (settings.aiProvider === 'gemini') return settings.geminiModel;
  if (settings.aiProvider === 'openrouter') return settings.openRouterModel;
  return settings.claudeModel;
}

export async function runAnalysisPipeline(
  targetUrl: string,
  settings: AppSettings,
  onProgress?: (message: string, progress: number) => void,
): Promise<ArticleAnalysis> {
  const identifier = parseArticleUrl(targetUrl.trim());
  if (!hasValidIdentifier(identifier)) {
    throw new Error('A supported PubMed, PMC, DOI, preprint, arXiv, or journal identifier is required.');
  }
  onProgress?.(`Fetching article data (${formatIdentifierLabel(identifier)})…`, 30);
  const article = await fetchArticle(identifier, {
    unpaywallEmail: settings.unpaywallEmail,
    onProgress: (message) => onProgress?.(message, 50),
  });
  const providerLabel = { claude: 'Claude', openai: 'OpenAI', gemini: 'Gemini', openrouter: 'OpenRouter' }[settings.aiProvider];
  onProgress?.(`Appraising with ${providerLabel}…`, 65);
  return analyzeArticle(
    article,
    identifier,
    settings.aiProvider,
    activeApiKey(settings),
    activeModel(settings),
    (message) => onProgress?.(message, 85),
  );
}
