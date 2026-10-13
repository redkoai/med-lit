# MedLit

MedLit is an evidence-linked scientific-literature appraisal workspace built with Expo Router. It helps a reader inspect a paper’s reporting and risk-of-bias domains while making source coverage and uncertainty visible.

It does **not** determine scientific truth, clinical applicability, or treatment safety, and it does not replace peer review, official appraisal instruments, retraction databases, source reading, or domain expertise.

## Standalone product and test links

- Git repository: https://github.com/redkoai/med-lit — separate from `redkoai/synaptik`, with its own Git root and no Synaptik module dependency.
- Live workspace: https://medlit-evidence-appraisal.vercel.app
- Key-free example: https://medlit-evidence-appraisal.vercel.app/example — clearly fictional, hand-authored teaching material passed through the real quotation validator; not saved to a user's library.
- For a real appraisal, connect your own OpenAI, Claude, or Gemini API key. Alternatively use the explicit `/chatgpt` copy-and-import handoff; this is not ChatGPT OAuth or API access through a ChatGPT subscription.
- The redesigned report has keyboard-accessible sections for overview, bias/evidence, methods, and citations/export. It surfaces source coverage and uncertainty instead of numeric score circles. Underlying rubric/scoring logic is unchanged.

## Current product

- Retrieves PubMed metadata and lawful full text from PubMed Central, Europe PMC, open-access HTML, and bounded machine-readable PDFs. PDF text includes page markers; HTML table structures and up to three allowable supplement files are included when available.
- Refuses metadata-only analysis and labels abstract-only analysis clearly.
- Selects a transparent design-specific question set aligned with RoB 2, ROBIS, ROBINS-I, QUADAS-2, JBI, or CASP concepts.
- Requires exact article passages for determinate domain judgments and marks unmatched quotations.
- Derives appraisal confidence and risk-of-bias concern deterministically from coverage and visible judgments.
- Resolves a bounded set of structured DOI references with Crossref and reports the checked scope.
- Saves full versioned reports locally or, for signed-in users, in an owner-scoped Firebase library.
- Supports collections, tags, notes, reopen without reanalysis, verified deletion, JSON library backup, Markdown/text/BibTeX export, portable read-only links, and analysis-version history.
- Adds evidence-linked PICO extraction, two-to-three-paper comparison tables, reviewer correction history, a guided appraisal mode, DOI/PMID/RIS/BibTeX/Zotero batch queues, saved PubMed searches, and manual update/retraction checks.
- Supports Anthropic, OpenAI, and Google Gemini with a user-supplied key.

## Privacy model

- Web provider keys live only in page memory and clear on refresh, close, or disconnect.
- Native provider keys use Expo SecureStore.
- Provider keys are not saved with reports or synced to Firebase.
- Retrieved article content is sent directly from the client to the selected provider.
- Guest libraries remain local. Firebase is optional.

Never place provider keys in `EXPO_PUBLIC_*` variables: Expo embeds all public variables in the web JavaScript bundle.

## Setup

Requires Node 24.x, matching the production runtime.

```bash
npm ci --ignore-scripts
cp .env.example .env.local
npm run check
npm run web
```

Firebase values are optional for guest mode; the public deployment currently has cloud features disabled. For account sync, provision and audit a **separate** Firebase project with an ID beginning `medlit-`, set `EXPO_PUBLIC_ENABLE_MEDLIT_CLOUD=true`, and set `EXPO_PUBLIC_MEDLIT_PROJECT_ID` to the same value as `EXPO_PUBLIC_FIREBASE_PROJECT_ID`. The API key, app ID, and matching `<project-id>.firebaseapp.com` auth domain are required. This deployment naming guard does not prove cloud isolation or replace an ownership/data audit. MedLit initializes only its own named Firebase app, never another product's default app. Deploy and test owner-scoped rules, authorized domains, and App Check before enabling accounts; never reuse the historical shared `med-lit` project or a Synaptik project.

Production export disables automatic dotenv loading. Set reviewed public configuration in the dedicated deployment project, not a developer's `.env.local`. Never configure owner AI keys for this BYOK product.

## Verification commands

```bash
npm run typecheck
npm test
npm run test:analyze
npm run test:fetch
npm run test:ingest
npm run export:web
npm run test:web-ui
```

`test:analyze` is a deterministic offline scientific-contract regression and does not spend provider tokens. `test:fetch` is a live NCBI retrieval smoke test. `test:ingest` downloads a public arXiv PDF and verifies server-side page-text extraction.

## Production notes

See [METHODOLOGY.md](METHODOLOGY.md), [PRIVACY.md](PRIVACY.md), [SECURITY.md](SECURITY.md), and [RELEASE.md](RELEASE.md). The public app also exposes `/methodology`, `/faq`, `/privacy`, and `/terms`.

The supported launch surface is structured metadata, JATS/XML, open-access HTML, abstracts, and machine-readable PDF text within documented limits. PDF reading order, table-row reconstruction, scanned pages/OCR, figures, equations, and inaccessible or oversized supplements remain incomplete and must not be marketed as equivalent to reviewing the original document.
