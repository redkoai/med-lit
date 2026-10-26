# Provider onboarding and measurement, October 26, 2026

Acceptance: user-owned OpenAI, Claude, Gemini and optional OpenRouter keys; structured connection check; catalog restrictions do not prevent inference; malformed, refused and truncated results fail safely; completed appraisal saves and reopens; provider secrets never enter persistent web storage or telemetry; connection, generation, persistence and reopen outcomes are separate consented observations. Synaptik records actual activity completion and save failure without health/score content.

Authentication research: OpenAI's remotely hosted website integration requires an approved OAuth client and separately approved plan-usage access. The open-source local-client flow is not permission to offer it from a remotely hosted web app. Claude directs third-party products to API keys. OpenRouter has public PKCE authorization and remains optional, never the default or a requirement.

Sources checked October 26: https://developers.openai.com/siwc/website ; https://developers.openai.com/siwc/token-sharing-open-source ; https://support.claude.com/en/articles/13189465-log-in-to-your-claude-account ; https://openrouter.ai/docs/guides/overview/auth/oauth ; https://ai.google.dev/gemini-api/docs/api-key

Credential boundary: user reaffirmed that end users provide their own keys. No owner key provisioning, subscription-token reuse, or owner-billed generation is authorized by this implementation. Contract tests use synthetic credentials and responses; they cannot establish paid account/model access. Live successful generation for each provider remains an explicit evidence gap until a consenting test user connects a funded account.

Verification and release results will be appended below.

## Verified before release

- 81 automated MedLit tests passed, plus TypeScript and offline analysis-contract checks. Real public-source retrieval fetched full text for the SPRINT trial. Web export/security-header verification passed for 29 routes.
- Local browser fixture: OpenAI, Claude, Gemini and OpenRouter key entry -> structured connection -> appraisal -> device save -> reload/reopen all passed. Gemini model discovery/selection worked. Wrong-provider key recovery and scrollable controls inspected at 390x667; desktop flow inspected at the normal browser viewport. Refresh cleared the provider connection but preserved the library.
- Local QA server intercepts provider calls and supplies synthetic paper/model responses. The fixture banner identifies this on every screen. It binds only 127.0.0.1 and is never imported into the production app.
- Real Supabase receipt readback confirmed QA-tagged connection, generation, save and reopen observations. Arbitrary provider strings, error text and private content fields were rejected in transactional database tests. Consent was withdrawn after QA.
- Ten focused Synaptik/shared measurement tests passed, including no collection before consent/after withdrawal and exclusion of health/score content. Both TypeScript checks pass.
- Database migrations add fixed provider/reason categories, separate step events, and correct production classification for Synaptik's retained Vercel alias. No health, source identifier, key, model response, raw error, or account identity is added to telemetry.
- OpenRouter authorization and connection testing have separate event targets. An OAuth return is not evidence that a selected model can generate an appraisal. Sign in with ChatGPT remains unavailable until the hosted app is approved; no nonworking button is presented. Claude and Gemini use their supported API keys.

Remaining evidence limits: paid provider calls, a real OpenRouter authorization round-trip, signed-in cloud save/reopen across devices, and native-device interaction were not exercised by this fixture run. Application sign-in is separate from provider authorization. Current production release details will be appended after promotion.
