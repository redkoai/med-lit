import type { ArticleAnalysis } from '../types';

/** Single responsibility: plain-text report generation only. */
export function generateTextReport(analysis: ArticleAnalysis): string {
  const lines: string[] = [];

  lines.push('═══════════════════════════════════════════════════════');
  lines.push('MedLit — Critical Appraisal Report');
  lines.push('═══════════════════════════════════════════════════════\n');

  lines.push('ARTICLE INFORMATION');
  lines.push('─────────────────────────────────────────────────────');
  lines.push(`Title: ${analysis.article.title}`);
  lines.push(`Authors: ${analysis.article.authors.join(', ')}`);
  lines.push(`Journal: ${analysis.article.journal}`);
  if (analysis.article.year) lines.push(`Year: ${analysis.article.year}`);
  if (analysis.article.doi) lines.push(`DOI: ${analysis.article.doi}`);
  if (analysis.article.pmid) lines.push(`PMID: ${analysis.article.pmid}`);
  lines.push(`Analyzed: ${new Date(analysis.analyzedAt).toLocaleString()}`);
  lines.push('');

  lines.push('OVERALL ASSESSMENT');
  lines.push('─────────────────────────────────────────────────────');
  lines.push(`✓ Trustworthy: ${analysis.verdict.trustworthy ? 'YES' : 'NO'}`);
  lines.push(`✓ Clinically Applicable: ${analysis.verdict.clinicallyApplicable ? 'YES' : 'NO'}`);
  lines.push(`✓ Read-Worthy: ${analysis.verdict.readWorthy ? 'YES' : 'NO'}`);
  lines.push('');
  lines.push(`Accuracy Score: ${analysis.accuracyScore.score}/10 (${analysis.accuracyScore.grade})`);
  lines.push(`Bias Risk Score: ${analysis.biasScore.score}/10 (${analysis.biasScore.overallRisk})`);
  lines.push(`Methods Quality: ${analysis.methodsScore.score}/10`);
  lines.push(`Reference Check: ${analysis.referenceCheck.status}`);
  lines.push(`Conflict of Interest: ${analysis.conflictOfInterest.status}`);
  lines.push('');

  lines.push('STUDY DESIGN');
  lines.push('─────────────────────────────────────────────────────');
  lines.push(`Type: ${analysis.studyDesign.type}`);
  lines.push(`CEBM Level: ${analysis.studyDesign.cebtLevel} — ${analysis.studyDesign.cebtDescription}`);
  if (analysis.studyDesign.isPreregistered) {
    lines.push(`Pre-registered: YES${analysis.studyDesign.registrationId ? ` (${analysis.studyDesign.registrationId})` : ''}`);
  } else {
    lines.push('Pre-registered: NO');
  }
  lines.push('');

  lines.push('PLAIN LANGUAGE SUMMARY');
  lines.push('─────────────────────────────────────────────────────');
  lines.push(`📌 ${analysis.summary.oneLiner}\n`);
  lines.push('What They Did:');
  analysis.summary.whatTheyDid.forEach((item) => lines.push(`  • ${item}`));
  lines.push('');
  lines.push('What They Found:');
  analysis.summary.whatTheyFound.forEach((item) => lines.push(`  • ${item}`));
  lines.push('');
  lines.push(`Why It Matters: ${analysis.summary.whyItMatters}`);
  lines.push(`Who Should Care: ${analysis.summary.whoShouldCare}`);
  lines.push(`Bottom Line: ${analysis.summary.bottomLine}`);
  lines.push('');

  lines.push('ACCURACY ANALYSIS');
  lines.push('─────────────────────────────────────────────────────');
  lines.push(`Score: ${analysis.accuracyScore.score}/10 (Grade: ${analysis.accuracyScore.grade})\n`);
  if (analysis.accuracyScore.strengths.length > 0) {
    lines.push('Strengths:');
    analysis.accuracyScore.strengths.forEach((s) => lines.push(`  ✓ ${s}`));
    lines.push('');
  }
  if (analysis.accuracyScore.weaknesses.length > 0) {
    lines.push('Weaknesses:');
    analysis.accuracyScore.weaknesses.forEach((w) => lines.push(`  ✗ ${w}`));
    lines.push('');
  }
  if (analysis.accuracyScore.redFlags.length > 0) {
    lines.push('🚩 Red Flags:');
    analysis.accuracyScore.redFlags.forEach((rf) => lines.push(`  ⚠️  ${rf}`));
    lines.push('');
  }

  lines.push('BIAS RISK ANALYSIS');
  lines.push('─────────────────────────────────────────────────────');
  lines.push(`Score: ${analysis.biasScore.score}/10 (Risk Level: ${analysis.biasScore.overallRisk.toUpperCase()})\n`);
  lines.push(analysis.biasScore.overallReasoning);
  lines.push('');
  if (analysis.biasScore.biasesFound.length > 0) {
    lines.push('Biases Detected:');
    analysis.biasScore.biasesFound.forEach((bias) => {
      lines.push(`  • ${bias.type} [${bias.severity.toUpperCase()}]`);
      lines.push(`    ${bias.explanation}`);
    });
    lines.push('');
  }
  if (analysis.biasScore.positivePractices.length > 0) {
    lines.push('Positive Practices (Bias Reduction):');
    analysis.biasScore.positivePractices.forEach((p) => lines.push(`  ✓ ${p}`));
    lines.push('');
  }

  lines.push('METHODS QUALITY');
  lines.push('─────────────────────────────────────────────────────');
  lines.push(`Score: ${analysis.methodsScore.score}/10\n`);
  lines.push(`Sample Size: ${analysis.methodsScore.sampleSizeExplanation}`);
  lines.push(`Power Calculation: ${analysis.methodsScore.hasPowerCalculation ? 'YES' : 'NO'}`);
  lines.push(`Blinding: ${analysis.methodsScore.hasBlinding ? `YES (${analysis.methodsScore.blindingDetails})` : 'NO or Not Reported'}`);
  lines.push(`Confounding Addressed: ${analysis.methodsScore.confoundingAddressed ? `YES (${analysis.methodsScore.confoundingMethod})` : 'NO'}`);
  lines.push(`Missing Data Handled: ${analysis.methodsScore.missingDataHandled ? `YES (${analysis.methodsScore.missingDataMethod})` : 'NO or Not Reported'}`);
  if (analysis.methodsScore.reportingFramework !== 'none' && analysis.methodsScore.reportingFramework !== 'unknown') {
    lines.push(`Reporting Framework: ${analysis.methodsScore.reportingFramework} (Adheres: ${analysis.methodsScore.adheresToFramework ? 'YES' : 'NO'})`);
  }
  lines.push('');
  if (analysis.methodsScore.statisticalMethodsUsed.length > 0) {
    lines.push('Statistical Methods:');
    analysis.methodsScore.statisticalMethodsUsed.forEach((m) => lines.push(`  • ${m}`));
    lines.push('');
  }
  if (analysis.methodsScore.strengths.length > 0) {
    lines.push('Strengths:');
    analysis.methodsScore.strengths.forEach((s) => lines.push(`  ✓ ${s}`));
    lines.push('');
  }
  if (analysis.methodsScore.issues.length > 0) {
    lines.push('Issues:');
    analysis.methodsScore.issues.forEach((i) => lines.push(`  ✗ ${i}`));
    lines.push('');
  }

  lines.push('REFERENCE VERIFICATION');
  lines.push('─────────────────────────────────────────────────────');
  lines.push(`Status: ${analysis.referenceCheck.status}`);
  lines.push(`Total References: ${analysis.referenceCheck.totalReferences}`);
  if (analysis.referenceCheck.selfCitationRate != null) {
    lines.push(`Self-Citation Rate: ${Math.round(analysis.referenceCheck.selfCitationRate * 100)}%`);
  }
  if (analysis.referenceCheck.issues.length > 0) {
    lines.push('\nIssues:');
    analysis.referenceCheck.issues.forEach((i) => lines.push(`  ✗ ${i}`));
  }
  if (analysis.referenceCheck.positives.length > 0) {
    lines.push('\nPositive Practices:');
    analysis.referenceCheck.positives.forEach((p) => lines.push(`  ✓ ${p}`));
  }
  lines.push('');

  lines.push('CONFLICT OF INTEREST');
  lines.push('─────────────────────────────────────────────────────');
  lines.push(`Status: ${analysis.conflictOfInterest.status}`);
  lines.push(`Industry Funded: ${analysis.conflictOfInterest.industryFunded ? 'YES' : 'NO'}`);
  if (analysis.conflictOfInterest.fundingSource) {
    lines.push(`Funding Source: ${analysis.conflictOfInterest.fundingSource}`);
  }
  lines.push(`Details: ${analysis.conflictOfInterest.details}`);
  lines.push('');

  if (analysis.limitations.length > 0) {
    lines.push('LIMITATIONS');
    lines.push('─────────────────────────────────────────────────────');
    analysis.limitations.forEach((lim, i) => lines.push(`${i + 1}. ${lim}`));
    lines.push('');
  }

  lines.push('OVERALL VERDICT');
  lines.push('─────────────────────────────────────────────────────');
  lines.push(analysis.verdict.overallSummary);
  lines.push('');
  lines.push(`Key Takeaway: ${analysis.verdict.keyTakeaway}`);
  if (analysis.verdict.caveats.length > 0) {
    lines.push('\nCaveats When Using/Citing:');
    analysis.verdict.caveats.forEach((c) => lines.push(`  ⚠️  ${c}`));
  }
  lines.push('');

  lines.push('═══════════════════════════════════════════════════════');
  lines.push(`Generated by MedLit v${analysis.analysisVersion}`);
  lines.push(`Model: ${analysis.analysisModel}`);
  lines.push(`Frameworks: Cochrane RoB 2, ROBINS-I, CONSORT, STROBE,`);
  lines.push(`PRISMA 2020, Oxford CEBM, ICMJE COI Standards`);
  lines.push('═══════════════════════════════════════════════════════');

  return lines.join('\n');
}
