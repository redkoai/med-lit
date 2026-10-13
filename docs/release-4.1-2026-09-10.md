# MedLit 4.1: experience, own-account AI, and privacy

September 10, 2026. Public guest-mode web release. Native builds, account/cloud activation, and clinical validation are not included.

## Shipped

- New paper-focused home, responsive workspace navigation and library, interactive fictional evidence example, teal/ink visual language, connection sheet, reading preferences, and motion that respects reduced-motion settings. Frontend-design and security guidance informed the visual hierarchy, safe defaults, and explicit error states.
- Bring your own OpenAI, Anthropic, or Gemini key. Fixed-host, header-only provider checks precede connection; no paper or generation is sent during a check. Web keys stay in memory, not localStorage, sessionStorage, Firebase, URLs, or reports. Refresh, close, or disconnect clears them.
- An explicit ChatGPT handoff: retrieve source, copy the same rubric/source packet, use a separate ChatGPT conversation, paste its complete JSON, verify quoted passages, and open/save the appraisal. No claimed ChatGPT OAuth, subscription API entitlement, or access to private conversations. The imported model remains unverified.
- Hash-based script CSP, private-file bundler exclusions, no raw client exception message logging, safer share fragments, visible copy/download outcomes, and compatibility-safe dependency updates.
- Insufficient evidence cannot produce a reassuring overview. Generated disclosure, methods, registration, and narrative descriptions are visibly qualified. Unknown funding is no longer rendered as industry-funded. Methodology and analysis version are explicitly 4.1.0; older saved reports are not silently rewritten.
- Web library deletion uses confirmation and completion/error feedback. Last-opened appraisals are memory-only; legacy persistent caches are purged. Deletion cannot reopen a report through the temporary cache. Saved library entries are retained unless the user deletes them.

## Evidence

- `npm run typecheck`, `npm test`: pass, 26 tests.
- `npm run test:analyze`: offline scientific contract pass.
- `npm run test:fetch`: actual SPRINT PubMed/PMC retrieval and bounded reference resolution pass.
- `npm run test:ingest`: actual 15-page PDF extraction pass (40,820 characters).
- Vercel production build: 17 routes plus APIs. Exact inline-script hash/security gate passes. Patched query decoder also tested on Node 24.21.0.
- Desktop and 390px mobile browser checks: homepage example, provider dialog, Escape dismissal, inline errors, connection navigation/refresh behavior, reduced motion, handoff retrieval, wrong-packet rejection, synthetic structured-response import, library reopen, read-only fragment link, and BibTeX download.
- Browser synthetic response had zero valid supporting passages: all five domains became unclear, confidence insufficient, false funding and reassuring bias badges absent. This was a regression fixture, not a real scientific assessment.
- Library deletion tested with synthetic saved and legacy-cache records: confirmed removal, obsolete cache absent, old report URL cannot reopen the deleted entry.
- Production health returns service `medlit`, version `4.1.0`. Final deployment: `dpl_6ZtWPyYPQGdsShe2yV5iKV5U2ZSK`, build bundle `entry-c94a9604f943872e28c8835951e24a06.js`.
- A desktop/server hydration mismatch was found and corrected by moving web responsiveness into CSS while keeping server/client text identical. `MEDLIT_SMOKE_URL=<deployment> npm run test:web-ui` passes on the deployed build: seven routes without hydration/runtime errors, plus opening and dismissing the connection dialog. Local browser checks pass too.

## Remaining limits and external gates

- No real customer key or paid generation was used. Provider connection success was tested with a synthetic response; live Anthropic browser preflight was also checked. Real generation still requires the user's valid key, provider permissions, billing/limits, and model availability, or the manual ChatGPT workflow.
- No owner AI key or owner-funded AI access was added. MedLit still has hosting/source-retrieval infrastructure costs.
- `npm audit --omit=dev`: zero high/critical findings; 10 moderate entries trace to uuid in Expo's xcode/config build-tool chain. See SECURITY.md. This is not a penetration-test certification.
- Dedicated Firebase configuration, enforced App Check, verified cloud deletion, distributed rate limits, spend alerts/log retention, and a verified support mailbox remain the pre-existing gates before account/cloud or high-volume promotion. Guest use does not require those features.
- No expert benchmark, clinical validation, native device review, or complete accessibility certification is claimed. Provider output and extraction can still be wrong.
- Existing dirty worktree preserved. No commit or GitHub push was made.

## Synaptik coordination

Other active tasks are rebuilding `/Users/anyaozmen/Downloads/synaptik`. Its implementation and deployment were not overwritten here; only a coordination paragraph was added to its existing coordination document. Read-only verification of their current checkout passed `npm run ts-check` and all 18 wellness tests, including Postgres cross-account/wrong-issuer access checks. This does not establish that their cloud configuration or new interface is deployed. Web and native/shared wellbeing schemas remain separate per their own coordination contract. Core local practices should remain usable without AI keys; optional AI must not imply ChatGPT-subscription API access.
