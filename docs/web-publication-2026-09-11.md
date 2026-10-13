# MedLit web publication — 11 September 2026

Published with the user's explicit request to publish MedLit, add it to the personal portfolio, and publish the portfolio.

## Live MedLit

- Stable: https://medlit-evidence-appraisal.vercel.app
- Verified candidate: https://medlit-evidence-appraisal-okabl2ldt-gameer-ai.vercel.app
- Deployment: `dpl_69ZzxAWABoUuWCWrUshxd9CbksS5`, READY.
- Exact bundle: `entry-4af90bccbe654b32a137b5bff3e591ca.js`.
- Previous stable: `dpl_4fSaGwa9P3z4G1cnAWvQJvD7a3FS`.

The guided-reading interface and prepared first-party product analytics are now published. The three explicit `EXPO_PUBLIC_*REDKO_LOOP*` settings were copied from the prepared public configuration into this MedLit project's production environment. PostHog remains disabled. The existing Supabase host is allowed by CSP; no new processing destination was introduced beyond the reviewed integration.

Added an explicit `npm ci` install command so the native task's root Gemfile cannot select Ruby dependencies for future web builds. The initial automatic detection installed native gems into ignored `vendor/bundle` and generated `Gemfile.lock`; native work was preserved and its owner informed. Temporary pulled Vercel environment output was removed after deployment.

## Verification

- The release source snapshot passed 44 unit/contract tests, TypeScript, live paper retrieval and deterministic analysis checks.
- Export and CSP/inline-script verification passed all 20 routes.
- Hosted browser checks passed the 12-route runtime sweep, example report tabs and keyboard navigation, connection dialog, synthetic OAuth callback, guest history reopening, FAQ search, tutorial selection, and mobile layouts/navigation.
- Both candidate and stable host passed actual analytics checks: no identifier/request before opt-in, allowlisted MedLit-only events after opt-in, no duplicate PostHog collector, withdrawal preventing capture, UI deletion and independently verified absence of this test browser's server rows.
- Candidate events were verified in the preview partition; stable-host events were verified in production. Every synthetic test identity/event was removed after checking, including the first test attempt that selected an Expo-retained hidden route. Test selection now uses visible semantic controls.
- Stable home and health return 200 and the stable HTML references the exact expected bundle. Private-network fetch is rejected with 400.
- The deployment error-log check returned only the intentional rejected private-network probe, alongside a runtime dependency deprecation warning. No unrelated application failure was observed in that check.
- Production dependency audit reported 10 moderate findings in the Expo/native-tooling chain, zero high/critical. No forced breaking dependency change was made.
- Test instrumentation and synthetic provider keys are absent from the deployed bundle.

## Boundaries

Cloud account/library synchronization remains disabled pending dedicated Firebase setup and verification. No paid AI call, owner provider key, store submission, or clinical validation was performed. Analytics is opt-in; it does not establish product benefit or scientific validity. The existing qualified provider-log/backup retention disclosure remains unchanged.

The parallel native task made further secure-storage, Apple-revocation and native-build refinements after this web snapshot was built. Those local refinements are preserved but are not claimed deployed in this bundle. Cloud-disabled guest behavior is unaffected. Build a fresh, verified snapshot for any subsequent release rather than assuming all current source matches this deployment.

## Personal portfolio

The existing portfolio has migrated from Sites/vinext to Next.js with an owner Studio and private Vercel Blob persistence. Do not deploy the old Sites artifact or remove these capabilities.

MedLit was already linked in the portfolio. This turn corrected only its two project summaries to describe source-linked appraisal, explicit uncertainty and a traceability score rather than a truth/bias score. Source and LOCAL Studio draft/published data were synchronized through the authenticated local API; artwork, section order and all other content were preserved. Local revision: `8306679a-69f0-4c9f-aba6-9f96bbeaed20`. Eight portfolio tests, TypeScript and production build passed; home and impact render the current MedLit links/copy.

Portfolio publication is still blocked on the user's hosting choice. Existing notes preserve the instruction to use paid hosting but "not on Gameer"; the available paid Vercel workspace is named Gameer. This turn asked whether a separately named personal project and private storage in that workspace is acceptable. No response had arrived at handoff, and no portfolio cloud project, Blob store or public deployment was created.
