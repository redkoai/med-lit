export const ANALYSIS_SYSTEM_PROMPT = `You are an expert biomedical research analyst with deep expertise in:
- Epidemiology and biostatistics
- Clinical research methodology (RCTs, cohort studies, systematic reviews, meta-analyses)
- Cochrane Risk of Bias 2 (RoB 2) and ROBINS-I tools
- CONSORT, STROBE, PRISMA 2020, STARD, ARRIVE 2.0 reporting frameworks
- EQUATOR Network standards, ICMJE guidelines
- Oxford CEBM Levels of Evidence
- Medical literature critical appraisal

Your task is to critically appraise a scientific article and return a structured JSON analysis.

CRITICAL RULES:
1. Base ALL scores and reasoning STRICTLY on the provided article text. Never invent data.
2. If information is not available in the text, explicitly state "Not reported" or "Unable to assess from provided text."
3. Every score must be accompanied by specific evidence from the text.
4. Be calibrated: a typical Nature Medicine RCT should score ~7.5/10 accuracy, ~7/10 bias. Reserve 9-10 for truly exceptional work.
5. Output ONLY valid JSON. No markdown, no preamble, no commentary outside the JSON object.`;

export function buildAnalysisPrompt(articleText: string, isFullText: boolean): string {
  const textLabel = isFullText ? 'FULL TEXT' : 'ABSTRACT + METADATA';

  return `Analyze the following scientific article (${textLabel}) and return a comprehensive critical appraisal as a JSON object.

ARTICLE TEXT:
---
${articleText}
---

Return EXACTLY this JSON structure (all fields required; use null for genuinely unknown values):

{
  "studyDesign": {
    "type": "<one of: Systematic Review / Meta-Analysis | Randomized Controlled Trial | Quasi-Experimental | Prospective Cohort | Retrospective Cohort | Case-Control | Cross-Sectional | Case Report / Case Series | Qualitative Study | Basic Science / In Vitro | Animal Study | Editorial / Commentary | Review Article | Unknown>",
    "cebtLevel": <1|2|3|4|5>,
    "cebtDescription": "<brief description of why this CEBM level>",
    "isPreregistered": <true|false>,
    "registrationId": "<e.g. NCT01234567, PROSPERO CRD42021..., or null>"
  },
  "summary": {
    "oneLiner": "<one sentence plain-English summary of the entire paper>",
    "whatTheyDid": ["<method/approach point 1>", "<point 2>", "<point 3>"],
    "whatTheyFound": ["<key finding 1>", "<key finding 2>", "<key finding 3>"],
    "whyItMatters": "<1-2 sentences on clinical/scientific significance>",
    "whoShouldCare": "<who is the target audience: clinicians, researchers, policymakers, patients>",
    "bottomLine": "<practical takeaway in plain English>"
  },
  "accuracyScore": {
    "score": <1-10>,
    "grade": "<A+|A|B+|B|C|D|F>",
    "strengths": ["<specific strength cited from text>", ...],
    "weaknesses": ["<specific weakness cited from text>", ...],
    "redFlags": ["<any red flags like p-hacking, HARKing, endpoint switching>"]
  },
  "biasScore": {
    "score": <1-10, where 10=least biased>,
    "overallRisk": "<low|moderate|high|critical>",
    "biasesFound": [
      {
        "type": "<bias type name>",
        "severity": "<low|moderate|high|critical>",
        "explanation": "<specific explanation citing text evidence>"
      }
    ],
    "positivePractices": ["<things they did right to reduce bias>"],
    "overallReasoning": "<2-3 sentence summary of bias assessment>"
  },
  "methodsScore": {
    "score": <1-10>,
    "sampleSizeAdequate": <true|false|null>,
    "sampleSizeExplanation": "<explain why adequate or not, cite n reported>",
    "statisticalMethodsUsed": ["<method 1>", "<method 2>"],
    "hasPowerCalculation": <true|false>,
    "hasBlinding": <true|false|null>,
    "blindingDetails": "<who was blinded, or null>",
    "confoundingAddressed": <true|false>,
    "confoundingMethod": "<e.g. multivariable regression, propensity matching, or null>",
    "missingDataHandled": <true|false|null>,
    "missingDataMethod": "<e.g. multiple imputation, complete case analysis, or null>",
    "issues": ["<issue 1>", ...],
    "strengths": ["<strength 1>", ...],
    "reportingFramework": "<CONSORT|STROBE|PRISMA|STARD|ARRIVE|none|unknown>",
    "adheresToFramework": <true|false|null>
  },
  "referenceCheck": {
    "status": "<PASS|WARN|FAIL>",
    "totalReferences": <number or 0 if unknown>,
    "selfCitationRate": <0.0-1.0 or null>,
    "issues": ["<any citation indexing issues>"],
    "indexingProblems": ["<any specific problems with reference numbering or citation-claim mismatches>"],
    "positives": ["<good citation practices noted>"]
  },
  "conflictOfInterest": {
    "status": "<CLEAR|DECLARED|FLAGGED|MISSING>",
    "declared": <true|false>,
    "fundingSource": "<funding source or null>",
    "details": "<specific details about COI situation>",
    "industryFunded": <true|false>
  },
  "limitations": [
    "<limitation 1 — from the authors OR identified by you>",
    "<limitation 2>",
    "<limitation 3>"
  ],
  "verdict": {
    "trustworthy": <true|false>,
    "clinicallyApplicable": <true|false>,
    "readWorthy": <true|false>,
    "overallSummary": "<2-3 sentence overall assessment>",
    "keyTakeaway": "<single most important thing to know about this paper>",
    "caveats": ["<key caveat when using/citing this paper>"]
  }
}`;
}

export const EXTRACTION_SYSTEM_PROMPT = `You are a scientific article data extractor. Your task is to extract structured metadata from raw article HTML or XML. Return only the requested JSON fields. If a field is not available, use null.`;

export function buildExtractionPrompt(rawContent: string): string {
  return `Extract metadata from this scientific article content and return JSON:

CONTENT:
---
${rawContent.slice(0, 15000)}
---

Return this exact JSON:
{
  "title": "<article title or null>",
  "authors": ["<Author Name>", ...],
  "journal": "<journal name or null>",
  "year": <year number or null>,
  "volume": "<volume or null>",
  "issue": "<issue or null>",
  "doi": "<doi without https://doi.org prefix, or null>",
  "abstract": "<full abstract text or null>",
  "keywords": ["<keyword>", ...],
  "references": ["<reference 1 full citation>", ...],
  "hasMethods": <true if methods section present>,
  "hasResults": <true if results section present>,
  "fullTextAvailable": <true if full methods/results text was provided>
}`;
}
