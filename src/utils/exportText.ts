import type { ArticleAnalysis, AssessmentAnswer } from '../types';

const answerLabel = (value: AssessmentAnswer) => value.replace('_', ' ').toUpperCase();

/** Generate a plain-text version of the evidence-linked appraisal. */
export function generateTextReport(analysis: ArticleAnalysis): string {
  const { article, appraisal } = analysis;
  const coverage = appraisal.sourceCoverage;
  const evidenceById = new Map(appraisal.evidence.map((item) => [item.id, item]));
  const lines: string[] = [
    'MEDLIT EVIDENCE APPRAISAL REPORT',
    'AI-assisted decision support; not peer review or medical advice.',
    '',
    'ARTICLE',
    `Title: ${article.title}`,
    `Authors: ${article.authors.join(', ') || 'Not reported'}`,
    `Journal: ${article.journal || 'Not reported'}`,
    `Year: ${article.year ?? 'Not reported'}`,
  ];
  if (article.doi) lines.push(`DOI: ${article.doi}`);
  if (article.pmid) lines.push(`PMID: ${article.pmid}`);
  lines.push(`Analyzed: ${new Date(analysis.analyzedAt).toISOString()}`);
  lines.push(`Revision: ${analysis.revision}; analysis contract: ${analysis.analysisVersion}`);

  lines.push('', 'SOURCE COVERAGE');
  lines.push(`Coverage: ${coverage.level.replace('_', ' ')}`);
  lines.push(`Text analyzed: ${coverage.analyzedCharacters} of ${coverage.availableCharacters} characters${coverage.wasTruncated ? ' (truncated)' : ''}`);
  lines.push(`Available sections: ${coverage.availableSections.join(', ') || 'Not identified'}`);
  lines.push(`Missing/unidentified sections: ${coverage.missingSections.join(', ') || 'None identified'}`);
  lines.push(`References: ${coverage.referenceCount}; identifiers: ${coverage.referencesWithIdentifiers}; resolved: ${coverage.referencesResolved}`);
  if (coverage.pdfPages) lines.push(`PDF pages extracted: ${coverage.pdfPages}`);
  if (typeof coverage.extractedTableCount === 'number') lines.push(`Table structures or PDF row candidates detected: ${coverage.extractedTableCount}; verify against the source`);
  if (coverage.supplementLinks?.length) lines.push(`Supplement links detected: ${coverage.supplementLinks.length}; separate review required`);
  coverage.retrievalWarnings.forEach((warning) => lines.push(`Retrieval warning: ${warning}`));

  lines.push('', 'APPRAISAL OVERVIEW');
  lines.push(`Appraisal confidence: ${analysis.verdict.confidence}`);
  lines.push(`Risk-of-bias concern: ${analysis.riskOfBias.overallRisk.replace('_', ' ')}`);
  lines.push(`Applicability: ${analysis.verdict.applicability.replace('_', ' ')} (not a clinical applicability decision)`);
  lines.push(`Reading priority: ${analysis.verdict.readingPriority}`);
  lines.push(`Framework: ${analysis.studyDesign.appraisalFramework}`);
  lines.push(analysis.verdict.overallSummary);
  lines.push(`Key takeaway: ${analysis.verdict.keyTakeaway}`);

  lines.push('', 'STUDY DESIGN');
  lines.push(`Type: ${analysis.studyDesign.type}`);
  lines.push(`Rationale: ${analysis.studyDesign.designRationale}`);
  lines.push(`Preregistration reported: ${analysis.studyDesign.isPreregistered.toUpperCase()}${analysis.studyDesign.registrationId ? ` (${analysis.studyDesign.registrationId})` : ''}`);

  lines.push('', 'PLAIN-LANGUAGE SUMMARY');
  lines.push(analysis.summary.oneLiner);
  lines.push('What the authors did:');
  analysis.summary.whatTheyDid.forEach((item) => lines.push(`- ${item}`));
  lines.push('What the authors reported:');
  analysis.summary.whatTheyFound.forEach((item) => lines.push(`- ${item}`));
  lines.push(`Why it may matter: ${analysis.summary.whyItMatters}`);
  lines.push(`Who may care: ${analysis.summary.whoShouldCare}`);
  lines.push(`Bottom line: ${analysis.summary.bottomLine}`);

  if (analysis.pico) {
    lines.push('', 'PICO EXTRACTION');
    Object.entries(analysis.pico).forEach(([label, element]) => {
      lines.push(`${label.toUpperCase()} [${element.status.replace(/_/g, ' ')}]: ${element.value}${element.evidenceIds.length ? ` (${element.evidenceIds.length} linked passage(s))` : ''}`);
    });
  }

  lines.push('', 'EVIDENCE-LINKED DOMAIN JUDGMENTS');
  lines.push(`Rubric: ${appraisal.rubricId} v${appraisal.rubricVersion}`);
  appraisal.judgments.forEach((judgment) => {
    lines.push('', `${judgment.domain.toUpperCase()} — ${judgment.judgment.replace('_', ' ').toUpperCase()}`);
    lines.push(`Question: ${judgment.question}`);
    lines.push(`Rationale: ${judgment.rationale}`);
    const citations = judgment.evidenceIds.map((id) => evidenceById.get(id)).filter(Boolean);
    if (citations.length === 0) lines.push('Evidence: no verified supporting passage; unable to assess.');
    citations.forEach((item) => lines.push(`Evidence${item?.location || item?.section ? ` (${item.location ?? item.section})` : ''}: “${item?.quote}” [${item?.verified ? 'matched' : 'not matched'}]`));
  });

  lines.push('', 'METHODS REPORTING');
  lines.push(`Sample size adequacy: ${answerLabel(analysis.methodsScore.sampleSizeAdequate)} — ${analysis.methodsScore.sampleSizeExplanation}`);
  lines.push(`Power calculation: ${answerLabel(analysis.methodsScore.hasPowerCalculation)}`);
  lines.push(`Blinding: ${answerLabel(analysis.methodsScore.hasBlinding)}${analysis.methodsScore.blindingDetails ? ` — ${analysis.methodsScore.blindingDetails}` : ''}`);
  lines.push(`Confounding addressed: ${answerLabel(analysis.methodsScore.confoundingAddressed)}${analysis.methodsScore.confoundingMethod ? ` — ${analysis.methodsScore.confoundingMethod}` : ''}`);
  lines.push(`Missing data handled: ${answerLabel(analysis.methodsScore.missingDataHandled)}${analysis.methodsScore.missingDataMethod ? ` — ${analysis.methodsScore.missingDataMethod}` : ''}`);
  lines.push(`Statistical methods: ${analysis.methodsScore.statisticalMethodsUsed.join(', ') || 'Unable to assess'}`);

  lines.push('', 'REFERENCES AND DISCLOSURES');
  lines.push(`Reference check: ${analysis.referenceCheck.status}; ${analysis.referenceCheck.resolvedIdentifiers}/${analysis.referenceCheck.totalReferences} identifiers resolved; ${analysis.referenceCheck.retractionNoticesFound} notices found among checked identifiers.`);
  lines.push(`COI disclosure: ${analysis.conflictOfInterest.status}; declared: ${answerLabel(analysis.conflictOfInterest.declared)}; industry funded: ${answerLabel(analysis.conflictOfInterest.industryFunded)}`);
  lines.push(`Disclosure details: ${analysis.conflictOfInterest.details}`);
  if (analysis.conflictOfInterest.fundingSource) lines.push(`Funding source: ${analysis.conflictOfInterest.fundingSource}`);

  lines.push('', 'LIMITATIONS AND CAVEATS');
  [...analysis.limitations, ...analysis.verdict.caveats]
    .filter((item, index, all) => all.indexOf(item) === index)
    .forEach((item) => lines.push(`- ${item}`));
  if (appraisal.invalidEvidenceCount > 0) lines.push(`- ${appraisal.invalidEvidenceCount} unmatched generated quotation(s) did not support determinate judgments.`);

  if (analysis.collection || analysis.tags?.length || analysis.notes) {
    lines.push('', 'LIBRARY METADATA');
    if (analysis.collection) lines.push(`Collection: ${analysis.collection}`);
    if (analysis.tags?.length) lines.push(`Tags: ${analysis.tags.join(', ')}`);
    if (analysis.notes) lines.push(`Notes: ${analysis.notes}`);
  }

  if (analysis.feedback?.length) {
    lines.push('', 'REVIEWER CORRECTION HISTORY');
    analysis.feedback.forEach((item) => lines.push(`- ${item.judgmentId}: ${item.rating}${item.suggestedJudgment ? `; suggested ${item.suggestedJudgment.replace(/_/g, ' ')}` : ''}${item.note ? ` — ${item.note}` : ''} (${item.createdAt}, contract ${item.analysisVersion})`));
  }

  lines.push('', `Generated by MedLit with ${analysis.analysisModel}. Verify important claims against the source and consult appropriate domain expertise.`);
  return lines.join('\n');
}
