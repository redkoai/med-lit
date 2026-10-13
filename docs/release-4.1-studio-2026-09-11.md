# MedLit research review studio — September 11, 2026

## Scope and separation

MedLit remains the standalone scientific-literature appraisal product. Its Git root is `/Users/anyaozmen/Downloads/med-lit`, remote `https://github.com/redkoai/med-lit.git`, and dedicated Vercel project is `medlit-evidence-appraisal`. Synaptik has a different Git root and remote (`redkoai/synaptik`); no Synaptik code was edited for this release. The Vercel team is shared hosting administration, not a shared app or data store.

This checkout already contained substantial uncommitted development. It was preserved, not reset or blanket-committed. The deployment is built from the local checkout; the new source has **not** been committed or pushed to GitHub.

Cloud remains disabled. `vercel env ls --scope gameer-ai` reported no environment variables for this project. Optional Firebase now requires explicit opt-in, matching dedicated `medlit-` project IDs, required public config, and a matching Firebase auth domain. Initialization only reuses MedLit's own named app with the same project ID. This guard prevents accidental default-app reuse but does not replace a cloud ownership/data/rules audit. No cloud project or user data was migrated, deleted, or provisioned.

## Design and behavior

Frontend-design guidance shaped a task-focused research studio: compact navigation, cobalt/ink/paper palette, source input, clear BYOK connection, and an interactive source-to-judgment example. Desktop and mobile share SSR-safe CSS breakpoints. Small action-driven transitions honor reduced motion.

Results now show source availability, matched-quotation counts, and unclear domains. Keyboard-accessible sections separate overview, bias/evidence, methods, and citations/export. Arrow keys, Home, and End navigate tabs; disclosure buttons expose their expanded state. Numeric score circles were removed from these report views; heuristic support labels remain explicitly qualified. The underlying v4.1 rubric and scoring logic did not change. Reports still include the existing structured output.

`/example` is clearly fictional, hand-authored teaching material, not an AI-generated or scientifically validated real-paper appraisal. It goes through the production validator, shows five matching quotations and one deliberately unmatched quotation, and leaves the selective-reporting domain unclear. Readers can inspect the complete fictional excerpt. No account, key, generation request, or automatic history write is needed.

Real-paper appraisals use a user's own provider key, held in page memory on web. Alternatively `/chatgpt` prepares a packet for a separate ChatGPT conversation and validates the returned JSON. It is not OAuth, access to private chats, or ChatGPT-subscription API entitlement. No paid provider request was made during this verification.

Production builds now set `EXPO_NO_DOTENV=1`; personal developer dotenv settings are excluded from automatic export. Missing publication years no longer render as `null` in quick-share summaries.

## Verification completed locally

- TypeScript: `npm run typecheck` passed.
- Unit/contract suite: all 30 tests passed, including the new demo and project-boundary tests.
- Live NCBI/PMC/Crossref retrieval: `npm run test:fetch` passed for SPRINT.
- Offline scientific contract: `npm run test:analyze` passed.
- Live PDF ingestion: `npm run test:ingest` passed, 15 pages / 40,820 characters.
- Desktop browser and 390px mobile screenshots inspected. `npm run test:web-ui` passed on localhost: eight routes, runtime/hydration checks, dialog open/dismiss, report keyboard navigation, and mobile overflow checks.
- Production export: 18 static routes; CSP inline-script hashes and private-file exclusion checks passed.
- Deployment runtime is Node 24. The installed local CLI runs Node 26 and reports the expected engine mismatch warning; no forced dependency upgrade was made.

## Deployment verification

Candidate: https://medlit-evidence-appraisal-fpw2q40z9-gameer-ai.vercel.app

Deployment ID: `dpl_CEafxnGQ9fcTFXS1jZ9VPeHuePVT`. Build entry: `entry-8ff93b336cc656a2562b839a037f9b51.js`.

Final candidate health returns HTTP 200 with service `medlit`, version `4.1.0`. A private-network source-proxy request is rejected with HTTP 400. The preceding candidate's actual browser handoff retrieved SPRINT and prepared a 45,580-character packet with full-text coverage and the import form available; no runtime errors. One automation wait used text that is hidden after loading and timed out; the subsequent snapshot and DOM check confirmed successful retrieval. This was an incorrect test selector, not a retrieval failure.

Final candidate `npm run test:web-ui` passed all eight routes, runtime/hydration checks, report keyboard navigation, connection dialog open/dismiss, and 390px mobile home/example overflow checks. A real browser download of the fictional example's summary succeeded; the file labels it fictional and omits the missing publication year.

The stable alias was assigned successfully to this exact deployment:

- Workspace: https://medlit-evidence-appraisal.vercel.app
- Example: https://medlit-evidence-appraisal.vercel.app/example

Stable-origin HTML was verified to reference `entry-8ff93b336cc656a2562b839a037f9b51.js`, matching the final build. The live health endpoint remains healthy. Opening the workspace in Codex was requested; the app returned `queued`, not confirmation of a visible tab. The local development UI also remains running at http://localhost:8094; use the public link for the deployed retrieval endpoints.

## Remaining limits

This is a public guest-mode web workspace for testing and critical reading, not a clinically validated system. Quote matching cannot verify scientific accuracy, full reporting quality, causal conclusions, or clinical applicability. Independent appraisal benchmarking, review of extraction limits, cloud/account activation, native distribution, and high-volume operational gates remain outside this redesign. A real provider key is still needed to test paid in-app generation; the fictional example and external-chat packet preparation do not require one. See the previous release's operational/credibility gates.
