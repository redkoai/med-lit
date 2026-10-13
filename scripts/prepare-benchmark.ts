import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { ArticleAnalysis } from '../src/types';

interface InputFile { analyses?: ArticleAnalysis[] }

const inputPath = process.argv[2];
const outputPath = process.argv[3];
assert.ok(inputPath && outputPath, 'Usage: npm run benchmark:prepare -- <private-library-backup.json> <private-blinded-packets.json>');

const input = JSON.parse(readFileSync(resolve(inputPath), 'utf8')) as InputFile | ArticleAnalysis[];
const analyses = Array.isArray(input) ? input : input.analyses ?? [];
assert.ok(analyses.length, 'No analyses found in the supplied backup.');

const packets = analyses.map((analysis, index) => {
  const sourceText = [analysis.article.title, analysis.article.abstract, analysis.article.fullText ?? ''].join('\n');
  return {
    caseId: `case-${String(index + 1).padStart(3, '0')}`,
    sourcePackageHash: createHash('sha256').update(sourceText).digest('hex'),
    identifiers: {
      doi: analysis.article.doi,
      pmid: analysis.article.pmid,
      pmcid: analysis.article.pmcid,
    },
    article: {
      title: analysis.article.title,
      journal: analysis.article.journal,
      year: analysis.article.year,
      abstract: analysis.article.abstract,
      fullText: analysis.article.fullText,
      sourceCoverage: analysis.appraisal.sourceCoverage,
    },
    designToVerify: analysis.studyDesign.type,
    rubric: {
      id: analysis.appraisal.rubricId,
      version: analysis.appraisal.rubricVersion,
      questions: analysis.appraisal.judgments.map(({ id, framework, domain, question }) => ({ id, framework, domain, question })),
    },
    reviewerA: { reviewerCode: '', expertise: '', startedAt: '', completedAt: '', domains: [] },
    reviewerB: { reviewerCode: '', expertise: '', startedAt: '', completedAt: '', domains: [] },
    adjudication: { adjudicatorCode: '', completedAt: '', domains: [] },
  };
});

writeFileSync(resolve(outputPath), JSON.stringify({
  schemaVersion: '2.0.0',
  createdAt: new Date().toISOString(),
  instructions: 'Keep reviewers blinded to the MedLit output. Preserve both original domain reviews before adjudication.',
  packets,
}, null, 2));

console.log(`Prepared ${packets.length} blinded packet(s) at ${resolve(outputPath)}.`);
console.log('This output may contain licensed full text. Keep it private unless redistribution rights are confirmed.');
