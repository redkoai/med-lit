import type { SourceCoverageLevel } from '../types';
/** The v4.1 heuristic. Shared by validation and explanation; not a truth probability. */
export function appraisalScore(level: SourceCoverageLevel, evidence: { verified: boolean }[], judgments: { judgment: string }[]) {
  const coverage = level === 'full_text' ? 1 : level === 'abstract_only' ? 0.45 : 0.1;
  const matched = evidence.filter(item => item.verified).length;
  const assessable = judgments.filter(item => item.judgment !== 'unclear' && item.judgment !== 'not_applicable').length;
  const quotation = evidence.length ? matched / evidence.length : 0;
  const assessment = judgments.length ? assessable / judgments.length : 0;
  const raw = Math.max(1, Math.min(10, Math.round(1 + 4 * coverage + 3 * quotation + 2 * assessment)));
  return { score: matched && assessable ? raw : Math.min(3, raw), coverage, quotation, assessment, matched, assessable, capped: !matched || !assessable };
}
