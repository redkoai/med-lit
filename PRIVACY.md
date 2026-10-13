# MedLit privacy architecture

The public privacy notice lives at `/privacy`. Implementation invariants:

- Web AI-provider keys stay in page memory only and are cleared on refresh, close, or disconnect. Legacy session-storage keys are removed automatically.
- Native AI-provider keys use Expo SecureStore.
- Provider keys never enter Firestore or saved analysis documents.
- Article text goes directly from the client to the selected AI provider.
- Guest analyses remain local; authenticated analyses may sync to Firebase. Device caches are keyed by account. Guest history is copied to an account only after explicit confirmation.
- Unstored appraisals are memory-only. Refreshing clears them. Deletion also removes the temporary last-opened appraisal and obsolete persistent-cache entries, preventing deleted reports from reopening through that cache.
- Saved PubMed searches remain local in the guest release and run only when requested.
- Portable read-only links contain a bounded appraisal snapshot in the URL. Anyone who receives the link can read that snapshot; private notes and correction history are excluded.
- Reviewer feedback and suggested corrections are saved with the report and may sync when account storage is enabled.
- Account deletion removes the known `analyses`, legacy `history`, and `settings` subcollections before the user profile and auth account.
- No advertising or session recording. Optional first-party product analytics were deployed September 11, 2026 and require consent; see `docs/web-publication-2026-09-11.md`. Structured server logs record retrieval/ingestion timing, host, size, status, and request ID, but not provider keys or article text.

OpenRouter sign-in uses S256 PKCE. Only the one-time verifier, state, and paper-input draft are stored in session storage for the redirect; the returned key stays in memory. The callback strips authorization parameters from the address bar. A provider-generated connection can be revoked in the provider dashboard.

Opt-in analytics code is prepared but off without dedicated MedLit configuration. It supports only named reading-flow events, a random browser ID, provider name, and source-coverage category. It excludes user identity, source identifiers, paper text, notes, keys, full URLs, autocapture and session replay. DNT/GPC disable capture. Infrastructure still receives ordinary network information.

Vendors: OpenRouter, PostHog (only when configured and opted in), Anthropic, OpenAI, Google Gemini/Firebase, Vercel, NCBI, Europe PMC, Crossref, and Unpaywall. Their own policies apply.


## First-party REDKO product loop (2026-09-11 integration)

Optional and off without consent. The September 11 release added a MedLit-specific pseudonymous partition in REDKO's dedicated Supabase telemetry store. No Firebase settings, auth, library records or keys were moved. No source IDs/queries/URLs/text, notes, account identities or form contents are captured. Approved event/control categories and coarse public-control click positions are the only payload. Screen/session replay remains off. Separate consent, DNT/GPC, withdrawal and deletion-key controls apply. Only one behavioral collector operates at a time; first-party opt-in disables PostHog consent and vice versa.

Raw events are pruned daily at 89 days (target maximum 90); browser IDs rotate after 30 days and older deletion credentials survive for up to 120 days from creation. Deletion failures retain keys for retry. Provider logs/backups have separate, unverified retention. Reports retain only aggregates, suppress heatmap cells below five browser IDs, and do not establish causation or appraisal validity. Production consent, withdrawal and synthetic-data deletion were checked for the September 11 release; this does not certify every later build.

## September 12 policy revision

`app/privacy.tsx` and `app/terms.tsx` contain the expanded candidate policies. The operator's full legal name and monitored privacy/support address still require confirmation, plus appropriate legal review. No zero-liability or blanket regulatory-compliance claim is made. The new dedicated `medlit-evidence` Firebase project is on the free Spark plan, with Google Analytics off; it is not connected to the app pending provider and owner-rule verification. The historical shared `med-lit` project remains excluded.

Canonical specification: `/Users/anyaozmen/Downloads/synaptik/docs/research/PRODUCT_LOOP_OPERATING_CONTRACT.md`. The local package is a versioned copy; compare checksums before updates.

## September 13 legal research and local drafts

See [the legal review package](docs/legal/README.md) for five source-aligned policy drafts and the cited research. The local revision removes an unverified public contact, identifies draft status, distinguishes health inferences from ordinary scientific content, and adds clear limits on future processing, retention and lawful disclosures. It does not enable new collection or update production. Entity/contact, audience, provider retention, rights operations and product-specific applicability remain open; a draft label does not defer duties to current users.
