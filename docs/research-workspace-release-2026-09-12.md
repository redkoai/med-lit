# MedLit research-workspace preview — September 12, 2026

## Release boundary

- Preview: https://medlit-evidence-appraisal-jjr1wx6yv-gameer-ai.vercel.app/
- Deployment: `dpl_7kaA53eyGJBzzMj3BQcNzz6vf5ot`, Vercel preview target, READY.
- Web bundle: `entry-e066d868d46cc6e76e52e9f2d7e625c3.js`.
- Existing production https://medlit-evidence-appraisal.vercel.app/ was **not promoted or replaced**. It still serves the earlier release.
- This preview is publicly reachable, explicitly labeled as a design/policy review build, and emits `noindex, nofollow`. Cloud accounts and behavioral collectors are off in this preview. No provider keys or new Firebase configuration were deployed.
- Expo static web / Vercel Node 24 functions. The workspace remains dirty and uncommitted; `296d0d3` is the existing base commit, not the deployed source identity. Existing unrelated changes were preserved.

## What changed

Task-first paper intake, consistent indigo/ink design, more readable body and control text, an interactive fictional preview with supported/concern/unknown states, mobile preview disclosure, unchanged transparent v4.1 score, new mission page and shared policy/help navigation. Reanimated native press feedback and reveals respect reduced motion. Web feedback uses short CSS transitions with a reduced-motion override.

Accounts are now social-first with separate fail-closed Apple/Google availability, email disclosure, password visibility, guest exit and specific error recovery. Existing native SDK credentials, nonce binding, key isolation and account deletion remain. Native AI onboarding no longer advertises web-only OpenRouter OAuth, opens without an automatic keyboard, includes safe-area/keyboard handling, and hides decorative icon glyphs from accessibility. A final native-only home sticky-header adjustment follows the web snapshot; it does not change web behavior.

Privacy and terms have substantive sections on identities, credentials, research/provider data, storage, sharing, telemetry, transfers, sensitive material, retention/deletion, rights, source/AI limits, third-party costs, warranties and legally permissible liability limits. Operator identity/contact and legal applicability remain review gates. No promise of zero liability, blanket compliance, scientific truth or clinical effectiveness was added.

## Verified

- TypeScript passes; 53 unit/contract tests pass.
- Real retrieval smoke test passes for PubMed/PMC SPRINT source and reference resolution.
- Analysis-contract smoke test passes with synthetic inputs: evidence validation, deterministic scoring and unable-to-assess fallback. No paid AI generation was performed.
- Web static export and inline-script/security-header check pass for 21 routes.
- Full local and hosted browser suites pass: 15 routes without hydration/runtime errors; evidence/method/citation keyboard tabs; interactive preview; key masking; mocked OpenRouter callback with draft restoration, one exchange, zero automatic generation and memory-only key clearing; invalid input rejected before generation; saved synthetic report reopened without generation; FAQ/tutorial interaction; mobile layouts; non-overlapping intake/preview; policy contents jumps; reduced-motion CSS.
- Hosted homepage and health return 200; health reports v4.1.0. Private-network retrieval target returns 400. Hosted CSP includes the official Firebase gapi loader while retaining no inline/eval scripts and anti-framing protection.
- iOS unsigned Release simulator builds passed with Expo-compatible Reanimated/Worklets. Final native build was launched and inspected on iPhone 17 Pro / iOS 26.5: corrected native AI copy, no decorative accessibility glyphs, connection sheet without automatic keyboard, preview disclosure and unknown-state feedback were observed.

Local evidence: `output/research-workspace-*.log` and screenshots. One intermediate native rebuild failed because a concurrent Vercel npm-ci installation temporarily removed node_modules. It was rerun after installation; later local builds use a temporary config that checks already-installed dependencies with `npm ls --depth=0` to avoid repeating that conflict. No failure was hidden or waived.

Final native-only check: `output/research-workspace-ios-sticky-header.log` ends `BUILD SUCCEEDED`; the rebuilt app was installed and launched. The home header stays above scrolled content and status-bar insets. Native menu → account shows the official unavailable Google/Apple controls and the guest fallback; the connection modal, evidence disclosure and unknown state were tested without entering keys or creating accounts. The generated preview-environment credential file was removed after deployment.

## Remaining before production/native distribution

1. Confirm public Google account activation and owner-only rules, then finish and test the dedicated `medlit-evidence` project. See `docs/account-activation-2026-09-12.md`; no enabled providers or connected database are claimed.
2. Sign in to Apple Developer and configure the real team/App ID/Services ID/key and return URLs. Test Apple/Google create/login/cancel/session restore and full deletion on the exact candidate.
3. Confirm the full legal operator name and monitored privacy/support address; review the candidate policies with qualified counsel. Assess health-data and regional-law applicability from actual use and processor relationships.
4. Physical iOS/Android, Android release compilation, large accessibility text, assistive-technology traversal and real-device motion performance are not certified here. No IPA, TestFlight or store submission was made.
5. Clarify the cut-off request about input types. This release keeps DOI/supported article-link intake; arbitrary local files, pasted manuscripts and OCR are not newly implemented or advertised.
6. Conduct human usability testing. Browser/simulator checks do not validate desirability or scientific performance. The ten moderate native-tooling dependency advisories remain; there were no high/critical findings in the installation scan.

Legal references used: [California Civil Code 1668](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1668.), [California AG CCPA guidance](https://oag.ca.gov/privacy/ccpa), [Firebase Google auth](https://firebase.google.com/docs/auth/web/google-signin), [Firebase Apple auth](https://firebase.google.com/docs/auth/web/apple).
