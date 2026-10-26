# Provider onboarding and measurement, October 26, 2026

Acceptance: user-owned OpenAI, Claude, Gemini and optional OpenRouter keys; structured connection check; catalog restrictions do not prevent inference; malformed, refused and truncated results fail safely; completed appraisal saves and reopens; provider secrets never enter persistent web storage or telemetry; connection, generation, persistence and reopen outcomes are separate consented observations. Synaptik records actual activity completion and save failure without health/score content.

Authentication research: OpenAI's remotely hosted website integration requires an approved OAuth client and separately approved plan-usage access. The open-source local-client flow is not permission to offer it from a remotely hosted web app. Claude directs third-party products to API keys. OpenRouter has public PKCE authorization and remains optional, never the default or a requirement.

Sources checked October 26: https://developers.openai.com/siwc/website ; https://developers.openai.com/siwc/token-sharing-open-source ; https://support.claude.com/en/articles/13189465-log-in-to-your-claude-account ; https://openrouter.ai/docs/guides/overview/auth/oauth ; https://ai.google.dev/gemini-api/docs/api-key

Credential boundary: user reaffirmed that end users provide their own keys. No owner key provisioning, subscription-token reuse, or owner-billed generation is authorized by this implementation. Contract tests use synthetic credentials and responses; they cannot establish paid account/model access. Live successful generation for each provider remains an explicit evidence gap until a consenting test user connects a funded account.

Verification and release results will be appended below.

## Verified before release

- 82 automated MedLit tests passed, plus TypeScript and offline analysis-contract checks. Real public-source retrieval fetched full text for the SPRINT trial. Web export/security-header verification passed for 29 routes.
- Local browser fixture: OpenAI, Claude, Gemini and OpenRouter key entry -> structured connection -> appraisal -> device save -> reload/reopen all passed. Gemini model discovery/selection worked. Wrong-provider key recovery and scrollable controls inspected at 390x667; desktop flow inspected at the normal browser viewport. Refresh cleared the provider connection but preserved the library.
- Local QA server intercepts provider calls and supplies synthetic paper/model responses. The fixture banner identifies this on every screen. It binds only 127.0.0.1 and is never imported into the production app.
- Real Supabase receipt readback confirmed QA-tagged connection, generation, save and reopen observations. Arbitrary provider strings, error text and private content fields were rejected in transactional database tests. Consent was withdrawn after QA.
- Ten focused Synaptik/shared measurement tests passed, including no collection before consent/after withdrawal and exclusion of health/score content. Both TypeScript checks pass.
- Database migrations add fixed provider/reason categories, separate step events, and correct production classification for Synaptik's retained Vercel alias. No health, source identifier, key, model response, raw error, or account identity is added to telemetry.
- OpenRouter authorization and connection testing have separate event targets. An OAuth return is not evidence that a selected model can generate an appraisal. Sign in with ChatGPT remains unavailable until the hosted app is approved; no nonworking button is presented. Claude and Gemini use their supported API keys.

Remaining evidence limits: paid provider calls, a real OpenRouter authorization round-trip, signed-in cloud save/reopen across devices, and native-device interaction were not exercised by this fixture run. Application sign-in is separate from provider authorization. Current production release details will be appended after promotion.

## Live release verification

- MedLit feature commit `d69cd03` and diagnostic correction `9ba2522` pushed to `redkoai/med-lit`, branch `codex/seo-measurement-20261026`. Synaptik commit `d99c475` pushed to `redkoai/synaptik` on that branch.
- Synaptik deployment `dpl_HzRAKW5LooJzvHbzebpwmzdg4PkD` promoted; both `https://synaptik.theredko.com` and `https://synaptik-ruddy.vercel.app` assigned. Guest UI and consent controls inspected on the public domain.
- Real MedLit browser requests with deliberately invalid synthetic keys received Claude and OpenRouter 401 errors, Gemini 400, and an OpenAI network/CORS-level failure in this browser environment. No key was falsely connected. A direct non-browser OpenAI request returned 401; this does not establish browser behavior with a valid key.
- Live Gemini 400 exposed a misleading model-selection message for an invalid key. Corrected using the documented `google.rpc.ErrorInfo` / `API_KEY_INVALID` code. OpenAI `insufficient_quota` is now classified as billing. Raw messages are never displayed or collected; regression tests cover both and reject unrecognized free-text classification.
- Real database readback confirmed each provider's `step_started` and `step_failed` events under `environment=test`. Analytics were off for the first OpenAI check; only the later consented check was recorded. An unrelated production view had a different session and was not counted as QA.
- Optional OpenRouter authorization button reached the official sign-up/sign-in page with PKCE S256 and the expected callback. No account permissions were granted; token exchange and funded generation remain unverified.

Final MedLit deployment: `dpl_7Q2Bx2ZXvtxV5oF6JGxJzVHaKwKQ`, built from application commit `9ba2522`, promoted to `https://medlit.theredko.com` and `https://medlit-evidence-appraisal.vercel.app`. The corrected public Gemini error explicitly requested a valid Google AI Studio key; Supabase readback recorded `reason=credentials`. Both custom domains and both retained Vercel aliases returned HTTP 200. Both QA browser consent settings were switched off after verification.

Synaptik production browser check: completed a 60-second guest activity without mood/discomfort inputs; saved session; reloaded; reopened My journey and observed one completed session. Supabase readback confirmed one QA flow start and one QA flow completion with no provider, reason, score or symptom fields. Consent was withdrawn afterward and the 3-minute default restored. The isolated guest browser retains the single QA session; no signed-in health record was used. Screenshots: `synaptik-live-saved.png` and `synaptik-live-reopened.png` in the task's `outputs/medlit-provider-2026-10-26` folder.

OpenAI network evidence: the Responses API preflight returned 200 and permitted the MedLit origin, POST, authorization and content-type headers. The deliberately invalid-key POST returned 401 without an allow-origin response header in the tool environment, so the browser reported a generic network failure. No valid paid OpenAI result has been observed.

## Reading the measurement

Use consented sessions, not all visitors, as the denominator. Compare arrival -> meaningful start -> completion by broad referral source. For MedLit, examine provider connection success/failure separately, then generated appraisal -> device/cloud persistence -> saved appraisal reopen. For Synaptik, completion is emitted after a successful session save; save failures are separate. The report provides 7-to-14-day repeat completion only for cohorts with the full 14-day observation window. Never interpret missing observations as zero users or add QA events to acquisition totals.

Artifacts are stored in `/Users/anyaozmen/Downloads/h-scraper/outputs/medlit-provider-2026-10-26/`: fixture and live screenshots, fixture collector receipts, live collector receipts, and the bounded production growth export. The earlier 28-day export ended at October 26 00:00 UTC and had no recorded production events; it is not a current traffic estimate or proof of no visitors.
