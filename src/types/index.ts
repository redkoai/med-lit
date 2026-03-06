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
  | 'scihub'
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
  references?: string[];
  keywords?: string[];
  fetchSource: 'full_text' | 'abstract_only' | 'metadata_only';
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
  | 'Case Report / Case Series'
  | 'Qualitative Study'
  | 'Basic Science / In Vitro'
  | 'Animal Study'
  | 'Editorial / Commentary'
  | 'Review Article'
  | 'Unknown';

export interface StudyDesign {
  type: StudyDesignType;
  cebtLevel: 1 | 2 | 3 | 4 | 5;
  cebtDescription: string;
  isPreregistered: boolean;
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

// ─── Accuracy Score ───────────────────────────────────────────────────────────

export interface AccuracyScore {
  score: number; // 1–10
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'F';
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

export interface BiasScore {
  score: number; // 1–10 (10 = least biased)
  overallRisk: 'low' | 'moderate' | 'high' | 'critical';
  biasesFound: BiasItem[];
  positivePractices: string[]; // things they did RIGHT to reduce bias
  overallReasoning: string;
}

// ─── Methods Assessment ───────────────────────────────────────────────────────

export interface MethodsScore {
  score: number; // 1–10
  sampleSizeAdequate: boolean;
  sampleSizeExplanation: string;
  statisticalMethodsUsed: string[];
  hasPowerCalculation: boolean;
  hasBlinding: boolean;
  blindingDetails?: string;
  confoundingAddressed: boolean;
  confoundingMethod?: string;
  missingDataHandled: boolean;
  missingDataMethod?: string;
  issues: string[];
  strengths: string[];
  reportingFramework?: string; // CONSORT, STROBE, PRISMA, etc.
  adheresToFramework?: boolean;
}

// ─── Reference Check ──────────────────────────────────────────────────────────

export type RefCheckStatus = 'PASS' | 'WARN' | 'FAIL';

export interface ReferenceCheck {
  status: RefCheckStatus;
  totalReferences: number;
  selfCitationRate?: number; // 0–1
  issues: string[];
  indexingProblems: string[];
  positives: string[];
}

// ─── Conflict of Interest ─────────────────────────────────────────────────────

export type COIStatus = 'CLEAR' | 'DECLARED' | 'FLAGGED' | 'MISSING';

export interface ConflictOfInterest {
  status: COIStatus;
  declared: boolean;
  fundingSource?: string;
  details: string;
  industryFunded: boolean;
}

// ─── Overall Verdict ──────────────────────────────────────────────────────────

export interface OverallVerdict {
  trustworthy: boolean;
  clinicallyApplicable: boolean;
  readWorthy: boolean;
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
  accuracyScore: AccuracyScore;
  biasScore: BiasScore;
  methodsScore: MethodsScore;
  referenceCheck: ReferenceCheck;
  conflictOfInterest: ConflictOfInterest;
  limitations: string[];
  verdict: OverallVerdict;
  analysisModel: string;
  analysisVersion: string;
}

// ─── AI Provider ──────────────────────────────────────────────────────────────

export type AIProvider = 'claude' | 'openai' | 'gemini';

export type ClaudeModel = 'claude-sonnet-4-6' | 'claude-opus-4-6';
export type OpenAIModel = 'gpt-4o' | 'gpt-4o-mini' | 'gpt-4-turbo';
export type GeminiModel = 'gemini-2.0-flash' | 'gemini-1.5-pro';

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

  // Article fetching
  unpaywallEmail: string;
  sciHubEnabled: boolean;
  sciHubMirror: string;
  corsProxyUrl: string;
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
  accuracyScore: number;
  biasScore: number;
  studyDesign: string;
  trustworthy: boolean;
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
