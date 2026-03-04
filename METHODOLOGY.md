# MedLit — Scientific Literature Analysis Methodology

**Version:** 1.0
**Date:** March 2026
**Purpose:** This document describes the scoring frameworks, bias detection methods, reference-checking algorithms, and AI pipeline used by MedLit to critically appraise scientific articles.

---

## 1. Overview

MedLit produces **eight scored dimensions** for every analyzed article:

| Dimension | Scale | Framework Basis |
|---|---|---|
| Plain Language Summary | — | NLM Health Literacy Guidelines |
| Accuracy Rating | 1–10 | Internal consistency + methodology fit |
| Bias Risk Rating | 1–10 (10 = least biased) | Cochrane RoB 2, ROBINS-I, NOS, STROBE |
| Reference Index Check | PASS / WARN / FAIL | Citation–claim mapping |
| Study Design Quality | Tier 1–5 | Oxford CEBM Levels of Evidence |
| Statistical Methods | 1–10 | EQUATOR, ICMJE, NEJM statistical standards |
| Conflict of Interest | FLAG / CLEAR | ICMJE COI Disclosure Standard |
| Limitations | Enumerated | EQUATOR reporting frameworks |

All scores are produced by a **structured Claude prompt** (claude-sonnet-4-6 or claude-opus-4-6) given the article's full text or abstract plus metadata. Every score is accompanied by a **chain-of-thought rationale** that cites specific passages from the article. The model is explicitly instructed not to hallucinate findings beyond what the text supports.

---

## 2. Study Design Classification

Before bias or accuracy scoring, the article is classified by study design using the **Oxford Centre for Evidence-Based Medicine (CEBM) Levels of Evidence (2011 edition)**.

| CEBM Level | Study Type | Description |
|---|---|---|
| 1a | Systematic Review of RCTs | Homogenous SR of RCTs |
| 1b | Individual RCT | Well-designed RCT with narrow CI |
| 2a | Systematic Review of Cohort Studies | Homogenous SR of inception cohort studies |
| 2b | Individual Cohort Study | Prospective, well-designed cohort |
| 2c | Outcomes Research | "Bottom of ladder" cohort |
| 3a | Systematic Review of Case-Control | Homogenous SR of case-control studies |
| 3b | Individual Case-Control | Individually matched |
| 4 | Case Series / Poor Cohort | Poor quality cohort or case-control |
| 5 | Expert Opinion | Without explicit critical appraisal |

The study type is used to calibrate the **expected level of bias** and to contextualize the accuracy score. A case series is not penalized for lacking randomization, but is flagged accordingly.

### Special Study Types
- **Meta-Analysis / Systematic Review**: Evaluated using PRISMA 2020 checklist
- **Randomized Controlled Trial**: Evaluated using CONSORT 2010 checklist
- **Observational Study (cohort/case-control/cross-sectional)**: Evaluated using STROBE checklist
- **Diagnostic Accuracy Study**: Evaluated using STARD 2015 checklist
- **Animal Study / Basic Science**: Evaluated using ARRIVE 2.0 guidelines
- **Preprint (bioRxiv / medRxiv / arXiv)**: Flagged prominently as not peer-reviewed

---

## 3. Accuracy Score (1–10)

The **Accuracy Score** reflects internal scientific rigor — how well the study's conclusions are supported by its design, data, and analysis.

### Scoring Rubric

| Score | Grade | Criteria |
|---|---|---|
| 9–10 | A+ | Pre-registered, adequate power, appropriate stats, conservative interpretation, all limitations disclosed |
| 8 | A | Minor methodological gaps that don't affect core conclusions |
| 7 | B+ | Some methodological concerns, conclusions mostly supported |
| 6 | B | Notable methodological weaknesses; conclusions partly supported |
| 5 | C | Significant issues; conclusions tentative |
| 3–4 | D | Major flaws; conclusions unreliable |
| 1–2 | F | Fundamental errors; conclusions not supported by data |

### Key Accuracy Factors Assessed
1. **Pre-registration** — Was the study registered before data collection? (ClinicalTrials.gov, PROSPERO, OSF)
2. **Sample size / statistical power** — Is there a power calculation? Was the sample size adequate?
3. **Primary outcome alignment** — Do the results address the stated primary outcome, or do they shift focus post-hoc (HARKing)?
4. **Multiple comparisons** — Are p-values adjusted for multiple testing (Bonferroni, FDR)?
5. **Effect size reporting** — Are effect sizes (not just p-values) reported? Are confidence intervals provided?
6. **Reproducibility** — Is data/code available? Are methods described in enough detail to replicate?
7. **Generalizability** — Are the population and setting appropriate to the conclusion?
8. **Causal language** — Does the paper claim causation from observational data?

---

## 4. Bias Risk Rating (1–10)

The **Bias Rating** reflects the degree to which systematic errors may have distorted the study results. **10 = least biased**, **1 = severely biased**.

### Bias Detection Frameworks Applied

#### 4.1 For RCTs: Cochrane Risk of Bias Tool 2 (RoB 2)
Seven domains assessed:
1. Randomization process
2. Deviations from intended interventions
3. Missing outcome data
4. Measurement of the outcome
5. Selection of the reported result (outcome reporting bias)
6. Baseline imbalance
7. Blinding adequacy

#### 4.2 For Non-Randomized Studies: ROBINS-I
Seven domains:
1. Confounding
2. Selection of participants
3. Classification of interventions
4. Deviations from intended interventions
5. Missing data
6. Measurement of outcomes
7. Selection of the reported result

#### 4.3 For Observational Studies: Newcastle-Ottawa Scale (NOS)
Three domains:
- Selection of study groups (max 4 stars)
- Comparability of groups (max 2 stars)
- Ascertainment of outcome (max 3 stars)

### Common Bias Types Flagged

| Bias Type | Description | Detection Signal |
|---|---|---|
| **Selection Bias** | Non-representative sample | Convenience sampling, volunteer effect, loss to follow-up > 20% |
| **Confirmation Bias** | Favoring hypothesis-supporting evidence | Selective reporting, post-hoc endpoint changes |
| **Attrition Bias** | Systematic dropout differences | ITT not used, > 20% missing data |
| **Detection Bias** | Different outcome assessment | Unblinded outcome assessors |
| **Performance Bias** | Differences in care beyond intervention | Unblinded participants/providers |
| **Reporting Bias** | Selective reporting of outcomes | Mismatch with registered protocol |
| **Publication Bias** | Only significant results published | Funnel plot asymmetry in meta-analyses |
| **Industry Bias** | Funder influence | Industry-funded with favorable results |
| **Recall Bias** | Retrospective data quality | Self-report in case-control studies |
| **Confounding** | Unmeasured third variables | Observational design without adequate adjustment |
| **P-hacking** | Multiple testing without correction | Suspicious pattern of p ≈ 0.04-0.05 |
| **HARKing** | Hypothesizing After Results Known | Retrospective framing of exploratory findings as confirmatory |

### Bias Score Mapping

| Score | Interpretation |
|---|---|
| 9–10 | Low risk across all domains |
| 7–8 | Low-moderate risk; minor concerns |
| 5–6 | Moderate risk; some domains unclear |
| 3–4 | High risk in multiple domains |
| 1–2 | Critical bias; results unreliable |

---

## 5. Statistical Methods Assessment (1–10)

Evaluated against EQUATOR Network standards, ICMJE statistical guidelines, and NEJM statistical reporting policies.

### Checklist
- [ ] Appropriate test for data type (parametric vs. non-parametric)
- [ ] Normality tested or assumed (with justification)
- [ ] Both p-values AND confidence intervals reported
- [ ] Effect sizes reported (Cohen's d, OR, RR, HR, etc.)
- [ ] Multiple comparisons corrected (if applicable)
- [ ] Interaction terms tested for subgroups
- [ ] Survival analyses: Kaplan-Meier + log-rank + Cox PH assumptions checked
- [ ] Regression: assumptions checked, VIF for multicollinearity
- [ ] Power calculation reported (a priori or post-hoc noted)
- [ ] Missing data: mechanism stated (MCAR/MAR/MNAR), handling method reported

### Score Mapping

| Score | Description |
|---|---|
| 9–10 | All applicable methods appropriate; full reporting |
| 7–8 | Minor statistical gaps (e.g., CIs missing for one outcome) |
| 5–6 | Notable issues (e.g., parametric test on non-normal data) |
| 3–4 | Substantial problems (e.g., no correction for multiple comparisons, p-value-only reporting) |
| 1–2 | Fundamental statistical errors invalidating main results |

---

## 6. Reference Index Check

### Method
The AI model scans the article text for **citation–claim pairs** — specific claims that reference one or more numbered citations. It then checks:

1. **Index Consistency** — Are citation numbers used in a logical, sequential manner without gaps or duplicates that suggest editorial errors?
2. **Claim–Reference Plausibility** — Does the referenced citation plausibly support the claim being made? (Based on citation title/abstract when available.)
3. **Self-Citation Rate** — What proportion of references are the authors' own prior work? (> 30% flagged)
4. **Citation Diversity** — Are opposing or null-result studies cited?
5. **Recency** — Are older foundational references balanced with recent work?
6. **Reference Count** — Is the number of references appropriate for the study type?

### Status Flags
- **PASS**: No indexing issues detected; citations appear to support stated claims
- **WARN**: Minor inconsistencies detected (e.g., off-by-one numbering, 1–2 questionable citations)
- **FAIL**: Multiple indexing errors, claims that don't match cited sources, or systematic problems

### Note
Full reference checking (verifying actual cited paper content) is limited to what is available in the full text and metadata. Deep verification of every cited source is beyond the current scope.

---

## 7. Conflict of Interest Detection

Based on **ICMJE Disclosure Standards**:

### Flags Raised When:
- No COI statement present (when one is required by the journal)
- Industry funding declared alongside positive results for that industry
- Authors have financial relationships with companies whose products are being studied
- Named grants from pharmaceutical/device companies
- Any author is a named inventor on a patent for the studied technology

### Status
- **CLEAR**: COI statement present and no concerns
- **DECLARED**: COI present and disclosed; results should be interpreted with caution
- **FLAGGED**: No COI statement, or undisclosed relationships suspected from context

---

## 8. AI Analysis Pipeline

### Article Fetching Hierarchy
MedLit attempts to retrieve article content in the following priority order:

1. **PubMed Central (PMC) Full Text** — Free, open access, XML structured
2. **Europe PMC Full Text** — Free, open access, XML structured
3. **Unpaywall Open Access PDF** — Free DOI-based lookup for legally hosted OA copies
4. **Publisher Abstract via PubMed EFetch** — Abstract + metadata (always available)
5. **CORS-proxied page scrape** — Attempts to extract abstract from journal page
6. **Sci-Hub** *(optional, user-enabled)* — Mirror-based access to paywalled content. Legal status varies by jurisdiction. Users enable this at their own discretion. MedLit accepts no liability for Sci-Hub usage.

### Claude Prompt Architecture

The analysis uses a **two-stage prompt**:

**Stage 1 — Extraction Prompt** (if raw HTML/XML):
- Extract structured metadata (title, authors, year, journal, DOI, abstract, methods, results, discussion, references)

**Stage 2 — Analysis Prompt**:
- System prompt: Expert biomedical research analyst persona with specific framework knowledge
- User prompt: Structured article content + detailed scoring rubric
- Output: Strict JSON following the `ArticleAnalysis` TypeScript interface
- Temperature: 0.2 (low, for consistency and calibration)
- Max tokens: 4096

### Chain-of-Thought Rationale
Every numerical score includes 2–5 bullet-point rationale items that cite specific evidence from the article text. This prevents hallucination and allows the user to verify the AI's reasoning.

### Calibration
Scores are calibrated such that:
- A median Nature Medicine RCT would score ~7.5 accuracy, ~7 bias
- A typical case series would score ~5 accuracy, ~5 bias
- A poorly-reported observational study would score ~3-4 across dimensions
- A Cochrane systematic review of RCTs would score ~8-9 accuracy, ~8 bias

---

## 9. Overall Verdict

MedLit synthesizes all scores into an **Overall Verdict** with three binary judgments:

| Judgment | Definition |
|---|---|
| **Trustworthy** | Accuracy ≥ 7 AND Bias ≥ 7 AND no FAIL reference check |
| **Clinically Applicable** | Trustworthy AND study design is CEBM 1–2 AND population is generalizable |
| **Read-Worthy** | Paper makes meaningful contribution regardless of flaws (even low-quality studies can be read-worthy for hypothesis generation) |

---

## 10. Limitations of MedLit

1. **Text-based analysis only**: MedLit cannot re-analyze raw data, verify statistical computations, or access supplementary datasets.
2. **Abstract-only fallback**: When full text is unavailable, analysis is limited and clearly marked as "ABSTRACT ONLY."
3. **AI confidence varies**: Claude's scoring may be less reliable for highly specialized sub-fields or non-English publications.
4. **No live reference verification**: The tool cannot visit every cited reference to verify its content. Reference checks are based on in-text information only.
5. **Not a substitute for expert review**: MedLit is a decision-support tool, not a peer reviewer. Critical clinical decisions should involve domain experts.
6. **Preprint caveat**: Preprints are not peer-reviewed. MedLit flags these prominently and applies additional scrutiny.
7. **Language**: Currently optimized for English-language publications.

---

## 11. References and Standards

- Oxford CEBM Levels of Evidence (2011): https://www.cebm.ox.ac.uk/resources/levels-of-evidence
- Cochrane RoB 2 Tool: https://methods.cochrane.org/bias/resources/rob-2-revised-cochrane-risk-bias-tool-randomized-trials
- ROBINS-I: https://doi.org/10.1136/bmj.i4919
- CONSORT 2010: http://www.consort-statement.org/
- STROBE: https://www.strobe-statement.org/
- PRISMA 2020: http://www.prisma-statement.org/
- EQUATOR Network: https://www.equator-network.org/
- ICMJE COI Disclosure: https://www.icmje.org/conflicts-of-interest/
- Newcastle-Ottawa Scale: https://www.ohri.ca/programs/clinical_epidemiology/oxford.asp
- GRADE Working Group: https://www.gradeworkinggroup.org/
