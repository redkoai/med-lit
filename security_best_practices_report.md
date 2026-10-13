# MedLit release-focused security review

11 September 2026. Scope: native provider authentication, persistence, account deletion, release metadata/artifacts and dependency advisories. Existing server retrieval/analysis security has a separate web-publication verification record; this review is not an exhaustive penetration test or an assurance that every service is secure.

## Implemented controls

- Native Firebase refresh/session credentials use device-only Keychain storage (`src/services/secureAuthStorage.ts:7`) with Unicode-safe chunks, index-last publication, failure cleanup and exact legacy credential removal. Existing provider-key handling and guest content are preserved.
- Apple SDK sign-in uses nonce binding. `src/services/appleTokenRevocation.ts` sends the native authorization code as CODE, not ACCESS_TOKEN, to Firebase's native revocation endpoint. Web revocation requires its actual OAuth access token. Tests cover token type, app identity, missing configuration and sanitized failures.
- `src/services/auth.ts:92` confirms the existing account before deleting its known Firestore subcollections, profile, local library and login. Data deletion does not silently erase another account or guest library. Live provider/account deletion remains unverified because dedicated cloud setup is absent.
- `src/services/firebase.ts:23` keeps accounts/cloud disabled when dedicated configuration is missing. No cross-product private Firebase credentials were inserted to make the UI appear connected.
- `src/components/PageMeta.native.tsx` prevents website metadata from implicitly publishing private appraisal titles through native Handoff/Spotlight and fixes repeated native startup alerts. The website retains canonical/noindex behavior.
- Fastlane ignores keys and signing outputs, preserves existing live/editable listings before writes, requires the exact source/IPA evidence record, and does not automatically release after review. Environment and bundle checks do not print secret values.

## Remaining findings

| ID | Priority | Evidence and impact | Required follow-through |
| --- | --- | --- | --- |
| MED-01 | High for release readiness | Dedicated cloud/provider configuration is absent. Social buttons and deletion code are not proof of working signup, isolation or account removal. | Connect the dedicated Firebase project, deploy owner rules, configure Google/Apple app identity, and test signup/restart/deletion with disposable accounts on the signed binary. |
| MED-02 | Moderate | Article/library caches remain app-readable device storage; native credential Keychain protection does not encrypt saved paper content. Provider requests/retention follow selected-provider settings. | Keep accurate disclosures and deletion/export controls; never promise end-to-end encryption or zero provider retention without implemented and verified controls. |
| MED-03 | Moderate | npm reports 10 moderate dependency findings in the current Expo/native tooling chain and zero high/critical. This count is a point-in-time advisory scan, not exploitability proof. | Review advisories and adopt compatible fixes with exact native/web checks; do not force unrelated major upgrades during a release. |
| MED-04 | Release blocker | Apple team/signing access, reviewer AI access, final support/privacy contact, privacy labels and physical-device QA are not complete. BYOK/external paid-provider behavior needs App Review assessment. | Complete the documented readiness requirements without bundling owner API keys or inventing compliance answers. |

## Evidence and limits

The release readiness report records exact checks. A bounded scanner checks the actual native bundle for private-key/provider-secret/service-role signatures; passing does not prove that every possible secret or sensitive runtime event is absent. This review does not certify scientific conclusions, native provider E2E behavior, production cloud rules, backup deletion or App Store approval. No Apple upload or submission occurred.
