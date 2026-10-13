import type { StudyDesignType } from '../types';

export interface RubricQuestion {
  id: string;
  domain: string;
  question: string;
}

export interface AppraisalRubric {
  id: string;
  version: string;
  framework: string;
  designs: StudyDesignType[];
  questions: RubricQuestion[];
}

const question = (id: string, domain: string, text: string): RubricQuestion => ({
  id,
  domain,
  question: text,
});

/**
 * These are transparent appraisal question sets, not claims that MedLit has
 * implemented or validated the official instruments themselves. The wording is
 * intentionally concise so that each answer can be tied to article evidence.
 */
export const APPRAISAL_RUBRICS: AppraisalRubric[] = [
  {
    id: 'rct-rob2-aligned',
    version: '1.0.0',
    framework: 'RoB 2-aligned structured questions',
    designs: ['Randomized Controlled Trial'],
    questions: [
      question('rct.randomization', 'Randomization process', 'Was the allocation sequence random and concealed, with no important baseline imbalance?'),
      question('rct.deviations', 'Deviations from intended interventions', 'Were deviations from assigned interventions and their analysis handled appropriately?'),
      question('rct.missing', 'Missing outcome data', 'Were outcome data sufficiently complete, with missingness unlikely to bias the result?'),
      question('rct.measurement', 'Outcome measurement', 'Were outcomes measured appropriately and without differential knowledge of intervention assignment?'),
      question('rct.selection', 'Selection of the reported result', 'Was the reported analysis consistent with a prespecified plan and free from selective result reporting?'),
    ],
  },
  {
    id: 'systematic-review-robis-aligned',
    version: '1.0.0',
    framework: 'ROBIS-aligned structured questions',
    designs: ['Systematic Review / Meta-Analysis', 'Review Article'],
    questions: [
      question('sr.eligibility', 'Eligibility criteria', 'Were eligibility criteria prespecified, appropriate, and unambiguous?'),
      question('sr.identification', 'Identification and selection', 'Was the search sufficiently comprehensive and study selection reproducible?'),
      question('sr.appraisal', 'Data collection and appraisal', 'Were data extraction and primary-study bias assessments reproducible and appropriate?'),
      question('sr.synthesis', 'Synthesis and findings', 'Were synthesis methods appropriate for heterogeneity, missing data, and primary-study limitations?'),
    ],
  },
  {
    id: 'observational-robins-i-aligned',
    version: '1.0.0',
    framework: 'ROBINS-I-aligned structured questions',
    designs: ['Quasi-Experimental', 'Prospective Cohort', 'Retrospective Cohort', 'Case-Control'],
    questions: [
      question('obs.confounding', 'Confounding', 'Were important confounders identified, measured, and addressed appropriately?'),
      question('obs.selection', 'Participant selection', 'Could selection into the study or analysis have biased the association?'),
      question('obs.classification', 'Exposure classification', 'Were exposures or interventions classified accurately and without knowledge of outcomes?'),
      question('obs.deviations', 'Deviations after exposure', 'Were post-exposure deviations handled without introducing bias?'),
      question('obs.missing', 'Missing data', 'Were missing participants and measurements handled appropriately?'),
      question('obs.measurement', 'Outcome measurement', 'Were outcomes measured validly and similarly across comparison groups?'),
      question('obs.reporting', 'Selective reporting', 'Were reported analyses and outcomes consistent with a prespecified or clearly justified plan?'),
    ],
  },
  {
    id: 'diagnostic-quadas2-aligned',
    version: '1.0.0',
    framework: 'QUADAS-2-aligned structured questions',
    designs: ['Diagnostic Accuracy Study'],
    questions: [
      question('dx.selection', 'Patient selection', 'Was the participant spectrum appropriate and free from avoidable case-control selection?'),
      question('dx.index', 'Index test', 'Was the index test interpreted using prespecified thresholds and without knowledge of the reference standard?'),
      question('dx.reference', 'Reference standard', 'Was the reference standard likely to classify the target condition correctly and interpreted independently?'),
      question('dx.flow', 'Flow and timing', 'Did participants receive the same reference standard with appropriate timing and complete inclusion in analysis?'),
    ],
  },
  {
    id: 'cross-sectional-jbi-aligned',
    version: '1.0.0',
    framework: 'JBI-aligned analytical cross-sectional questions',
    designs: ['Cross-Sectional'],
    questions: [
      question('cross.selection', 'Sampling', 'Were inclusion criteria and sampling methods appropriate for the target population?'),
      question('cross.measurement', 'Measurement', 'Were exposure and outcome measurements valid, reliable, and applied consistently?'),
      question('cross.confounding', 'Confounding', 'Were important confounders identified and addressed?'),
      question('cross.analysis', 'Analysis', 'Were statistical methods appropriate for the design, outcome, and sampling process?'),
    ],
  },
  {
    id: 'qualitative-casp-aligned',
    version: '1.0.0',
    framework: 'CASP-aligned qualitative questions',
    designs: ['Qualitative Study'],
    questions: [
      question('qual.design', 'Research design', 'Was the qualitative approach appropriate for the research question?'),
      question('qual.recruitment', 'Recruitment', 'Was recruitment appropriate and transparently described?'),
      question('qual.collection', 'Data collection', 'Were data collected in a way that addressed the research question and researcher-participant relationship?'),
      question('qual.analysis', 'Analysis and reflexivity', 'Was analysis rigorous, reflexive, and supported by the presented data?'),
    ],
  },
  {
    id: 'descriptive-general',
    version: '1.0.0',
    framework: 'General transparent appraisal questions',
    designs: [
      'Case Report / Case Series',
      'Basic Science / In Vitro',
      'Animal Study',
      'Editorial / Commentary',
      'Unknown',
    ],
    questions: [
      question('general.design', 'Design fit', 'Does the design appropriately address the stated research question?'),
      question('general.measurement', 'Measurement', 'Are measurements, procedures, and outcomes described and suitable?'),
      question('general.analysis', 'Analysis', 'Is the analysis transparent and appropriate for the available data?'),
      question('general.interpretation', 'Interpretation', 'Are conclusions proportionate to the design, data, and acknowledged limitations?'),
    ],
  },
];

export function getRubricForDesign(design: StudyDesignType): AppraisalRubric {
  return APPRAISAL_RUBRICS.find((rubric) => rubric.designs.includes(design))
    ?? APPRAISAL_RUBRICS[APPRAISAL_RUBRICS.length - 1];
}

export function getRubricPrompt(): string {
  return APPRAISAL_RUBRICS.map((rubric) => [
    `${rubric.id} | ${rubric.framework}`,
    `Use for: ${rubric.designs.join('; ')}`,
    ...rubric.questions.map((item) => `- ${item.id} | ${item.domain} | ${item.question}`),
  ].join('\n')).join('\n\n');
}
