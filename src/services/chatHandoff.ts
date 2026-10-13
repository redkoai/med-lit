import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisPrompt } from '../constants/prompts';
import { buildArticleText } from './aiAnalyzer';
import { buildAnalysisFromModel } from './analysisValidation';
import type { ArticleIdentifier, RawArticleData } from '../types';

export interface ChatPacket { id: string; article: RawArticleData; identifier: ArticleIdentifier; prompt: string }
export const MAX_HANDOFF_RESPONSE = 150000;

export function createChatPacket(article: RawArticleData, identifier: ArticleIdentifier): ChatPacket {
  if (article.fetchSource === 'metadata_only' || !(article.abstract.trim() || article.fullText?.trim())) {
    throw new Error('Only metadata was retrieved. An abstract or full-text extract is needed before preparing a substantive appraisal. Try an open-access or PubMed source.');
  }
  const id = `medlit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const truncated = (article.fullText?.length ?? 0) > 60000;
  const source: RawArticleData = {
    ...article,
    fullText: article.fullText?.slice(0, 60000),
    retrievalWarnings: [...(article.retrievalWarnings ?? []), ...(truncated ? ['The external-chat packet contains only the first 60,000 full-text characters. Check the original for omitted material.'] : [])],
  };
  const prompt = `${ANALYSIS_SYSTEM_PROMPT}\n\n${buildAnalysisPrompt(buildArticleText(source), source.fetchSource === 'full_text')}\n\nAdd a top-level "medlitPacketId" field with the exact value "${id}". This identifies which source packet this response belongs to. Return the entire JSON object so I can paste it back into MedLit. Do not browse or use other sources.`;
  return { id, article: source, identifier, prompt };
}

export function importChatResponse(input: string, packet: ChatPacket) {
  if (input.length > MAX_HANDOFF_RESPONSE) throw new Error('That response is too large. Paste the JSON appraisal only (up to 150,000 characters).');
  const raw = input.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  let parsed: unknown;
  try { parsed = JSON.parse(raw); } catch { throw new Error('Paste the complete JSON response, starting with { and ending with }. Ask ChatGPT to return the full object if it was cut off.'); }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || (parsed as Record<string, unknown>).medlitPacketId !== packet.id) {
    throw new Error('This response does not match the current source packet. Copy the current packet into ChatGPT and paste its complete response here.');
  }
  const analysis = buildAnalysisFromModel(parsed, packet.article, packet.identifier, 'manual/external-chat-model-unverified');
  analysis.limitations = [...analysis.limitations, 'Imported from an external chat. MedLit cannot verify the model or conversation; passage matching confirms text presence, not whether a judgment is scientifically correct.'];
  return analysis;
}
