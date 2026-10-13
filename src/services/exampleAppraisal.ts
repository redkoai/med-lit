import type { ArticleAnalysis, RawArticleData } from '../types';
import { buildAnalysisFromModel } from './analysisValidation';

// Authored teaching material, deliberately not a real paper or an AI result.
export const EXAMPLE_PASSAGES = {
  population: 'We enrolled 120 adults from one university to compare a reading app with usual study practice over four weeks.',
  randomization: 'Participants were randomly assigned in a one-to-one ratio using a computer-generated sequence. Allocation was concealed by a central service.',
  deviations: 'Participants knew their assigned group. Only participants who completed the intervention were included in the analysis.',
  missing: 'Outcome data were missing for 24 of 120 participants; reasons and group-specific counts were not reported.',
  measurement: 'The primary outcome was a self-reported concentration score collected after four weeks.',
};

export const EXAMPLE_SOURCE: RawArticleData = {
  title: 'Fictional example: a reading app and self-reported concentration',
  authors: [], journal: 'MedLit teaching material · not a published study', year: null,
  abstract: 'A fictional randomized study illustrates how reported methods, missing data, and unsupported quotations affect an appraisal. No treatment effect is claimed.',
  fullText: `Methods\n${EXAMPLE_PASSAGES.population}\n${EXAMPLE_PASSAGES.randomization}\n${EXAMPLE_PASSAGES.deviations}\n${EXAMPLE_PASSAGES.measurement}\nResults\n${EXAMPLE_PASSAGES.missing}\nNo effect estimate, protocol, references, or funding statement is supplied.`,
  fetchSource: 'full_text', availableSections: ['abstract', 'methods', 'results'],
  retrievalWarnings: ['Fictional teaching excerpt, not retrieved research. “Full text” refers only to this short authored example.'],
  references: [], sourceUrls: [], retractionStatus: 'not_checked', isPreprint: false,
};

export function createExampleAppraisal(): ArticleAnalysis {
  const result = buildAnalysisFromModel({
    studyDesign: { type: 'Randomized Controlled Trial', designRationale: 'Random allocation is reported in the fictional excerpt.', isPreregistered: 'unclear' },
    summary: {
      oneLiner: 'A fictional reading-app study shows why a randomized design alone does not settle the risk of bias.',
      whatTheyDid: ['Assigned 120 university adults to a reading app or usual study practice for four weeks.'],
      whatTheyFound: ['The excerpt reports 24 missing outcomes and does not provide an effect estimate.'],
      whyItMatters: 'Missing outcomes and unblinded self-report can complicate interpretation, even with random allocation.',
      whoShouldCare: 'Anyone practicing critical appraisal. This example does not support a real health or learning decision.',
      bottomLine: 'Inspect the bias domains, compare their passages, and notice the unsupported reporting claim being marked unclear.',
    },
    evidence: [
      ...Object.entries(EXAMPLE_PASSAGES).map(([id, quote]) => ({ id, quote, claim: id, section: id === 'missing' ? 'Results' : 'Methods' })),
      { id: 'unsupported', claim: 'Deliberately unsupported reporting claim', quote: 'All outcomes followed a preregistered analysis plan.', section: 'Protocol' },
    ],
    judgments: [
      { id: 'rct.randomization', judgment: 'low', rationale: 'The example reports a generated random sequence and central concealment. These passages support this limited judgment; they do not certify implementation.', evidenceIds: ['randomization'] },
      { id: 'rct.deviations', judgment: 'some_concerns', rationale: 'Participants knew their assignment and the analysis excluded non-completers. This raises concerns about departures from assigned intervention.', evidenceIds: ['deviations'] },
      { id: 'rct.missing', judgment: 'some_concerns', rationale: 'Twenty percent of outcomes are missing. Without reasons or group counts, the impact of missingness cannot be established.', evidenceIds: ['missing'] },
      { id: 'rct.measurement', judgment: 'some_concerns', rationale: 'The outcome is self-reported by participants who knew their assignment. Expectations could influence reporting.', evidenceIds: ['measurement', 'deviations'] },
      { id: 'rct.selection', judgment: 'low', rationale: 'Teaching example: a deliberately unsupported preregistration quotation is excluded by the validator. Selective reporting therefore remains unclear.', evidenceIds: ['unsupported'] },
    ],
    pico: {
      population: { value: '120 adults from one university', status: 'identified', evidenceIds: ['population'] },
      intervention: { value: 'A reading app', status: 'identified', evidenceIds: ['population'] },
      comparator: { value: 'Usual study practice', status: 'identified', evidenceIds: ['population'] },
      outcomes: { value: 'Self-reported concentration score', status: 'identified', evidenceIds: ['measurement'] },
      timeframe: { value: 'Four weeks', status: 'identified', evidenceIds: ['population'] },
    },
    methods: { sampleSizeAdequate: 'unclear', sampleSizeExplanation: 'No power calculation is supplied.', hasPowerCalculation: 'unclear', hasBlinding: 'no', blindingDetails: 'Participants knew their assignment.', missingDataHandled: 'no', missingDataMethod: 'Only completers were analyzed; no missing-data sensitivity analysis is supplied.', strengths: ['Random sequence and central concealment are described.'], issues: ['Missing outcomes and unblinded self-report require review.'], reportingFramework: 'CONSORT', adheresToFramework: 'unclear' },
    conflictOfInterest: { status: 'MISSING', declared: 'unclear', industryFunded: 'unclear', details: 'The fictional excerpt supplies no funding or conflict statement.' },
    limitations: ['Fictional, hand-authored teaching example. No provider was called and no scientific finding is established.', 'This is an abbreviated excerpt without effect estimates, protocol, reference list, or funding disclosures.'],
  }, EXAMPLE_SOURCE, { sourceType: 'unknown', originalUrl: '/example' }, 'example/hand-authored');
  // Stable SSR and exported teaching identity. Never insert into real history.
  return { ...result, id: 'medlit-fictional-example-v1', analyzedAt: '2026-09-11T00:00:00.000Z' };
}
