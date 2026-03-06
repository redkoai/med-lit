import type { RawArticleData, ArticleAnalysis, ArticleIdentifier, AIProvider } from '../types';
import {
  ANALYSIS_SYSTEM_PROMPT,
  buildAnalysisPrompt,
  EXTRACTION_SYSTEM_PROMPT,
  buildExtractionPrompt,
} from '../constants/prompts';

// ─── Provider-specific callers ────────────────────────────────────────────────

async function callClaude(
  apiKey: string,
  model: string,
  system: string,
  userMessage: string,
  maxTokens: number,
  temperature: number,
): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      system,
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Claude API error (${res.status}): ${body}`);
  }

  const data = await res.json();
  return (data.content as Array<{ type: string; text?: string }>)
    .filter((b) => b.type === 'text')
    .map((b) => b.text || '')
    .join('');
}

async function callOpenAI(
  apiKey: string,
  model: string,
  system: string,
  userMessage: string,
  maxTokens: number,
  temperature: number,
): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? '';
}

async function callGemini(
  apiKey: string,
  model: string,
  system: string,
  userMessage: string,
  maxTokens: number,
  temperature: number,
): Promise<string> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ parts: [{ text: userMessage }] }],
        generationConfig: { maxOutputTokens: maxTokens, temperature },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${body}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

// ─── Unified caller ───────────────────────────────────────────────────────────

async function callAI(
  provider: AIProvider,
  apiKey: string,
  model: string,
  system: string,
  userMessage: string,
  maxTokens: number,
  temperature: number,
): Promise<string> {
  switch (provider) {
    case 'openai':
      return callOpenAI(apiKey, model, system, userMessage, maxTokens, temperature);
    case 'gemini':
      return callGemini(apiKey, model, system, userMessage, maxTokens, temperature);
    default:
      return callClaude(apiKey, model, system, userMessage, maxTokens, temperature);
  }
}

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
  provider: AIProvider,
  apiKey: string,
  model: string,
  onProgress?: (message: string) => void
): Promise<ArticleAnalysis> {
  const progress = onProgress || (() => {});
  const providerLabel = { claude: 'Claude', openai: 'ChatGPT', gemini: 'Gemini' }[provider] ?? 'AI';

  const articleText = buildArticleText(article);
  const isFullText = article.fetchSource === 'full_text';

  progress(`Sending article to ${providerLabel} for analysis...`);

  const analysisPrompt = buildAnalysisPrompt(articleText, isFullText);
  const responseText = await callAI(provider, apiKey, model, ANALYSIS_SYSTEM_PROMPT, analysisPrompt, 4096, 0.2);

  let jsonStr = responseText.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) jsonStr = jsonMatch[1].trim();

  let parsed: Omit<ArticleAnalysis, 'id' | 'analyzedAt' | 'article' | 'identifier' | 'analysisModel' | 'analysisVersion'>;
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
    analysisModel: `${provider}/${model}`,
    analysisVersion: '2.0',
  };
}

// ─── Quick Metadata Extraction ────────────────────────────────────────────────

export async function extractMetadataFromRawHtml(
  rawHtml: string,
  provider: AIProvider,
  apiKey: string,
  model: string
): Promise<Partial<RawArticleData>> {
  const responseText = await callAI(
    provider, apiKey, model,
    EXTRACTION_SYSTEM_PROMPT,
    buildExtractionPrompt(rawHtml),
    1024, 0
  );

  try {
    const jsonStr = responseText.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    return JSON.parse(jsonStr);
  } catch {
    return {};
  }
}
