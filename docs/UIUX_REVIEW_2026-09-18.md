# MedLit UI and interaction repair, 18 September 2026

Delivery: local source and exported previews. No production deployment, store release, live account creation, or paid AI generation was performed. Unrelated existing working-tree changes were preserved.

## What was repaired

- Native startup now lands on Read instead of unexpectedly opening Learn.
- Native wordmark sizing and the purple terminal dot match the existing web header. The existing flask icon is canonical and remains distinct from Synaptik's neural-S artwork.
- The native navigation menu scrolls within the available viewport, including short phones and larger text.
- The home tutorial heading wraps within a 320px viewport. Home content respects the bottom safe area and iOS keyboard insets.
- Native onboarding documentation accurately describes the device API-key connection; the website retains its OpenRouter connection flow.
- Optional Google sign-in no longer crashes the whole app in Expo Go. Compatible native builds continue to use its official button and load the native module on demand.
- Legacy LayoutAnimation setup is skipped under the new renderer, removing its unsupported-operation warning.

## Verification

- TypeScript and all 57 unit/contract tests passed, including missing/present optional Google module startup tests.
- Web, Android, and iOS JavaScript/Hermes exports passed. These are not signed native build checks.
- 77 browser checks passed against the exported build: 17 routes at 320, 390, 768, and 1440px; preview tabs; provider-dialog password masking and Escape dismissal; report keyboard tabs; FAQ empty search; tutorial navigation; invalid article handling; mobile navigation; reduced motion; and a mocked OpenRouter return that restores the draft without starting an appraisal. The mock exchange used no real credentials or paid generation.
- A real SPRINT paper fetch succeeded through PubMed/PMC, with 25 reference identifiers resolved through Crossref. The analysis contract fixture passed quotation validation, deterministic scoring, and unable-to-assess behavior. This does not establish live provider output quality.
- Android API 35 in Expo Go: Home, navigation menu, Library, fictional example, score breakdown, Bias & evidence, provider setup, and keyboard scrolling were exercised. Home was inspected at approximately 320dp with 1.3x text scaling. The provider submission action was not called with a real key.

## Review locally

- [MedLit web preview](http://localhost:8128/)
- [Fictional example](http://localhost:8128/example)
- [Desktop](../output/uiux-2026-09-18/medlit-desktop-final.png)
- [Phone browser](../output/uiux-2026-09-18/medlit-phone-final.png)
- [Android home](../output/uiux-2026-09-18/android-home-final.png)
- [Android evidence tab](../output/uiux-2026-09-18/android-example-evidence-final.png)
- [Android keyboard and connection form](../output/uiux-2026-09-18/android-connect-keyboard-final.png)
- [77-check result](../output/uiux-2026-09-18/verified-checks.log)
- [Real retrieval result](../output/uiux-2026-09-18/fetch-smoke.log)
- [Analysis contract result](../output/uiux-2026-09-18/analysis-contract-smoke.log)

Rerun the browser suite with a resolvable `@playwright/test` installation. This workspace used:

```sh
PLAYWRIGHT_PACKAGE=/Users/anyaozmen/Downloads/synaptik/package.json MEDLIT_UI_URL=http://localhost:8128 node scripts/verify-uiux.mjs
```

## Remaining delivery gates

- iOS simulator execution remains blocked by the local Xcode license. The user was asked to accept it in Xcode; the agent did not accept it.
- Physical devices, signed native builds, live Apple/Google authentication, live provider connection/generation, cloud library synchronization, and production deployment were not verified in this pass.
- Android screenshots contain an Expo Go tools bubble in some captures. This is the development host overlay, not a MedLit production control.
