# MedLit guided reading release — September 11, 2026

## Scope

Standalone MedLit only. Repository: `https://github.com/redkoai/med-lit`. Vercel project: `medlit-evidence-appraisal`, team `gameer-ai`. The substantial existing dirty worktree was preserved. This release is built from the local checkout; it has not been committed or pushed to GitHub. Synaptik source was not changed by this task.

The human-product-loop and frontend-design skills shaped an optional, pre-generation account prompt, a readable glacier/marine visual system, visible help navigation, and source-linked score explanations. These are design hypotheses informed by founder feedback, not results from human usability studies.

## Shipped behavior

- New public navigation and labeled mobile menu; redesigned home, connection sheet, account entry, FAQ, methodology, and guided Learn page.
- OpenRouter public-client authorization using S256 PKCE, state checking, a 10-minute pending-state lifetime, fixed callback origin, and single-use exchange. API keys remain in web page memory, never in Firebase or browser persistence. Connecting never starts chargeable generation automatically. Existing provider-key setup and the separate ChatGPT packet workflow remain available.
- Visible 1–10 appraisal score with component breakdown and explicit limits. The validator and UI share the unchanged v4.1 formula. A high score indicates heuristic traceability/completeness, not accurate science or low bias. Abstract-only categorical confidence remains capped at lower even when its numeric heuristic is higher.
- Guest and each account have different local cache keys; no automatic guest upload at login. Explicit import requires confirmation. Concurrent saves use per-owner queues. Saved reports reopen without another AI request. Finished analyses are cached before saving so a storage failure can show an export warning instead of hiding paid output.
- Sign-out/account changes invalidate active analysis memory and clear outgoing-account provider keys. Google sign-in no longer resets account creation statistics. Account deletion also removes that account's device cache; guest copies and exports are separate.
- Searchable FAQ and four interactive tutorial chapters. No autoplay video or session recordings were added.
- Prepared event-only PostHog adapter with explicit opt-in, strict property allowlist, DNT/GPC handling, and consent withdrawal. No user IDs, email, paper identifiers/text, notes, URL queries, API keys, autocapture, or replay are collected by that adapter.
- Fixed an existing DOI retrieval defect found in hosted testing: Europe PMC's full-text route was malformed, its available abstract was ignored, and a newly discovered PMC identifier did not reach the working NCBI fallback. Both bare DOI and PubMed input now have regression coverage.

## Verification

- TypeScript passed; 39 unit/contract tests passed.
- `test:fetch` passed for the SPRINT PubMed URL and the bare DOI `10.1056/NEJMoa1511939`, both with full-text coverage.
- `test:analyze` passed (offline structured-output/quotation contract, not a paid model call).
- `test:ingest` passed: 15 PDF pages, 40,820 extracted characters.
- Production export and CSP/private-file checks passed for 20 routes.
- Desktop/mobile screenshots inspected. Automated axe checks found zero violations on home and Learn after fixing the score graphic's missing role; icon-only contrast checks still require visual review. This is not a full accessibility certification.
- Browser tests exercise 12 routes, hydration/runtime errors, report keyboard tabs, manual-key disclosure/masking, a synthetic OAuth return, draft restoration, no automatic generation, key removal after refresh, a disposable saved-report reopening, FAQ search, tutorial chapters, and six mobile routes.
- Browser test fixes distinguish test mechanics from app errors: raw selectors could resolve a hidden previous Expo route; mobile destination verification now checks the visible accessibility tree. Cross-origin mock responses without preflight headers initially caused a test-only CORS failure; the isolated init fixture avoids making real AI requests.
- The real OpenRouter button reached its sign-in page and the live exchange endpoint permits the required CORS preflight. Successful authorization and generation were tested with synthetic responses, not a real provider account or paid generation.

## Unfinished activation gates

Cloud accounts and cross-device sync are **not active**. Vercel has no configured environment variables; Firebase CLI reports unauthenticated. The account screen explicitly offers device-only use, and the optional pre-generation signup prompt is enabled only with dedicated cloud configuration.

Before enabling cloud: authenticate Firebase, provision/audit a dedicated `medlit-` project, enable the intended auth methods and authorized domains, validate deployed owner-scoped rules, and run real signup/sign-in/sign-out/save/reopen/delete tests across two accounts. Review offline conflicts, stale device caches, remote deletions, quota/rate controls, verification emails, and operational recovery. Local cache isolation tests are not a substitute for those live tests.

Analytics are **not active**. The connector exposes only a Gameer project. The browser's REDKO organization exposes Synaptik and a one-project plan limit; no billing upgrade or cross-product token reuse was performed. A separate user-requested task is preparing a first-party REDKO telemetry option; this release has not integrated or enabled it. Do not run duplicate capture systems. Detailed heatmaps/replay require the reviewed contract and appropriate disclosure/consent before activation.

Scientific release limits remain: no expert-agreement benchmark, clinical validation, accuracy guarantee, complete retraction audit, or raw-data reanalysis. The product is ready for guest-mode evaluation, not a claim of fully activated production infrastructure.

## Deployment record

Accepted candidate: `https://medlit-evidence-appraisal-5wvpse949-gameer-ai.vercel.app`.

Deployment: `dpl_4fSaGwa9P3z4G1cnAWvQJvD7a3FS`. Bundle: `entry-bbd92d9d6f81a5b09727832c33d1ef10.js`. Runtime: `nodejs24.x` (local CLI is Node 26 and emits an engine warning).

The complete final hosted browser script passed: 12 routes, keyboard report navigation, connection sheet, synthetic OAuth exchange, memory-only connection lifecycle, saved report reopen, searchable FAQ, tutorial interaction, six mobile routes, and collapsed mobile navigation after client-side navigation. The synthetic fixture is not present in the exported production bundle.

On this exact candidate, the real DOI source-packet flow retrieved SPRINT with full-text coverage and prepared a 44,977-character packet with no runtime errors. Health returned HTTP 200 (`medlit`, contract `4.1.0`); the private-network source proxy request returned HTTP 400.

Desktop and mobile screenshots: `/tmp/medlit-guided-final-desktop.png`, `/tmp/medlit-guided-final-mobile.png`.

Stable alias `https://medlit-evidence-appraisal.vercel.app` now points to that candidate. The stable HTML returned HTTP 200 and the exact expected bundle; its health endpoint returned HTTP 200. Cloud and analytics remained disabled on this accepted release.
