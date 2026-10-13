# MedLit: first appraisal to a useful research library

## Outcome and evidence

Target: students, researchers, and clinicians reading an unfamiliar paper, including readers unfamiliar with API keys. Job: understand what is reported, what is questionable, and what remains unknown; keep a reusable appraisal. Hypothesis, not human-tested evidence: a guided connection choice and explanatory score reduce confusion. Existing evidence: user feedback rejects the previous sparse studio, hidden score, and key-first onboarding. The FAQ and history exist but are hard to discover; cloud is unconfigured, and the local history cache currently risks crossing account boundaries.

## Interaction loop

Paper -> choose AI access -> clear cost/privacy disclosure -> optional save-account prompt before generation -> progress -> score with evidence and limits -> saved report -> resume or compare. Never block already-generated output behind signup. Guest continuation remains visible. Cloud signup only appears as available after dedicated configuration is verified. Existing local papers are never silently uploaded at sign-in.

Connection choices: authorize an OpenRouter account without manually copying a key; guided provider-key setup for OpenAI/Claude/Gemini; or the explicit separate ChatGPT source-packet workflow. OpenRouter billing and account requirements are stated. No owner AI key will be created or reused, honoring the user's explicit BYOK requirement. OpenAI documentation describes subscription sign-in in Codex; it does not establish general-purpose ChatGPT-plan API access for this site.

## Design plan and critique

Palette: glacier #F1F5F8, paper #FFFFFF, deep blue #12384A, marine #126B7B, ice #DCEFF1, amber #A66310 for concerns. Typography: Avenir Next/system sans for workspace and reading controls, Georgia only for source quotations. Large headings 40/46, body 16/25, metadata 12/19. Main alignment left, narrow text lines. Existing semantic red/green meanings retained.

Layout: an open top navigation (Read, Library, Learn, Methodology, FAQ, Account), a focused start panel alongside a live score-and-source explainer, and a tutorial path below. Mobile collapses navigation into a labeled menu, not clipped horizontal links. Reports place the explained 1–10 appraisal score near source coverage and bias state. The score is explicitly traceability/completeness, not truth or clinical quality. Support pages share the same shell and navigation.

    navigation / account
    paper + connection choice | interactive score + linked passage
    guided walkthrough       | recent library / next useful task
    methods / costs / privacy / FAQ

Critique: the previous design resembled a generic admin console: dense rail, all-caps labels, anonymous blue cards, and little beginner instruction. Remove the rail, expose help in navigation, increase reading comfort, and spend visual emphasis on the actual score-to-evidence relationship. Do not add ornamental 3D or attention loops.

## Persistence and collection

Guest and each signed-in account get different local cache keys. Cloud failures must not discard an already-generated appraisal or falsely report sync success. Subscription refresh/listeners keep history consistent across screens. Signing out clears provider/session analysis memory. Guest-to-account copy requires an explicit user action.

Analytics measure meaningful transitions: connection started/completed/failed, appraisal started/completed/failed, saved report reopened, tutorial finished. Opt-in only, no key, paper identifier, source text, notes, email, URL query, or session replay. No other product's PostHog key or project is reused. Missing analytics configuration is reported honestly. Human usability tests remain pending: browser tests verify mechanics, not desirability.

## Release gates

TypeScript, unit/contract tests, actual browser flow, source retrieval and analysis tests, mobile and keyboard checks. OAuth callback tests cover state/TTL/replay/fixed origin and redact errors. Cloud activation additionally requires authenticated setup, a dedicated project, enabled auth providers, owner-scoped rule tests, verified cross-account isolation, and real signup/save/reopen/delete checks. Until then guest mode remains usable and cloud is clearly unavailable.
