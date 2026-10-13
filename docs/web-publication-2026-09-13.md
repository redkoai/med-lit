# MedLit public release — September 13, 2026

The user explicitly requested deploying MedLit and Synaptik to Vercel. The current MedLit web source was rebuilt with the existing production environment, tested, deployed prebuilt, promoted and assigned to https://medlit-evidence-appraisal.vercel.app/.

- Deployment: `dpl_4z8STnGJz5SGbCWidAJgqWiUCmDi`.
- Immutable URL: https://medlit-evidence-appraisal-coqu1czra-gameer-ai.vercel.app/.
- Bundle: `entry-01e6df0ac4417a891402a1c2fa872c85.js`; SHA-256 `805c6bd2d9ef3dde1d6a6e0503dfa12503170e92fa3ae4f6a3d52ebb0ac2d201`.
- Previous production: `dpl_69ZzxAWABoUuWCWrUshxd9CbksS5`, retained as a rollback reference.

This supersedes the September 12 report's preview-only publication status. It does not activate Firebase accounts, Apple/Google providers, paid AI or native distribution. Production first-party telemetry configuration and opt-in behavior were retained. Policy drafts remain drafts; operator/contact and legal review are unresolved. No source application files, clinical claims or appraisal methodology were changed during this release. The dirty checkout was preserved. A temporary build configuration reused tested dependencies to avoid disrupting native builds; public build values came from the linked production project, with Expo dotenv discovery disabled.

Verification: TypeScript, 53 tests, live retrieval and analysis-contract checks passed; 21 static routes passed the security-header/export checks. All 21 public routes returned HTTP 200 with the exact release bundle; the public JavaScript hash matched the local artifact. Hosted health and real PubMed XML retrieval returned 200, and private-network requests to fetch/ingest returned 400. Local browser checks covered navigation, evidence tabs, fictional examples, mocked OAuth callback, memory-only key handling, saved synthetic history, policies, reduced motion and mobile navigation. The initial local callback test used an unsupported numeric loopback origin; rerunning the affected interactions on the supported localhost origin passed without application changes. Public browser checks covered eight routes and four mobile layouts, the interactive example and connection dialog, with no runtime errors or optional telemetry before consent. No real AI generation, account creation or clinical validation was performed.

Evidence: `output/deploy-20260913-*` includes build, deployment, alias, test and verification results. The exact public verification is `output/deploy-20260913-public-verification.json`; hosted API and browser results are adjacent. No production deployment is authorized automatically by the scheduled product loop; this release followed the user's explicit request.
