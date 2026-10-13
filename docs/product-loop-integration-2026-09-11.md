# First-party product improvement integration

Local candidate built on 11 September 2026, after the guided-reading release handoff. The preceding live deployment `dpl_4fSaGwa9P3z4G1cnAWvQJvD7a3FS` is separate and does not include this addition. This integration has not been publicly deployed.

## Changes

- Versioned shared REDKO core/client package, with checksums in `packages/redko-product-loop/manifest.json`.
- MedLit adapter uses separate product/consent/visitor identity and only the strict Supabase telemetry RPCs. It never imports Synaptik auth, journal models or Firebase configuration.
- Independent opt-in/deletion UI in AI & settings. DNT/GPC take priority. No raw text, queries, source IDs, URLs, notes, key/account/email values, form contents or replay. Coarse click positions are available only inside selected public controls; report cells require five distinct consenting IDs.
- Only one behavioral collector operates at a time. First-party opt-in disables PostHog consent; opting into PostHog turns off first-party collection. Existing ProductEvent interface is preserved.
- Existing appraisal events map to start/completion/error. The route observer alone owns first-party page views; `report_opened` and `tutorial_opened` do not create duplicate views or retention claims.
- Explicit navigation tags and capture-phase observation accommodate React Native Web stopping event bubbling.
- Settings render identical initial server/client markup, then read browser consent/configuration after mount. A hydration mismatch found in the first candidate was corrected.
- Privacy page and PRIVACY.md disclose REDKO/Supabase processing, pseudonymous identity, rotation, retention, deletion limits and separate provider logs/backups.
- CSP adds only `https://avrqcmousghdyfpaqaye.supabase.co` to connect-src. Existing inline-script hashes and all other security restrictions are preserved. Security-check script now accepts an optional export-directory argument so the exact candidate can be verified.

## Verification

TypeScript passes. 44 unit/contract tests pass, including a MedLit-specific adapter test proving the real appraisal event mapping drops arbitrary paper/key payloads and never duplicates collectors. The analysis-contract smoke passes verified quotes, deterministic scoring and unable-to-assess fallback. The live retrieval smoke passes PubMed, PMC full text and Crossref references. Static export and CSP/hash checks pass all 20 pages.

The first-party Supabase collector was separately tested with 15 live synthetic API checks: valid/idempotent events, unknown/private-field rejection, atomic rollback, denied anonymous reads, deletion credentials, cross-product isolation, preview origin enforcement and retention pruning. No personal research or health tables were read or changed. The database's daily prune targets a maximum 90-day active-store retention; platform backup/security-log schedules remain a separate operational matter.

The local UI candidate is `output/product-loop/web`, served with the actual MedLit security headers at http://localhost:8109. Browser verification includes consent controls, navigation, first-party delivery to the MedLit preview partition and deletion; append final results below. Appraisal generation in browser was not performed with an owner's paid key for this analytics change. The underlying flow is covered by the passing deterministic contract test and earlier release verification, with its limitations retained.

## Running the loop

The central read-only aggregate reporter is in `/Users/anyaozmen/Downloads/synaptik`: `npm run product-loop:report`. It writes a private interactive dashboard and a stable-ID investigation queue. The daily REDKO heartbeat reads complete windows, stays quiet when evidence is sparse/unchanged, and can prepare tested local fixes after checking repo coordination. It cannot automatically deploy, change consent/data fields, revise scientific methodology, make clinical claims or change billing.

Firebase/cloud remains off. No provider key was created, no paid AI call was made, no PostHog project/billing was changed, and no production environment variable was modified. `.env.local` enables only this local first-party candidate with a public URL/key and still requires explicit user opt-in. A deployment must configure the three EXPO_PUBLIC_REDKO_LOOP variables explicitly; existing Vercel `EXPO_NO_DOTENV=1` deliberately ignores local env files.

Before a public integration release: verify the exact candidate and host's consent/network/deletion behavior, approve the processing disclosure and release, then compare complete windows after rollout. Do not reinterpret a navigation or retention change as a change in appraisal validity.

Final browser results: the hydration-repaired settings and navigation produced no new React errors under the candidate CSP. Actual navigation sent only allowlisted events into the `medlit/preview` partition. The settings deletion flow turned consent off and server rows were removed. At 390 × 844 the settings page had no horizontal overflow. The last candidate additionally sets explicit aria-checked on both consent switches; this final accessibility change is typechecked and included in the 20-page security-verified export. No paid generation or account/cloud mutation was used.

Final accessibility verification on the exact exported candidate: the first-party switch exposes `aria-checked="false"` after deletion; fresh rendered settings produced no React errors or warnings. Desktop width was 1280/1280 with no horizontal overflow. The paired Synaptik/MedLit core/client manifest hashes match. All synthetic preview analytics were removed using their own UI deletion keys after verification.
