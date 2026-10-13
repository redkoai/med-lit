# MedLit web release, October 13, 2026

Production: https://medlit-evidence-appraisal.vercel.app

Deployed application revision: d83d6d1, on codex/web-release-20261013 in redkoai/med-lit. Immutable deployment: https://medlit-evidence-appraisal-1qc1nqj03-gameer-ai.vercel.app. Source was committed and pushed; remote main was not overwritten. The original working directory and private legal planning documents were preserved outside this scoped release.

The homepage preserves the violet folded-page M, uses locally hosted IBM Plex fonts, includes a short terminal typing introduction, and presents the real appraisal input alongside a clearly fictional, interactive teaching example. Six static guides and a downloadable journal-club worksheet follow the audience plan in this folder.

Verification: TypeScript; 65 automated tests; 29-route production export and script/CSP checks; six guide routes, canonicals, sitemap membership and JSON-LD; worksheet and fonts; desktop 1440x900 and short-phone 390x667 views; input, example, evidence, navigation and provider-modal interactions; live invalid-key rejection. The production PubMed fetch returned the SPRINT article XML, and the health endpoint returned ok.

OpenAI, Anthropic, Gemini Developer API and optional OpenRouter adapters have mocked contract tests. Paid inference with real customer keys was not available for verification. Cloud-platform credentials and subscription tokens are not interchangeable with these API keys. No unrestricted all-key compatibility is claimed.

MedLit cloud-library activation still requires completion of the Redko Team Firebase consent flow. API keys on web stay in page memory. No cloud-account/storage completion is claimed for MedLit.

Search Console ownership is verified and sitemap submission acknowledged. The initial sitemap report could not fetch the file, while Google's subsequent live test confirmed it is accessible. Indexing, rankings, traffic and conversion results remain unverified. DNS and Wix were not changed.

The dependency audit reported 30 affected entries, including transitive build/tooling packages and the Firebase Node graph. Their production exploitability and full remediation were outside this release; this is not a completed security audit.
