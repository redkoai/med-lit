import type { ArticleAnalysis, AssessmentAnswer, EvidenceCitation } from '../types';

const answerLabel = (value: AssessmentAnswer) => value.replace('_', ' ').toUpperCase();

const escapeMarkdown = (value: string) => value.replace(/([\\`*_{}\[\]<>|])/g, '\\$1');

function evidenceFor(ids: string[], evidence: EvidenceCitation[]): EvidenceCitation[] {
  const wanted = new Set(ids);
  return evidence.filter((item) => wanted.has(item.id));
}

/** Generate a portable, evidence-linked appraisal report. */
export function generateMarkdownReport(analysis: ArticleAnalysis): string {
  const { article, appraisal } = analysis;
  const coverage = appraisal.sourceCoverage;
  const lines: string[] = [
    '# MedLit Evidence Appraisal Report',
    '',
    '> AI-assisted decision support. This report is not peer review, medical advice, or a substitute for reading the source article.',
    '',
    '## Article',
    '',
    `- **Title:** ${escapeMarkdown(article.title)}`,
    `- **Authors:** ${escapeMarkdown(article.authors.join(', ') || 'Not reported')}`,
    `- **Journal:** ${escapeMarkdown(article.journal || 'Not reported')}`,
    `- **Year:** ${article.year ?? 'Not reported'}`,
  ];

  if (article.doi) lines.push(`- **DOI:** [${escapeMarkdown(article.doi)}](https://doi.org/${encodeURIComponent(article.doi)})`);
  if (article.pmid) lines.push(`- **PMID:** [${article.pmid}](https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/)`);
  lines.push(`- **Analyzed:** ${new Date(analysis.analyzedAt).toISOString()}`);
  lines.push(`- **Analysis revision:** ${analysis.revision} (contract ${analysis.analysisVersion})`);

  lines.push('', '## Source coverage', '');
  lines.push(`- **Coverage:** ${coverage.level.replace('_', ' ')}`);
  lines.push(`- **Text analyzed:** ${coverage.analyzedCharacters.toLocaleString()} of ${coverage.availableCharacters.toLocaleString()} available characters${coverage.wasTruncated ? ' (truncated)' : ''}`);
  lines.push(`- **Available sections:** ${coverage.availableSections.join(', ') || 'Not identified'}`);
  lines.push(`- **Missing or unidentified sections:** ${coverage.missingSections.join(', ') || 'None identified'}`);
  lines.push(`- **References:** ${coverage.referenceCount}; ${coverage.referencesWithIdentifiers} with identifiers; ${coverage.referencesResolved} resolved`);
  if (coverage.pdfPages) lines.push(`- **PDF pages extracted:** ${coverage.pdfPages}`);
  if (typeof coverage.extractedTableCount === 'number') lines.push(`- **Table structures or PDF row candidates detected:** ${coverage.extractedTableCount}; verify against the source`);
  if (coverage.supplementLinks?.length) lines.push(`- **Supplement links detected:** ${coverage.supplementLinks.length}; supplements require separate review`);
  coverage.retrievalWarnings.forEach((warning) => lines.push(`- **Retrieval warning:** ${escapeMarkdown(warning)}`));

  lines.push('', '## Appraisal overview', '');
  lines.push(`- **Appraisal confidence:** ${analysis.verdict.confidence}`);
  lines.push(`- **Risk-of-bias concern:** ${analysis.riskOfBias.overallRisk.replace('_', ' ')}`);
  lines.push(`- **Applicability:** ${analysis.verdict.applicability.replace('_', ' ')} (MedLit does not make clinical applicability decisions)`);
  lines.push(`- **Reading priority:** ${analysis.verdict.readingPriority}`);
  lines.push(`- **Framework:** ${escapeMarkdown(analysis.studyDesign.appraisalFramework)}`);
  lines.push('', escapeMarkdown(analysis.verdict.overallSummary));
  lines.push('', `**Key takeaway:** ${escapeMarkdown(analysis.verdict.keyTakeaway)}`);

  lines.push('', '## Study design', '');
  lines.push(`- **Type:** ${escapeMarkdown(analysis.studyDesign.type)}`);
  lines.push(`- **Rationale:** ${escapeMarkdown(analysis.studyDesign.designRationale)}`);
  lines.push(`- **Preregistration reported:** ${analysis.studyDesign.isPreregistered.toUpperCase()}${analysis.studyDesign.registrationId ? ` (${escapeMarkdown(analysis.studyDesign.registrationId)})` : ''}`);

  lines.push('', '## Plain-language summary', '');
  lines.push(`> ${escapeMarkdown(analysis.summary.oneLiner)}`);
  lines.push('', '**What the authors did**', '');
  analysis.summary.whatTheyDid.forEach((item) => lines.push(`- ${escapeMarkdown(item)}`));
  lines.push('', '**What the authors reported**', '');
  analysis.summary.whatTheyFound.forEach((item) => lines.push(`- ${escapeMarkdown(item)}`));
  lines.push('', `**Why it may matter:** ${escapeMarkdown(analysis.summary.whyItMatters)}`);
  lines.push('', `**Who may care:** ${escapeMarkdown(analysis.summary.whoShouldCare)}`);
  lines.push('', `**Bottom line:** ${escapeMarkdown(analysis.summary.bottomLine)}`);

  if (analysis.pico) {
    lines.push('', '## PICO extraction', '');
    Object.entries(analysis.pico).forEach(([label, element]) => {
      lines.push(`- **${label[0].toUpperCase()}${label.slice(1)} (${element.status.replace(/_/g, ' ')}):** ${escapeMarkdown(element.value)}${element.evidenceIds.length ? ` — ${element.evidenceIds.length} linked passage(s)` : ''}`);
    });
  }

  lines.push('', '## Evidence-linked domain judgments', '');
  lines.push(`Rubric: ${appraisal.rubricId} v${appraisal.rubricVersion}. A determinate judgment requires a quotation matched to the supplied article text.`);
  appraisal.judgments.forEach((judgment) => {
    lines.push('', `### ${escapeMarkdown(judgment.domain)} — ${judgment.judgment.replace('_', ' ')}`, '');
    lines.push(`**Question:** ${escapeMarkdown(judgment.question)}`);
    lines.push('', `**Rationale:** ${escapeMarkdown(judgment.rationale)}`);
    const citations = evidenceFor(judgment.evidenceIds, appraisal.evidence);
    if (citations.length === 0) {
      lines.push('', '_No verified supporting passage was available; treat this domain as unable to assess._');
    } else {
      citations.forEach((item) => {
        lines.push('', `> “${escapeMarkdown(item.quote)}”${item.location || item.section ? ` — ${escapeMarkdown(item.location ?? item.section ?? '')}` : ''}${item.verified ? ' (matched)' : ' (not matched)'}`);
      });
    }
  });

  lines.push('', '## Methods reporting', '');
  lines.push(`- **Sample size adequacy:** ${answerLabel(analysis.methodsScore.sampleSizeAdequate)} — ${escapeMarkdown(analysis.methodsScore.sampleSizeExplanation)}`);
  lines.push(`- **Power calculation:** ${answerLabel(analysis.methodsScore.hasPowerCalculation)}`);
  lines.push(`- **Blinding:** ${answerLabel(analysis.methodsScore.hasBlinding)}${analysis.methodsScore.blindingDetails ? ` — ${escapeMarkdown(analysis.methodsScore.blindingDetails)}` : ''}`);
  lines.push(`- **Confounding addressed:** ${answerLabel(analysis.methodsScore.confoundingAddressed)}${analysis.methodsScore.confoundingMethod ? ` — ${escapeMarkdown(analysis.methodsScore.confoundingMethod)}` : ''}`);
  lines.push(`- **Missing data handled:** ${answerLabel(analysis.methodsScore.missingDataHandled)}${analysis.methodsScore.missingDataMethod ? ` — ${escapeMarkdown(analysis.methodsScore.missingDataMethod)}` : ''}`);
  lines.push(`- **Statistical methods reported:** ${analysis.methodsScore.statisticalMethodsUsed.map(escapeMarkdown).join(', ') || 'Unable to assess'}`);

  lines.push('', '## Reference and disclosure checks', '');
  lines.push(`- **Reference check:** ${analysis.referenceCheck.status} — ${analysis.referenceCheck.resolvedIdentifiers}/${analysis.referenceCheck.totalReferences} reference identifiers resolved; ${analysis.referenceCheck.retractionNoticesFound} retraction/withdrawal notices found among checked identifiers.`);
  lines.push(`- **Conflict-of-interest disclosure:** ${analysis.conflictOfInterest.status}; declared: ${answerLabel(analysis.conflictOfInterest.declared)}; industry funded: ${answerLabel(analysis.conflictOfInterest.industryFunded)}.`);
  lines.push(`- **Disclosure details:** ${escapeMarkdown(analysis.conflictOfInterest.details)}`);
  if (analysis.conflictOfInterest.fundingSource) lines.push(`- **Funding source:** ${escapeMarkdown(analysis.conflictOfInterest.fundingSource)}`);

  lines.push('', '## Limitations and caveats', '');
  [...analysis.limitations, ...analysis.verdict.caveats]
    .filter((item, index, all) => all.indexOf(item) === index)
    .forEach((item) => lines.push(`- ${escapeMarkdown(item)}`));
  if (appraisal.invalidEvidenceCount > 0) {
    lines.push(`- ${appraisal.invalidEvidenceCount} generated quotation${appraisal.invalidEvidenceCount === 1 ? '' : 's'} could not be matched and did not support determinate judgments.`);
  }

  if (analysis.collection || analysis.tags?.length || analysis.notes) {
    lines.push('', '## Library metadata', '');
    if (analysis.collection) lines.push(`- **Collection:** ${escapeMarkdown(analysis.collection)}`);
    if (analysis.tags?.length) lines.push(`- **Tags:** ${analysis.tags.map(escapeMarkdown).join(', ')}`);
    if (analysis.notes) lines.push('', escapeMarkdown(analysis.notes));
  }

  if (analysis.feedback?.length) {
    lines.push('', '## Reviewer correction history', '');
    analysis.feedback.forEach((item) => lines.push(`- **${item.judgmentId}:** ${item.rating}${item.suggestedJudgment ? `; suggested ${item.suggestedJudgment.replace(/_/g, ' ')}` : ''}${item.note ? ` — ${escapeMarkdown(item.note)}` : ''} (${item.createdAt}, contract ${item.analysisVersion})`));
  }

  lines.push('', '---', `Generated by MedLit with ${escapeMarkdown(analysis.analysisModel)}. Verify important claims against the source and consult appropriate domain expertise.`);
  return lines.join('\n');
}
