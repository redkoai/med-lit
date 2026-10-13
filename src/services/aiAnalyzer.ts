import type { RawArticleData, ArticleAnalysis, ArticleIdentifier, AIProvider } from '../types';
import {
  ANALYSIS_SYSTEM_PROMPT,
  buildAnalysisPrompt,
  EXTRACTION_SYSTEM_PROMPT,
  buildExtractionPrompt,
} from '../constants/prompts';
import { buildAnalysisFromModel } from './analysisValidation';

import { callProvider } from './providerTransport';

// ─── Helper ───────────────────────────────────────────────────────────────────

export function buildArticleText(article: RawArticleData): string {
  const parts: string[] = [];

  parts.push(`TITLE: ${article.title}`);
  parts.push(`AUTHORS: ${article.authors.join(', ')}`);
  parts.push(`JOURNAL: ${article.journal}`);
  if (article.year) parts.push(`YEAR: ${article.year}`);
  if (article.doi) parts.push(`DOI: ${article.doi}`);
  if (article.pmid) parts.push(`PMID: ${article.pmid}`);
  if (article.volume) parts.push(`VOLUME/ISSUE: ${article.volume}(${article.issue}), pp. ${article.pages}`);
  if (article.keywords?.length) parts.push(`KEYWORDS: ${article.keywords.join(', ')}`);
  if (article.isPreprint) parts.push('NOTE: THIS IS A PREPRINT — NOT YET PEER REVIEWED');

  parts.push('\n--- ABSTRACT ---');
  parts.push(article.abstract);

  if (article.fullText) {
    parts.push('\n--- FULL TEXT (up to 80,000 characters) ---');
    parts.push(article.fullText.slice(0, 80000));
  }

  if (article.references?.length) {
    parts.push('\n--- REFERENCES (first 100) ---');
    parts.push(article.references.slice(0, 100).map((reference) => reference.raw).join('\n'));
  }

  return parts.join('\n');
}

// ─── Main Analyzer ────────────────────────────────────────────────────────────

export async function analyzeArticle(
  article: RawArticleData,
  identifier: ArticleIdentifier,
  provider: AIProvider,
  apiKey: string,
  model: string,
  onProgress?: (message: string) => void
): Promise<ArticleAnalysis> {
  const progress = onProgress || (() => {});
  const providerLabel = { claude: 'Claude', openai: 'OpenAI', gemini: 'Gemini', openrouter: 'OpenRouter' }[provider] ?? 'AI';

  const articleText = buildArticleText(article);
  const isFullText = article.fetchSource === 'full_text';

  progress(`Sending article to ${providerLabel} for analysis...`);

  const analysisPrompt = buildAnalysisPrompt(articleText, isFullText);
  const responseText = await callProvider(provider, apiKey, model, ANALYSIS_SYSTEM_PROMPT, analysisPrompt, 16000);

  let jsonStr = responseText.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) jsonStr = jsonMatch[1].trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    const jsonObjectMatch = jsonStr.match(/\{[\s\S]+\}/);
    if (!jsonObjectMatch) {
      throw new Error(`${providerLabel} returned an invalid response. Please try again.`);
    }
    try {
      parsed = JSON.parse(jsonObjectMatch[0]);
    } catch {
      throw new Error('Failed to parse analysis response. Please try again.');
    }
  }

  const analysis = buildAnalysisFromModel(parsed, article, identifier, `${provider}/${model}`);
  progress('Evidence passages verified and appraisal complete.');
  return analysis;
}

// ─── Quick Metadata Extraction ────────────────────────────────────────────────

export async function extractMetadataFromRawHtml(
  rawHtml: string,
  provider: AIProvider,
  apiKey: string,
  model: string
): Promise<Partial<RawArticleData>> {
  const responseText = await callProvider(
    provider, apiKey, model,
    EXTRACTION_SYSTEM_PROMPT,
    buildExtractionPrompt(rawHtml),
    2048
  );

  try {
    const jsonStr = responseText.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(jsonStr);
  } catch {
    return {};
  }
}
