# MedLit web release, October 13, 2026

Production: https://medlit-evidence-appraisal.vercel.app

Deployed application revision: eaf1bc1, on codex/web-release-20261013 in redkoai/med-lit. Immutable deployment: https://medlit-evidence-appraisal-jxwn7540t-gameer-ai.vercel.app. Source was committed and pushed; remote main was not overwritten. The original working directory and private legal planning documents were preserved outside this scoped release.

The homepage preserves the violet folded-page M, uses locally hosted IBM Plex fonts, includes a short terminal typing introduction, and presents the real appraisal input alongside a clearly fictional, interactive teaching example. Six static guides and a downloadable journal-club worksheet follow the audience plan in this folder.

Verification: TypeScript; 65 automated tests; 29-route production export and script/CSP checks; six guide routes, canonicals, sitemap membership and JSON-LD; worksheet and fonts; desktop 1440x900 and short-phone 390x667 views; input, example, evidence, navigation and provider-modal interactions; live invalid-key rejection. The production PubMed fetch returned the SPRINT article XML, and the health endpoint returned ok.

OpenAI, Anthropic, Gemini Developer API and optional OpenRouter adapters have mocked contract tests. Paid inference with real customer keys was not available for verification. Cloud-platform credentials and subscription tokens are not interchangeable with these API keys. No unrestricted all-key compatibility is claimed.

MedLit now has a dedicated Firebase web app and Standard Firestore database in nam5 (United States), provisioned through the already authenticated console. Email/password sign-in and the Google provider are enabled; the canonical production domain is authorized. Public web configuration is scoped to the Vercel production environment. Owner-scoped rules were published, and analysis indexing disables unused fields while retaining the descending analyzedAt index used by the bounded library query. API keys on web stay in page memory; preference and profile rules reject provider-key fields. The no-cost Spark plan was retained; scheduled backups and App Check enforcement were not activated. No patient-data or regulated clinical-storage compliance is claimed.

Search Console ownership is verified and sitemap submission acknowledged. The initial sitemap report could not fetch the file, while Google's subsequent live test confirmed it is accessible. Indexing, rankings, traffic and conversion results remain unverified. DNS and Wix were not changed.

The dependency audit reported 30 affected entries, including transitive build/tooling packages and the Firebase Node graph. Their production exploitability and full remediation were outside this release; this is not a completed security audit.

Cloud verification: 16 live Firebase checks passed with two synthetic accounts, covering owner profile/preferences/appraisal CRUD, bounded descending queries, cross-account and anonymous denial, global-list denial, forbidden secret fields, and deletion readback. Production browser email sign-in loaded the seeded fictional appraisal, saved collection and notes to Firestore, and restored them after reload. A separate authenticated SDK read verified the browser-written fields and profile timestamp. All synthetic cloud accounts, profiles, preferences and appraisals were removed afterward, with empty collections and absent profiles checked before deleting the Firebase login. The temporary credential fixture was removed. Google sign-in is configured but its complete OAuth flow was not exercised. Apple remains disabled.

The library editor now catches save failures, retains edits and offers retry, with a disabled busy state. TypeScript and the production export passed. An extra browser test of an oversized save was interrupted by the browser connection before submission; its error/retry path is not claimed as browser-verified. The successful ordinary save, readback and reload were verified before that interruption.

Routine Firebase setup was completed through the existing console session without another password prompt. The expired CLI login is unnecessary for this deployed app. For unattended future infrastructure releases, prefer a scoped deployment identity rather than repeated interactive owner logins; such an identity was not provisioned in this release.
