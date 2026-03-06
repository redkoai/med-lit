import type { ArticleAnalysis } from '../types';

/** Single responsibility: Markdown report generation only. */
export function generateMarkdownReport(analysis: ArticleAnalysis): string {
  const lines: string[] = [];

  lines.push('# MedLit — Critical Appraisal Report\n');
  lines.push('## Article Information\n');
  lines.push(`**Title:** ${analysis.article.title}  `);
  lines.push(`**Authors:** ${analysis.article.authors.join(', ')}  `);
  lines.push(`**Journal:** ${analysis.article.journal}  `);
  if (analysis.article.year) lines.push(`**Year:** ${analysis.article.year}  `);
  if (analysis.article.doi) lines.push(`**DOI:** [${analysis.article.doi}](https://doi.org/${analysis.article.doi})  `);
  if (analysis.article.pmid) lines.push(`**PMID:** [${analysis.article.pmid}](https://pubmed.ncbi.nlm.nih.gov/${analysis.article.pmid}/)  `);
  lines.push(`**Analyzed:** ${new Date(analysis.analyzedAt).toLocaleString()}\n`);

  lines.push('## Overall Assessment\n');
  lines.push(`- **Trustworthy:** ${analysis.verdict.trustworthy ? '✅ YES' : '❌ NO'}`);
  lines.push(`- **Clinically Applicable:** ${analysis.verdict.clinicallyApplicable ? '✅ YES' : '❌ NO'}`);
  lines.push(`- **Read-Worthy:** ${analysis.verdict.readWorthy ? '✅ YES' : '❌ NO'}\n`);
  lines.push('### Scores\n');
  lines.push(`| Dimension | Score | Grade/Status |`);
  lines.push(`|-----------|-------|--------------|`);
  lines.push(`| Accuracy | ${analysis.accuracyScore.score}/10 | ${analysis.accuracyScore.grade} |`);
  lines.push(`| Bias Risk | ${analysis.biasScore.score}/10 | ${analysis.biasScore.overallRisk} |`);
  lines.push(`| Methods Quality | ${analysis.methodsScore.score}/10 | — |`);
  lines.push(`| References | — | ${analysis.referenceCheck.status} |`);
  lines.push(`| Conflict of Interest | — | ${analysis.conflictOfInterest.status} |\n`);

  lines.push('## Study Design\n');
  lines.push(`- **Type:** ${analysis.studyDesign.type}`);
  lines.push(`- **CEBM Level:** ${analysis.studyDesign.cebtLevel} — ${analysis.studyDesign.cebtDescription}`);
  lines.push(`- **Pre-registered:** ${analysis.studyDesign.isPreregistered ? `YES${analysis.studyDesign.registrationId ? ` (${analysis.studyDesign.registrationId})` : ''}` : 'NO'}\n`);

  lines.push('## Plain Language Summary\n');
  lines.push(`> ${analysis.summary.oneLiner}\n`);
  lines.push('**What They Did:**');
  analysis.summary.whatTheyDid.forEach((item) => lines.push(`- ${item}`));
  lines.push('\n**What They Found:**');
  analysis.summary.whatTheyFound.forEach((item) => lines.push(`- ${item}`));
  lines.push(`\n**Why It Matters:** ${analysis.summary.whyItMatters}\n`);
  lines.push(`**Who Should Care:** ${analysis.summary.whoShouldCare}\n`);
  lines.push(`**Bottom Line:** ${analysis.summary.bottomLine}\n`);

  lines.push(`## Accuracy Analysis (${analysis.accuracyScore.score}/10, ${analysis.accuracyScore.grade})\n`);
  if (analysis.accuracyScore.strengths.length > 0) {
    lines.push('### Strengths\n');
    analysis.accuracyScore.strengths.forEach((s) => lines.push(`- ✅ ${s}`));
    lines.push('');
  }
  if (analysis.accuracyScore.weaknesses.length > 0) {
    lines.push('### Weaknesses\n');
    analysis.accuracyScore.weaknesses.forEach((w) => lines.push(`- ❌ ${w}`));
    lines.push('');
  }
  if (analysis.accuracyScore.redFlags.length > 0) {
    lines.push('### 🚩 Red Flags\n');
    analysis.accuracyScore.redFlags.forEach((rf) => lines.push(`- ⚠️ ${rf}`));
    lines.push('');
  }

  lines.push(`## Bias Risk Analysis (${analysis.biasScore.score}/10, ${analysis.biasScore.overallRisk})\n`);
  lines.push(`${analysis.biasScore.overallReasoning}\n`);
  if (analysis.biasScore.biasesFound.length > 0) {
    lines.push('### Biases Detected\n');
    analysis.biasScore.biasesFound.forEach((bias) => {
      lines.push(`#### ${bias.type} [${bias.severity.toUpperCase()}]\n`);
      lines.push(`${bias.explanation}\n`);
    });
  }
  if (analysis.biasScore.positivePractices.length > 0) {
    lines.push('### Positive Practices\n');
    analysis.biasScore.positivePractices.forEach((p) => lines.push(`- ✅ ${p}`));
    lines.push('');
  }

  lines.push(`## Methods Quality (${analysis.methodsScore.score}/10)\n`);
  lines.push(`- **Sample Size:** ${analysis.methodsScore.sampleSizeExplanation}`);
  lines.push(`- **Power Calculation:** ${analysis.methodsScore.hasPowerCalculation ? '✅' : '❌'}`);
  lines.push(`- **Blinding:** ${analysis.methodsScore.hasBlinding ? `✅ (${analysis.methodsScore.blindingDetails})` : '❌'}`);
  lines.push(`- **Confounding:** ${analysis.methodsScore.confoundingAddressed ? `✅ (${analysis.methodsScore.confoundingMethod})` : '❌'}`);
  lines.push(`- **Missing Data:** ${analysis.methodsScore.missingDataHandled ? `✅ (${analysis.methodsScore.missingDataMethod})` : '❌'}\n`);

  if (analysis.limitations.length > 0) {
    lines.push('## Limitations\n');
    analysis.limitations.forEach((lim) => lines.push(`- ${lim}`));
    lines.push('');
  }

  lines.push('## Overall Verdict\n');
  lines.push(`${analysis.verdict.overallSummary}\n`);
  lines.push(`**Key Takeaway:** ${analysis.verdict.keyTakeaway}\n`);
  if (analysis.verdict.caveats.length > 0) {
    lines.push('### Caveats\n');
    analysis.verdict.caveats.forEach((c) => lines.push(`- ⚠️ ${c}`));
    lines.push('');
  }

  lines.push('---');
  lines.push(`*Generated by MedLit v${analysis.analysisVersion} using ${analysis.analysisModel}*  `);
  lines.push(`*Frameworks: Cochrane RoB 2, ROBINS-I, CONSORT, STROBE, PRISMA 2020, Oxford CEBM, ICMJE COI Standards*`);

  return lines.join('\n');
}
