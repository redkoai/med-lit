# MedLit analysis contract

Version 4.1.0 · reviewed September 11, 2026 (presentation clarified; formula unchanged)

## Purpose

MedLit is AI-assisted decision support for critical reading. The output is a traceable structured appraisal, not an accuracy score, truth label, clinical recommendation, or automated implementation of an official appraisal instrument.

## Pipeline

1. Parse a bounded scientific identifier: PMID, PMCID, DOI, or supported preprint ID.
2. Retrieve metadata and lawful text from authoritative indexes and open-access sources. A bounded server-side pipeline can extract machine-readable PDF page text, HTML tables, and a limited number of allowlisted supplements.
3. Record the source coverage as full text, abstract only, or metadata only. Refuse metadata-only analysis.
4. Treat article text as untrusted data and instruct the provider to ignore embedded instructions.
5. Ask the selected model for a constrained JSON object containing design rationale, evidence-linked PICO fields, summary, exact evidence passages with section/page location, domain judgments, methods reporting, disclosures, limitations, and a cautious assessment narrative.
6. Validate the response at runtime, fill every question from the selected rubric, normalize and match every quotation against the supplied article text, and force unsupported determinate judgments to `unclear`.
7. Compute coverage, confidence, risk concern, reference-check scope, and the final display contract in application code.
8. Save the full versioned object only when history is enabled.

## Rubric routing

The design routes to concise MedLit question sets:

| Design | Question-set alignment |
| --- | --- |
| Randomized controlled trial | RoB 2 concepts |
| Systematic review/meta-analysis | ROBIS concepts |
| Non-randomized comparative designs | ROBINS-I concepts |
| Diagnostic accuracy | QUADAS-2 concepts |
| Analytical cross-sectional | JBI concepts |
| Qualitative | CASP concepts |
| Other/unknown | General transparent appraisal questions |

“Aligned” is intentional: MedLit does not claim that its concise questions reproduce, validate, or replace the official instruments or their required human judgment process.

## Evidence rule

A model-proposed quote is normalized for Unicode punctuation, whitespace, and case, then searched in the retrieved title, abstract, and analyzed full-text extract. Quotes shorter than eight characters are discarded. A determinate domain judgment requires at least one linked matched quote. Otherwise the domain becomes `unclear` even if the model proposed another value.

This protects against invented quotations but not incorrect interpretation, misleading source text, extraction damage, or omission of relevant context.

## Appraisal confidence

The visible 1–10 appraisal confidence value is derived from:

- source coverage (full text, abstract, or metadata),
- proportion of proposed quotes matched to source text, and
- proportion of rubric domains assessable from matched evidence.

The shared calculation in `src/services/appraisalScore.ts` is `round(1 + 4*C + 3*Q + 2*A)`, bounded to 1–10. C is 1.0 for the full-text retrieval category, 0.45 for abstract only, and 0.1 for metadata only (the pipeline refuses metadata-only appraisals). Q is the matched/total quotation ratio. A is the assessable/total rubric-question ratio, including unclear and not-applicable questions in the denominator. These are heuristic weights, not fitted performance estimates. The retrieval category does not guarantee every page, table, or supplement was read.

The displayed labels are higher, moderate, lower, and insufficient. Abstract-only analyses cap the categorical label at lower, not the numeric formula; that distinction is visible in the score explanation. When there are no matched quotations or no assessable domains, confidence is capped at 3/10 (insufficient), even if full text was retrieved. This score is about appraisal traceability and completeness, not study accuracy or truth. Numeric signals have not been externally validated.

## Risk-of-bias concern

The concern summary is derived from visible domain judgments. High-risk domains take priority, followed by some-concern domains, and then unclear domains. If no domains are assessable (including all-not-applicable responses), the result remains unclear rather than low risk. A low-concern result means no material concern was identified in the assessable domains; it is explicitly not proof that a paper is free of bias. The overview uses application-computed counts rather than model-proposed claims about its own verification.

## Reference and disclosure checks

JATS reference entries are structured when possible. A bounded maximum of 25 DOI references is checked through Crossref in batches. Resolved identifiers and indexed retraction/withdrawal update relationships are counted. This does not cover references without identifiers, every registry/database, citation correctness, or post-publication concerns not represented in Crossref.

Funding, conflict-of-interest, methods, registration, and narrative fields are generated descriptions, not independently verified facts. They must be checked against source text. Missing/unclear funding is never rendered as industry-funded. Failure to establish a disclosure in an extract is not proof that the original paper omitted it.

## External chat handoff

Users may take a packet to their own ChatGPT conversation and paste the JSON response back. This is not third-party ChatGPT sign-in or API access through a subscription. Packets include the retrieved source (full-text extract capped at 60,000 characters), the same rubric and instructions, and a matching ID. Imports must match that ID and pass the normal evidence validator using only exported text. The provider/model is explicitly unverified. Packets and provider credentials are not sent to MedLit cloud storage.

## Persistence and reproducibility

Every report includes the analysis contract version, provider/model label, analyzed timestamp, article key, revision, rubric ID/version, source coverage, passages, judgments, and limitations. Guest and per-account device caches use different storage keys. Guest reports are not uploaded on sign-in; importing them requires explicit confirmation. Reopened library reports do not silently re-run. A new analysis creates a new revision.

Reviewer agreement, disagreement, suggested corrections, and notes are appended to the report with timestamps and the original analysis-contract version. They never silently overwrite generated output. Portable read-only links omit private library notes and correction history. Saved PubMed searches and update checks are local and user-triggered in the guest release; they are not background surveillance or complete post-publication monitoring.

## Validation status

Automated tests cover identifier and citation-import parsing, JATS and PDF extraction, quotation verification, PICO evidence fallback, unable-to-assess behavior, deterministic final fields, portable sharing, backups, and exports. The repository includes a blinded-packet generator and benchmark analysis with uncertainty and design/coverage strata. No expert agreement, clinical validation, or diagnostic-performance claim may be made until qualified reviewers complete real blinded reviews.

## Known limitations

- Cannot reanalyze raw data or reproduce statistical models.
- Machine-readable PDF text is extracted with page markers, but reading order can be wrong. Scans/OCR, figures, equations, and complex table semantics remain unsupported; supplement ingestion is bounded and may fail.
- Full-text extraction may omit or reorder content.
- Design classification and rationales can be wrong.
- Exact-quote matching does not prove that an interpretation is correct.
- Reference and retraction checks are bounded and incomplete.
- Primarily optimized for English scientific prose.
- Provider availability, cost, and model behavior can change.
