// ─── Article Source / Identifier ─────────────────────────────────────────────

export type SourceType =
  | 'pubmed'
  | 'pmc'
  | 'doi'
  | 'nature'
  | 'nejm'
  | 'lancet'
  | 'jama'
  | 'biorxiv'
  | 'medrxiv'
  | 'arxiv'
  | 'springer'
  | 'unknown';

export interface ArticleIdentifier {
  pmid?: string;
  pmcid?: string;
  doi?: string;
  arxivId?: string;
  sourceType: SourceType;
  originalUrl: string;
}

// ─── Raw Article Data (before analysis) ──────────────────────────────────────

export type SourceCoverageLevel = 'full_text' | 'abstract_only' | 'metadata_only';

export interface ArticleReference {
  raw: string;
  doi?: string;
  pmid?: string;
  identifierStatus: 'resolved' | 'unresolved' | 'not_checked';
  title?: string;
  retractionStatus: 'no_notice_found' | 'notice_found' | 'not_checked';
}

export interface SourceCoverage {
  level: SourceCoverageLevel;
  analyzedCharacters: number;
  availableCharacters: number;
  wasTruncated: boolean;
  availableSections: string[];
  missingSections: string[];
  referenceCount: number;
  referencesWithIdentifiers: number;
  referencesResolved: number;
  retrievalWarnings: string[];
  pdfPages?: number;
  extractedTableCount?: number;
  supplementLinks?: string[];
}

export interface RawArticleData {
  title: string;
  authors: string[];
  journal: string;
  year: number | null;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  pmid?: string;
  pmcid?: string;
  abstract: string;
  fullText?: string;
  references?: ArticleReference[];
  keywords?: string[];
  fetchSource: SourceCoverageLevel;
  availableSections?: string[];
  retrievalWarnings?: string[];
  sourceUrls?: string[];
  retractionStatus?: 'no_notice_found' | 'notice_found' | 'not_checked';
  pdfPages?: number;
  extractedTableCount?: number;
  supplementLinks?: string[];
  isPreprint: boolean;
}

// ─── Study Design ─────────────────────────────────────────────────────────────

export type StudyDesignType =
  | 'Systematic Review / Meta-Analysis'
  | 'Randomized Controlled Trial'
  | 'Quasi-Experimental'
  | 'Prospective Cohort'
  | 'Retrospective Cohort'
  | 'Case-Control'
  | 'Cross-Sectional'
  | 'Diagnostic Accuracy Study'
  | 'Case Report / Case Series'
  | 'Qualitative Study'
  | 'Basic Science / In Vitro'
  | 'Animal Study'
  | 'Editorial / Commentary'
  | 'Review Article'
  | 'Unknown';

export interface StudyDesign {
  type: StudyDesignType;
  designRationale: string;
  appraisalFramework: string;
  isPreregistered: 'yes' | 'no' | 'unclear';
  registrationId?: string;
}

// ─── Summary ──────────────────────────────────────────────────────────────────

export interface ArticleSummary {
  oneLiner: string;
  whatTheyDid: string[];
  whatTheyFound: string[];
  whyItMatters: string;
  whoShouldCare: string;
  bottomLine: string;
}

// ─── Evidence-grounded appraisal ─────────────────────────────────────────────

export interface EvidenceConfidenceScore {
  score: number; // 1–10
  label: 'higher' | 'moderate' | 'lower' | 'insufficient';
  strengths: string[];
  weaknesses: string[];
  redFlags: string[];
}

// ─── Bias Assessment ──────────────────────────────────────────────────────────

export type BiasSeverity = 'low' | 'moderate' | 'high' | 'critical';

export interface BiasItem {
  type: string;
  severity: BiasSeverity;
  explanation: string;
}

export interface RiskOfBiasAssessment {
  score: number; // 1–10 (10 = least biased)
  overallRisk: 'low' | 'some_concerns' | 'high' | 'unclear';
  biasesFound: BiasItem[];
  positivePractices: string[]; // things they did RIGHT to reduce bias
  overallReasoning: string;
}

// ─── Methods Assessment ───────────────────────────────────────────────────────

export type AssessmentAnswer = 'yes' | 'no' | 'unclear' | 'not_applicable';

export interface MethodsScore {
  score: number; // 1–10
  sampleSizeAdequate: AssessmentAnswer;
  sampleSizeExplanation: string;
  statisticalMethodsUsed: string[];
  hasPowerCalculation: AssessmentAnswer;
  hasBlinding: AssessmentAnswer;
  blindingDetails?: string;
  confoundingAddressed: AssessmentAnswer;
  confoundingMethod?: string;
  missingDataHandled: AssessmentAnswer;
  missingDataMethod?: string;
  issues: string[];
  strengths: string[];
  reportingFramework?: string; // CONSORT, STROBE, PRISMA, etc.
  adheresToFramework?: AssessmentAnswer;
}

// ─── Reference Check ──────────────────────────────────────────────────────────

export type RefCheckStatus = 'RESOLVED' | 'PARTIAL' | 'NOT_ASSESSED';

export interface ReferenceCheck {
  status: RefCheckStatus;
  totalReferences: number;
  referencesWithIdentifiers: number;
  resolvedIdentifiers: number;
  retractionNoticesFound: number;
  issues: string[];
  indexingProblems: string[];
  positives: string[];
}

// ─── Conflict of Interest ─────────────────────────────────────────────────────

export type COIStatus = 'CLEAR' | 'DECLARED' | 'FLAGGED' | 'MISSING';

export interface ConflictOfInterest {
  status: COIStatus;
  declared: AssessmentAnswer;
  fundingSource?: string;
  details: string;
  industryFunded: AssessmentAnswer;
}

export type AppraisalJudgmentValue =
  | 'low'
  | 'some_concerns'
  | 'high'
  | 'unclear'
  | 'not_applicable';

export interface EvidenceCitation {
  id: string;
  claim: string;
  quote: string;
  section?: string;
  location?: string;
  verified: boolean;
}

export type PicoStatus = 'identified' | 'not_reported' | 'not_applicable';

export interface PicoElement {
  value: string;
  status: PicoStatus;
  evidenceIds: string[];
}

export interface PicoExtraction {
  population: PicoElement;
  intervention: PicoElement;
  comparator: PicoElement;
  outcomes: PicoElement;
  timeframe: PicoElement;
}

export interface JudgmentFeedback {
  id: string;
  judgmentId: string;
  rating: 'agree' | 'disagree' | 'unsure';
  suggestedJudgment?: AppraisalJudgmentValue;
  note?: string;
  createdAt: string;
  analysisVersion: string;
}

export interface AppraisalJudgment {
  id: string;
  framework: string;
  domain: string;
  question: string;
  judgment: AppraisalJudgmentValue;
  rationale: string;
  evidenceIds: string[];
}

export interface StructuredAppraisal {
  rubricId: string;
  rubricVersion: string;
  evidence: EvidenceCitation[];
  judgments: AppraisalJudgment[];
  sourceCoverage: SourceCoverage;
  invalidEvidenceCount: number;
}

// ─── Overall assessment ───────────────────────────────────────────────────────

export interface OverallVerdict {
  confidence: 'higher' | 'moderate' | 'lower' | 'insufficient';
  applicability: 'not_assessed' | 'unclear' | 'potentially_relevant';
  readingPriority: 'high' | 'medium' | 'low';
  overallSummary: string;
  keyTakeaway: string;
  caveats: string[];
}

// ─── Full Analysis Result ─────────────────────────────────────────────────────

export interface ArticleAnalysis {
  id: string;
  analyzedAt: string; // ISO date string
  article: RawArticleData;
  identifier: ArticleIdentifier;
  studyDesign: StudyDesign;
  summary: ArticleSummary;
  evidenceScore: EvidenceConfidenceScore;
  riskOfBias: RiskOfBiasAssessment;
  methodsScore: MethodsScore;
  referenceCheck: ReferenceCheck;
  conflictOfInterest: ConflictOfInterest;
  limitations: string[];
  verdict: OverallVerdict;
  appraisal: StructuredAppraisal;
  pico?: PicoExtraction;
  analysisModel: string;
  analysisVersion: string;
  articleKey: string;
  revision: number;
  collection?: string;
  tags?: string[];
  notes?: string;
  feedback?: JudgmentFeedback[];
}

// ─── AI Provider ──────────────────────────────────────────────────────────────

export type AIProvider = 'claude' | 'openai' | 'gemini' | 'openrouter';

export type ClaudeModel = string;
export type OpenAIModel = string;
export type GeminiModel = string;

// ─── App Settings ─────────────────────────────────────────────────────────────

export interface AppSettings {
  // Active provider
  aiProvider: AIProvider;

  // Claude (Anthropic)
  claudeApiKey: string;
  claudeModel: ClaudeModel;

  // OpenAI
  openAiApiKey: string;
  openAiModel: OpenAIModel;

  // Google Gemini
  geminiApiKey: string;
  geminiModel: GeminiModel;

  // User-authorized OpenRouter access (never cloud-synced).
  openRouterApiKey: string;
  openRouterModel: string;

  // Article fetching
  unpaywallEmail: string;
  saveHistory: boolean;
}

// ─── History Entry ────────────────────────────────────────────────────────────

export interface HistoryEntry {
  id: string;
  title: string;
  journal: string;
  year: number | null;
  url: string;
  analyzedAt: string;
  evidenceScore: number;
  biasConcernScore: number;
  studyDesign: string;
  confidence: OverallVerdict['confidence'];
  coverageLevel: SourceCoverageLevel;
  collection?: string;
  tags?: string[];
}

// ─── Fetch State ──────────────────────────────────────────────────────────────

export type FetchStatus =
  | 'idle'
  | 'parsing_url'
  | 'fetching_article'
  | 'analyzing'
  | 'done'
  | 'error';

export interface FetchState {
  status: FetchStatus;
  message: string;
  progress: number; // 0–100
  error?: string;
}
