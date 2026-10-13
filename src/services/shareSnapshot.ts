import type { ArticleAnalysis, AppraisalJudgmentValue, OverallVerdict, PicoExtraction, SourceCoverageLevel } from '../types';

export interface SharedJudgment {
  domain: string;
  question: string;
  judgment: AppraisalJudgmentValue;
  rationale: string;
  quote?: string;
  location?: string;
}

export interface SharedAnalysisSnapshot {
  schema: 'medlit-share-v1';
  title: string;
  journal: string;
  year: number | null;
  doi?: string;
  analyzedAt: string;
  analysisVersion: string;
  analysisModel: string;
  studyDesign: string;
  confidence: OverallVerdict['confidence'];
  coverage: SourceCoverageLevel;
  risk: string;
  keyTakeaway: string;
  caveats: string[];
  pico?: PicoExtraction;
  judgments: SharedJudgment[];
}

function truncate(value: string, max: number): string {
  return value.trim().slice(0, max);
}

export function createSharedSnapshot(analysis: ArticleAnalysis): SharedAnalysisSnapshot {
  const evidence = new Map(analysis.appraisal.evidence.filter((item) => item.verified).map((item) => [item.id, item]));
  return {
    schema: 'medlit-share-v1',
    title: truncate(analysis.article.title, 300),
    journal: truncate(analysis.article.journal, 180),
    year: analysis.article.year,
    doi: analysis.article.doi ? truncate(analysis.article.doi, 160) : undefined,
    analyzedAt: analysis.analyzedAt,
    analysisVersion: analysis.analysisVersion,
    analysisModel: truncate(analysis.analysisModel, 100),
    studyDesign: analysis.studyDesign.type,
    confidence: analysis.verdict.confidence,
    coverage: analysis.appraisal.sourceCoverage.level,
    risk: analysis.riskOfBias.overallRisk,
    keyTakeaway: truncate(analysis.verdict.keyTakeaway, 900),
    caveats: analysis.verdict.caveats.slice(0, 4).map((value) => truncate(value, 260)),
    pico: analysis.pico,
    judgments: analysis.appraisal.judgments.slice(0, 10).map((judgment) => {
      const linked = judgment.evidenceIds.flatMap((id) => evidence.get(id) ?? [])[0];
      return {
        domain: truncate(judgment.domain, 120),
        question: truncate(judgment.question, 240),
        judgment: judgment.judgment,
        rationale: truncate(judgment.rationale, 280),
        quote: linked ? truncate(linked.quote, 220) : undefined,
        location: linked?.location ?? linked?.section,
      };
    }),
  };
}

function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - value.length % 4) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeSharedSnapshot(analysis: ArticleAnalysis): string {
  return toBase64Url(JSON.stringify(createSharedSnapshot(analysis)));
}

export function decodeSharedSnapshot(encoded: string): SharedAnalysisSnapshot | null {
  try {
    if (!encoded || encoded.length > 24_000) return null;
    const parsed = JSON.parse(fromBase64Url(encoded)) as Partial<SharedAnalysisSnapshot>;
    if (parsed.schema !== 'medlit-share-v1' || typeof parsed.title !== 'string' || !Array.isArray(parsed.judgments)) return null;
    return parsed as SharedAnalysisSnapshot;
  } catch {
    return null;
  }
}
