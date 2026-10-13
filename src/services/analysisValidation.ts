import { getRubricForDesign } from '../constants/appraisalRubrics';
import { appraisalScore as calculateAppraisalScore } from './appraisalScore';
import type {
  AppraisalJudgment,
  AppraisalJudgmentValue,
  PicoElement,
  PicoExtraction,
  ArticleAnalysis,
  ArticleIdentifier,
  AssessmentAnswer,
  BiasItem,
  BiasSeverity,
  ConflictOfInterest,
  EvidenceCitation,
  MethodsScore,
  RawArticleData,
  StudyDesign,
  StudyDesignType,
} from '../types';

const DESIGN_TYPES: StudyDesignType[] = [
  'Systematic Review / Meta-Analysis',
  'Randomized Controlled Trial',
  'Quasi-Experimental',
  'Prospective Cohort',
  'Retrospective Cohort',
  'Case-Control',
  'Cross-Sectional',
  'Diagnostic Accuracy Study',
  'Case Report / Case Series',
  'Qualitative Study',
  'Basic Science / In Vitro',
  'Animal Study',
  'Editorial / Commentary',
  'Review Article',
  'Unknown',
];

const JUDGMENTS: AppraisalJudgmentValue[] = [
  'low',
  'some_concerns',
  'high',
  'unclear',
  'not_applicable',
];
const ANSWERS: AssessmentAnswer[] = ['yes', 'no', 'unclear', 'not_applicable'];

type AnyRecord = Record<string, unknown>;

function record(value: unknown, label: string): AnyRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`Analysis response is missing a valid ${label} object.`);
  }
  return value as AnyRecord;
}

function text(value: unknown, fallback: string, max = 4000): string {
  return typeof value === 'string' && value.trim()
    ? value.trim().slice(0, max)
    : fallback;
}

function optionalText(value: unknown, max = 1000): string | undefined {
  const result = typeof value === 'string' ? value.trim().slice(0, max) : '';
  return result || undefined;
}

function stringList(value: unknown, maxItems = 20, maxLength = 1000): string[] {
  return Array.isArray(value)
    ? value
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .slice(0, maxItems)
      .map((item) => item.trim().slice(0, maxLength))
    : [];
}

function answer(value: unknown): AssessmentAnswer {
  return ANSWERS.includes(value as AssessmentAnswer)
    ? value as AssessmentAnswer
    : 'unclear';
}

function normalizeForMatch(value: string): string {
  return value
    .normalize('NFKC')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function articleEvidenceText(article: RawArticleData): string {
  return [article.title, article.abstract, article.fullText ?? ''].join('\n');
}

function parseDesign(value: unknown): StudyDesignType {
  return DESIGN_TYPES.includes(value as StudyDesignType)
    ? value as StudyDesignType
    : 'Unknown';
}

function parseEvidence(raw: unknown, sourceText: string): EvidenceCitation[] {
  if (!Array.isArray(raw)) return [];
  const normalizedSource = normalizeForMatch(sourceText);
  const seen = new Set<string>();

  return raw.slice(0, 60).flatMap((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return [];
    const source = item as AnyRecord;
    const id = text(source.id, `evidence-${index + 1}`, 80).replace(/[^a-zA-Z0-9._-]/g, '-');
    if (seen.has(id)) return [];
    seen.add(id);
    const quote = text(source.quote, '', 350);
    if (quote.length < 8) return [];
    return [{
      id,
      claim: text(source.claim, 'Supporting article passage', 500),
      quote,
      section: optionalText(source.section, 120),
      location: optionalText(source.location, 160),
      verified: normalizedSource.includes(normalizeForMatch(quote)),
    }];
  });
}

function parsePicoElement(
  value: unknown,
  evidence: EvidenceCitation[],
  fallback: string,
): PicoElement {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value as AnyRecord : {};
  const evidenceIds = stringList(source.evidenceIds, 8, 80)
    .filter((id) => evidence.some((item) => item.id === id && item.verified));
  const rawStatus = source.status;
  const status = rawStatus === 'not_applicable'
    ? 'not_applicable'
    : rawStatus === 'identified' && evidenceIds.length
      ? 'identified'
      : 'not_reported';
  return {
    value: text(source.value, fallback, 1200),
    status,
    evidenceIds,
  };
}

function parsePico(value: unknown, evidence: EvidenceCitation[]): PicoExtraction {
  const source = value && typeof value === 'object' && !Array.isArray(value) ? value as AnyRecord : {};
  return {
    population: parsePicoElement(source.population, evidence, 'Population not reported in the supplied text.'),
    intervention: parsePicoElement(source.intervention, evidence, 'Intervention or exposure not reported in the supplied text.'),
    comparator: parsePicoElement(source.comparator, evidence, 'Comparator not reported in the supplied text.'),
    outcomes: parsePicoElement(source.outcomes, evidence, 'Primary outcomes not reported in the supplied text.'),
    timeframe: parsePicoElement(source.timeframe, evidence, 'Assessment timeframe not reported in the supplied text.'),
  };
}

function parseJudgments(
  raw: unknown,
  design: StudyDesignType,
  evidence: EvidenceCitation[],
): AppraisalJudgment[] {
  const rubric = getRubricForDesign(design);
  const rawItems = Array.isArray(raw) ? raw : [];
  const rawById = new Map<string, AnyRecord>();
  rawItems.forEach((item) => {
    if (item && typeof item === 'object' && !Array.isArray(item)) {
      const source = item as AnyRecord;
      if (typeof source.id === 'string') rawById.set(source.id, source);
    }
  });
  const verifiedIds = new Set(evidence.filter((item) => item.verified).map((item) => item.id));

  return rubric.questions.map((rubricQuestion) => {
    const source = rawById.get(rubricQuestion.id) ?? {};
    const evidenceIds = stringList(source.evidenceIds, 8, 80)
      .filter((id) => evidence.some((item) => item.id === id));
    let judgment = JUDGMENTS.includes(source.judgment as AppraisalJudgmentValue)
      ? source.judgment as AppraisalJudgmentValue
      : 'unclear';

    if (judgment !== 'not_applicable' && !evidenceIds.some((id) => verifiedIds.has(id))) {
      judgment = 'unclear';
    }

    return {
      id: rubricQuestion.id,
      framework: rubric.framework,
      domain: rubricQuestion.domain,
      question: rubricQuestion.question,
      judgment,
      rationale: text(
        source.rationale,
        'Unable to assess from the provided article text.',
        1200,
      ),
      evidenceIds,
    };
  });
}

function parseMethods(raw: unknown, judgments: AppraisalJudgment[]): MethodsScore {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as AnyRecord : {};
  const relevant = judgments.filter((item) => item.judgment !== 'not_applicable');
  const assessable = relevant.filter((item) => item.judgment !== 'unclear').length;
  const score = relevant.length ? Math.max(1, Math.round((assessable / relevant.length) * 9 + 1)) : 1;

  return {
    score,
    sampleSizeAdequate: answer(source.sampleSizeAdequate),
    sampleSizeExplanation: text(source.sampleSizeExplanation, 'Unable to assess from the provided text.'),
    statisticalMethodsUsed: stringList(source.statisticalMethodsUsed, 20, 200),
    hasPowerCalculation: answer(source.hasPowerCalculation),
    hasBlinding: answer(source.hasBlinding),
    blindingDetails: optionalText(source.blindingDetails),
    confoundingAddressed: answer(source.confoundingAddressed),
    confoundingMethod: optionalText(source.confoundingMethod),
    missingDataHandled: answer(source.missingDataHandled),
    missingDataMethod: optionalText(source.missingDataMethod),
    issues: stringList(source.issues),
    strengths: stringList(source.strengths),
    reportingFramework: optionalText(source.reportingFramework, 120),
    adheresToFramework: answer(source.adheresToFramework),
  };
}

function parseConflict(raw: unknown): ConflictOfInterest {
  const source = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw as AnyRecord : {};
  const declared = answer(source.declared);
  const rawStatus = source.status;
  const status = rawStatus === 'CLEAR' || rawStatus === 'DECLARED' || rawStatus === 'FLAGGED' || rawStatus === 'MISSING'
    ? rawStatus
    : declared === 'yes' ? 'DECLARED' : declared === 'no' ? 'MISSING' : 'MISSING';
  return {
    status,
    declared,
    fundingSource: optionalText(source.fundingSource),
    details: text(source.details, 'Unable to assess conflict-of-interest disclosures from the provided text.'),
    industryFunded: answer(source.industryFunded),
  };
}

function computeSourceCoverage(article: RawArticleData) {
  const availableCharacters = (article.fullText?.length ?? 0) || article.abstract.length;
  const analyzedCharacters = Math.min(availableCharacters, 80000);
  const references = article.references ?? [];
  const available = article.availableSections ?? [];
  const expected = ['abstract', 'methods', 'results', 'discussion', 'funding', 'conflicts', 'references'];
  return {
    level: article.fetchSource,
    analyzedCharacters,
    availableCharacters,
    wasTruncated: availableCharacters > analyzedCharacters,
    availableSections: available,
    missingSections: expected.filter((section) => !available.includes(section)),
    referenceCount: references.length,
    referencesWithIdentifiers: references.filter((ref) => ref.doi || ref.pmid).length,
    referencesResolved: references.filter((ref) => ref.identifierStatus === 'resolved').length,
    retrievalWarnings: article.retrievalWarnings ?? [],
    pdfPages: article.pdfPages,
    extractedTableCount: article.extractedTableCount,
    supplementLinks: article.supplementLinks,
  } as const;
}

function confidenceLabel(score: number): 'higher' | 'moderate' | 'lower' | 'insufficient' {
  if (score >= 8) return 'higher';
  if (score >= 6) return 'moderate';
  if (score >= 4) return 'lower';
  return 'insufficient';
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function buildArticleKey(article: RawArticleData): string {
  if (article.doi) return `doi:${article.doi.toLowerCase()}`;
  if (article.pmid) return `pmid:${article.pmid}`;
  if (article.pmcid) return `pmcid:${article.pmcid}`;
  return `title:${article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 120)}`;
}

function severityForJudgment(value: AppraisalJudgmentValue): BiasSeverity {
  if (value === 'high') return 'high';
  if (value === 'some_concerns') return 'moderate';
  return 'low';
}

export function buildAnalysisFromModel(
  raw: unknown,
  article: RawArticleData,
  identifier: ArticleIdentifier,
  analysisModel: string,
): ArticleAnalysis {
  const parsed = record(raw, 'analysis');
  const rawStudy = record(parsed.studyDesign, 'studyDesign');
  const design = parseDesign(rawStudy.type);
  const rubric = getRubricForDesign(design);
  const sourceText = articleEvidenceText(article);
  const evidence = parseEvidence(parsed.evidence, sourceText);
  const pico = parsePico(parsed.pico, evidence);
  const judgments = parseJudgments(parsed.judgments, design, evidence);
  const sourceCoverage = computeSourceCoverage(article);
  const verifiedEvidence = evidence.filter((item) => item.verified);
  const assessableJudgments = judgments.filter((item) => item.judgment !== 'unclear' && item.judgment !== 'not_applicable');
  const appraisalScore = calculateAppraisalScore(article.fetchSource, evidence, judgments).score;
  const appraisalLabel = confidenceLabel(appraisalScore);

  const riskValues = judgments.filter((item) => item.judgment !== 'not_applicable');
  const riskPenalty = riskValues.reduce((sum, item) => {
    if (item.judgment === 'high') return sum + 3;
    if (item.judgment === 'some_concerns') return sum + 1.5;
    if (item.judgment === 'unclear') return sum + 1;
    return sum;
  }, 0);
  const riskScore = assessableJudgments.length ? Math.max(1, Math.min(10, Math.round(10 - riskPenalty))) : 1;
  const highCount = riskValues.filter((item) => item.judgment === 'high').length;
  const concernCount = riskValues.filter((item) => item.judgment === 'some_concerns').length;
  const unclearCount = riskValues.filter((item) => item.judgment === 'unclear').length;
  const overallRisk = highCount > 0 ? 'high' : concernCount > 0 ? 'some_concerns' : unclearCount > 0 || !assessableJudgments.length ? 'unclear' : 'low';

  const summarySource = record(parsed.summary, 'summary');
  const studyDesign: StudyDesign = {
    type: design,
    designRationale: text(rawStudy.designRationale, 'The study design could not be confidently determined from the provided text.'),
    appraisalFramework: rubric.framework,
    isPreregistered: answer(rawStudy.isPreregistered) === 'yes'
      ? 'yes'
      : answer(rawStudy.isPreregistered) === 'no' ? 'no' : 'unclear',
    registrationId: optionalText(rawStudy.registrationId, 120),
  };
  const strengths = judgments
    .filter((item) => item.judgment === 'low')
    .map((item) => `${item.domain}: ${item.rationale}`);
  const weaknesses = judgments
    .filter((item) => item.judgment === 'some_concerns' || item.judgment === 'unclear')
    .map((item) => `${item.domain}: ${item.rationale}`);
  const redFlags = judgments
    .filter((item) => item.judgment === 'high')
    .map((item) => `${item.domain}: ${item.rationale}`);
  const biasesFound: BiasItem[] = judgments
    .filter((item) => item.judgment === 'high' || item.judgment === 'some_concerns')
    .map((item) => ({
      type: item.domain,
      severity: severityForJudgment(item.judgment),
      explanation: item.rationale,
    }));
  const methodsScore = parseMethods(parsed.methods, judgments);
  const conflictOfInterest = parseConflict(parsed.conflictOfInterest);
  const references = article.references ?? [];
  const resolvedIdentifiers = references.filter((ref) => ref.identifierStatus === 'resolved').length;
  const referencesWithIdentifiers = references.filter((ref) => ref.doi || ref.pmid).length;
  const retractionNoticesFound = references.filter((ref) => ref.retractionStatus === 'notice_found').length;
  const referenceStatus = references.length === 0
    ? 'NOT_ASSESSED'
    : resolvedIdentifiers === referencesWithIdentifiers && referencesWithIdentifiers === references.length
      ? 'RESOLVED'
      : 'PARTIAL';

  const limitations = stringList(parsed.limitations, 20, 1200);
  if (article.fetchSource !== 'full_text') {
    limitations.unshift('This appraisal is based on an abstract or metadata, not the complete article. Many domains remain unable to assess.');
  }
  if (evidence.some((item) => !item.verified)) {
    limitations.push('One or more generated quotations could not be matched to the supplied article text and were excluded from determinate judgments.');
  }

  const rawOverall = parsed.overallAssessment && typeof parsed.overallAssessment === 'object'
    ? parsed.overallAssessment as AnyRecord
    : {};
  const overallConfidence = article.fetchSource !== 'full_text' && appraisalLabel !== 'insufficient'
    ? 'lower'
    : appraisalLabel;

  return {
    id: generateId(),
    analyzedAt: new Date().toISOString(),
    article,
    identifier,
    studyDesign,
    summary: {
      oneLiner: text(summarySource.oneLiner, 'No supported plain-language summary was returned.'),
      whatTheyDid: stringList(summarySource.whatTheyDid, 8),
      whatTheyFound: stringList(summarySource.whatTheyFound, 8),
      whyItMatters: text(summarySource.whyItMatters, 'The significance could not be assessed from the supplied text.'),
      whoShouldCare: text(summarySource.whoShouldCare, 'Readers evaluating this research question.'),
      bottomLine: text(summarySource.bottomLine, 'Review the source text and domain judgments before using these findings.'),
    },
    evidenceScore: {
      score: appraisalScore,
      label: overallConfidence,
      strengths,
      weaknesses,
      redFlags,
    },
    riskOfBias: {
      score: riskScore,
      overallRisk,
      biasesFound,
      positivePractices: strengths,
      overallReasoning: highCount > 0
        ? `${highCount} domain${highCount === 1 ? '' : 's'} had high risk concerns in this structured appraisal.`
        : concernCount > 0
          ? `${concernCount} domain${concernCount === 1 ? '' : 's'} had some concerns; no domain was assigned high risk from verified evidence.`
          : unclearCount > 0
            ? `${unclearCount} domain${unclearCount === 1 ? '' : 's'} could not be assessed from the supplied text.`
            : !assessableJudgments.length ? 'No domain could be assessed. This is not a low-risk finding.'
            : 'No material concern was identified in the assessable domains. This is not proof that the paper is free of bias.',
    },
    methodsScore,
    referenceCheck: {
      status: referenceStatus,
      totalReferences: references.length,
      referencesWithIdentifiers,
      resolvedIdentifiers,
      retractionNoticesFound,
      issues: references.length === 0 ? ['The supplied source did not include a structured reference list.'] : [],
      indexingProblems: references
        .filter((ref) => (ref.doi || ref.pmid) && ref.identifierStatus === 'unresolved')
        .slice(0, 20)
        .map((ref) => `Identifier could not be resolved: ${ref.doi ?? ref.pmid}`),
      positives: resolvedIdentifiers > 0 ? [`${resolvedIdentifiers} reference identifier${resolvedIdentifiers === 1 ? '' : 's'} resolved through an authoritative index.`] : [],
    },
    conflictOfInterest,
    limitations,
    verdict: {
      confidence: overallConfidence,
      applicability: 'not_assessed',
      readingPriority: article.fetchSource === 'metadata_only' ? 'low' : design === 'Randomized Controlled Trial' || design === 'Systematic Review / Meta-Analysis' ? 'high' : 'medium',
      overallSummary: `${assessableJudgments.length} of ${judgments.length} domains have determinate judgments supported by matched passages; ${unclearCount} remain unclear. Text matching does not establish that a passage supports the model's interpretation.`,
      keyTakeaway: !assessableJudgments.length ? 'This response does not supply enough matched evidence for a substantive domain appraisal. Review the source or request a new response.' : 'Review the domain judgments and their source passages before relying on the generated narrative.',
      caveats: stringList(rawOverall.caveats, 12).concat(limitations.slice(0, 3)),
    },
    appraisal: {
      rubricId: rubric.id,
      rubricVersion: rubric.version,
      evidence,
      judgments,
      sourceCoverage,
      invalidEvidenceCount: evidence.filter((item) => !item.verified).length,
    },
    pico,
    analysisModel,
    analysisVersion: '4.1.0',
    articleKey: buildArticleKey(article),
    revision: 1,
    tags: [],
    feedback: [],
  };
}
