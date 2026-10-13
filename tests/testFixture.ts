import type { ArticleIdentifier, RawArticleData } from '../src/types';

export const fixtureIdentifier: ArticleIdentifier = {
  pmid: '12345678',
  sourceType: 'pubmed',
  originalUrl: 'https://pubmed.ncbi.nlm.nih.gov/12345678/',
};

export const fixtureArticle: RawArticleData = {
  title: 'A randomized trial of structured evidence appraisal',
  authors: ['Rivera Ana', 'Chen Kai'],
  journal: 'Journal of Transparent Tests',
  year: 2025,
  doi: '10.1234/example.2025.1',
  pmid: '12345678',
  abstract: 'Participants were randomly assigned in a one-to-one ratio. The primary outcome was prespecified.',
  fullText: [
    'Methods',
    'Participants were randomly assigned in a one-to-one ratio using a computer-generated sequence.',
    'Allocation was concealed with a central web service.',
    'All participants were analyzed in their assigned groups.',
    'Outcome assessors were blinded to assigned treatment.',
    'The protocol and statistical analysis plan were registered before recruitment.',
    'Results',
    'Primary outcome data were available for 98 percent of randomized participants.',
  ].join('\n'),
  references: [{
    raw: 'Example A. Transparent reporting. doi:10.5678/reference.1',
    doi: '10.5678/reference.1',
    identifierStatus: 'resolved',
    retractionStatus: 'no_notice_found',
  }],
  fetchSource: 'full_text',
  availableSections: ['abstract', 'methods', 'results', 'references'],
  retrievalWarnings: [],
  sourceUrls: ['https://pmc.ncbi.nlm.nih.gov/articles/PMC12345678/'],
  retractionStatus: 'no_notice_found',
  isPreprint: false,
};

export const fixtureModelOutput = {
  studyDesign: {
    type: 'Randomized Controlled Trial',
    designRationale: 'The article reports random assignment to intervention groups.',
    isPreregistered: 'yes',
    registrationId: 'NCT00000001',
  },
  summary: {
    oneLiner: 'The authors tested a structured appraisal intervention in a randomized trial.',
    whatTheyDid: ['Randomly assigned participants to comparison groups.'],
    whatTheyFound: ['Reported nearly complete primary outcome data.'],
    whyItMatters: 'The design can estimate comparative effects when its assumptions hold.',
    whoShouldCare: 'Readers evaluating evidence-appraisal tools.',
    bottomLine: 'Interpret the reported effect alongside the domain judgments and source text.',
  },
  evidence: [
    { id: 'e-random', claim: 'Random sequence', quote: 'Participants were randomly assigned in a one-to-one ratio using a computer-generated sequence.', section: 'Methods' },
    { id: 'e-conceal', claim: 'Allocation concealment', quote: 'Allocation was concealed with a central web service.', section: 'Methods' },
    { id: 'e-analysis', claim: 'Assigned-group analysis', quote: 'All participants were analyzed in their assigned groups.', section: 'Methods' },
    { id: 'e-missing', claim: 'Outcome completeness', quote: 'Primary outcome data were available for 98 percent of randomized participants.', section: 'Results' },
    { id: 'e-blind', claim: 'Blinded assessment', quote: 'Outcome assessors were blinded to assigned treatment.', section: 'Methods' },
    { id: 'e-invented', claim: 'Selective reporting', quote: 'Every secondary endpoint was published exactly as planned.', section: 'Results' },
  ],
  judgments: [
    { id: 'rct.randomization', judgment: 'low', rationale: 'Sequence generation and concealment are described.', evidenceIds: ['e-random', 'e-conceal'] },
    { id: 'rct.deviations', judgment: 'low', rationale: 'Assigned-group analysis is reported.', evidenceIds: ['e-analysis'] },
    { id: 'rct.missing', judgment: 'low', rationale: 'Primary outcome completeness was high.', evidenceIds: ['e-missing'] },
    { id: 'rct.measurement', judgment: 'low', rationale: 'Outcome assessors were blinded.', evidenceIds: ['e-blind'] },
    { id: 'rct.selection', judgment: 'low', rationale: 'The response claimed complete prespecified reporting.', evidenceIds: ['e-invented'] },
  ],
  methods: {
    sampleSizeAdequate: 'unclear',
    sampleSizeExplanation: 'No power calculation passage was supplied in the fixture.',
    statisticalMethodsUsed: ['Intention-to-treat comparison'],
    hasPowerCalculation: 'unclear',
    hasBlinding: 'yes',
    blindingDetails: 'Outcome assessors were blinded.',
    confoundingAddressed: 'not_applicable',
    missingDataHandled: 'yes',
    missingDataMethod: 'Primary outcome completeness was reported.',
    issues: [],
    strengths: ['Random sequence and allocation concealment were described.'],
    reportingFramework: 'CONSORT',
    adheresToFramework: 'unclear',
  },
  conflictOfInterest: {
    status: 'MISSING',
    declared: 'unclear',
    details: 'No conflict-of-interest statement was included in the fixture text.',
    industryFunded: 'unclear',
  },
  limitations: ['This is a synthetic regression fixture, not an expert appraisal.'],
  overallAssessment: {
    summary: 'Four domains have matched supporting passages; selective reporting remains unable to assess.',
    keyTakeaway: 'Review the matched passages and the unable-to-assess domain.',
    caveats: ['The fixture is intentionally incomplete.'],
  },
};
