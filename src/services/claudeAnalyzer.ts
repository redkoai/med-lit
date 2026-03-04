import Anthropic from '@anthropic-ai/sdk';
import type { RawArticleData, ArticleAnalysis, ArticleIdentifier } from '../types';
import {
  ANALYSIS_SYSTEM_PROMPT,
  buildAnalysisPrompt,
  EXTRACTION_SYSTEM_PROMPT,
  buildExtractionPrompt,
} from '../constants/prompts';

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildArticleText(article: RawArticleData): string {
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
    parts.push('\n--- FULL TEXT (truncated to 30,000 chars) ---');
    parts.push(article.fullText.slice(0, 30000));
  }

  if (article.references?.length) {
    parts.push('\n--- REFERENCES (first 50) ---');
    parts.push(article.references.slice(0, 50).join('\n'));
  }

  return parts.join('\n');
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Main Analyzer ────────────────────────────────────────────────────────────

export async function analyzeArticle(
  article: RawArticleData,
  identifier: ArticleIdentifier,
  apiKey: string,
  model: string,
  onProgress?: (message: string) => void
): Promise<ArticleAnalysis> {
  const progress = onProgress || (() => {});

  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const articleText = buildArticleText(article);
  const isFullText = article.fetchSource === 'full_text';

  progress('Sending article to Claude for analysis...');

  const analysisPrompt = buildAnalysisPrompt(articleText, isFullText);

  const message = await client.messages.create({
    model,
    max_tokens: 4096,
    temperature: 0.2,
    system: ANALYSIS_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: analysisPrompt,
      },
    ],
  });

  const responseText = message.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as { type: 'text'; text: string }).text)
    .join('');

  // Extract JSON from response (handle potential markdown code blocks)
  let jsonStr = responseText.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  let parsed: Omit<ArticleAnalysis, 'id' | 'analyzedAt' | 'article' | 'identifier' | 'analysisModel' | 'analysisVersion'>;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    // Try to find a JSON object in the response
    const jsonObjectMatch = jsonStr.match(/\{[\s\S]+\}/);
    if (!jsonObjectMatch) {
      throw new Error('Claude returned an invalid response. Please try again.');
    }
    try {
      parsed = JSON.parse(jsonObjectMatch[0]);
    } catch {
      throw new Error('Failed to parse analysis response. Please try again.');
    }
  }

  progress('Analysis complete!');

  return {
    id: generateId(),
    analyzedAt: new Date().toISOString(),
    article,
    identifier,
    studyDesign: parsed.studyDesign,
    summary: parsed.summary,
    accuracyScore: parsed.accuracyScore,
    biasScore: parsed.biasScore,
    methodsScore: parsed.methodsScore,
    referenceCheck: parsed.referenceCheck,
    conflictOfInterest: parsed.conflictOfInterest,
    limitations: parsed.limitations,
    verdict: parsed.verdict,
    analysisModel: model,
    analysisVersion: '1.0',
  };
}

// ─── Quick Metadata Extraction (if article data is sparse) ───────────────────

export async function extractMetadataFromRawHtml(
  rawHtml: string,
  apiKey: string,
  model: string
): Promise<Partial<RawArticleData>> {
  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  const message = await client.messages.create({
    model,
    max_tokens: 1024,
    temperature: 0,
    system: EXTRACTION_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: buildExtractionPrompt(rawHtml),
      },
    ],
  });

  const responseText = message.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as { type: 'text'; text: string }).text)
    .join('');

  try {
    const jsonStr = responseText.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(jsonStr);
  } catch {
    return {};
  }
}
