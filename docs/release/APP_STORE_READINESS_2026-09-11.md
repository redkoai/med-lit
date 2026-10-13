# MedLit iOS release readiness — 11 September 2026

Status: local release preparation; **not uploaded or submitted to Apple**. The separately verified web release is https://medlit-evidence-appraisal.vercel.app; its exact snapshot and limitations are in `docs/web-publication-2026-09-11.md`. Later native/auth changes are not claimed deployed there.

## Implemented

- Native Google and Apple sign-in components and Firebase credential exchange. Apple uses a fresh hashed nonce. Reauthentication confirms the same account before deletion. Native Apple authorization-code revocation is distinct from web access-token revocation and fails closed.
- Firebase native sessions use device-only Keychain storage with Unicode-safe chunks, atomic index publication, and removal of the exact old AsyncStorage credential key. This may require existing users to sign in again. Provider keys already use the app's existing secure native storage path.
- Account deletion supports password, Google and Apple; removes the known owner Firestore subcollections in bounded batches, the profile and account-specific device library, revokes provider access, then deletes the Firebase account. This needs end-to-end testing on the dedicated backend; it is not a verified production flow.
- Fastlane 2.239.0, complete metadata validator, live/editable listing backups before writes, build/upload/submission lanes, and a private source/binary evidence record. Submission leaves release manual after review.
- Ten product-page locales: en-US, en-GB, de-DE, es-ES, fr-FR, pt-BR, it, tr, ja, zh-Hans. Names, subtitles, keywords, descriptions, promotional text, release notes and URLs pass local validation. The app interface is English and all descriptions disclose that distinction.
- Metadata discloses AI/source limitations and the bring-your-own-provider requirement, including possible provider usage charges. No diagnosis, truth-score or replacement-for-peer-review claim was added.
- Public-environment and bundled-secret checks; release credentials, artifacts and signing files are excluded from source/build uploads.

## Verification

- `npm run test`: 51/51 pass; TypeScript passes. Analysis/retrieval logic was not changed; the separate web-publication record contains the passing fetch/analyze checks for that release.
- Actual Fastlane `validate_metadata` and `fingerprint` lanes pass; all 10 product-page locales validate.
- CocoaPods and unsigned **Release simulator** build pass with Xcode 26.6 / iOS 26.5. This does not establish physical-device, signing, or App Store readiness.
- Simulator launch exposed native HTML-metadata alerts; native metadata adapters now omit web SEO/Handoff. A browser-only analytics initializer also crashed native settings; native-specific adapters keep that collector off and a regression test passes. The browser collector is unchanged.
- Native header now uses safe areas and an actual expandable menu rather than relying on website CSS media queries. Home, menu, the honest cloud-disabled account screen, guest return, and the settings screen with native analytics off were observed in the simulator. The final status-bar contrast correction also compiled successfully (`output/release-ios-final.log`).
- Bounded native bundle credential scan passes; no matching private-key/provider-secret/service-role signature was detected. All possible secret/runtime exposure is not ruled out.
- Dependency scan: 10 moderate advisories, zero high/critical.

Private diagnostics live in `output/release-*`.

## Required before submission

1. Restore the connected Apple account and verify the existing team and `com.redko.medlit` app record. The browser currently requires sign-in; local App Store API credentials and signing identities are unavailable. EAS is also logged out. Do not invent team/app identifiers or create duplicates.
2. Set up and verify a dedicated MedLit Firebase project/configuration, deployed owner rules and native Google/Apple providers. Cloud accounts and synchronization currently fail closed because that configuration is absent. Do not borrow another product's private database or turn on an unverified configuration merely to show working buttons.
3. Configure the real Google iOS/web OAuth IDs, Apple capability/provider, and URL scheme; verify signup, cancellation, session restoration and deletion on the signed candidate. An implemented button is not evidence of provider approval.
4. Verify a complete native retrieval → analysis → citations → saved result/export flow on physical devices. Supply an appropriate review-access path for paid provider usage without putting an owner's API key in the app or store metadata. BYOK/external provider purchase behavior requires App Review assessment; approval is not assured.
5. Finalize public support/privacy contact and operator details, privacy disclosures, age rating, export compliance and content rights. The temporary FAQ support URL must provide an actual support channel before submission.
6. Capture genuine iPhone/iPad screenshots of the final app. Localize captions and review translations. Do not upload web screenshots as native evidence.
7. Review the remaining moderate native-tooling dependency findings and test the exact signed release. Populate private readiness flags only after verification, bind them to the source fingerprint and IPA hash, then submit using Fastlane.

## Privacy and product quality

Device-only Keychain storage applies to native credentials; saved article/library content remains app-readable device storage and is not end-to-end encrypted. Provider requests and retention depend on the selected provider and current disclosure. User consent is required for optional generic analytics; provider keys, article passages and search/analysis content must not become marketing telemetry. Methodology, coverage limitations and supporting sources must remain visible in loading, success and failure states.

Lead screenshots with an actual supported paper and traceable evidence, then the saved library and methodology controls. Use Apple's product-page experiments after launch and measure download-to-first-successful-appraisal separately from acquisition. No bought reviews, keyword stuffing, clinical promises, paid campaign or unsolicited outreach was started.

Sources checked: [Apple review guidelines](https://developer.apple.com/app-store/review/guidelines/), [Apple product pages](https://developer.apple.com/app-store/product-page/), [Fastlane deliver](https://docs.fastlane.tools/actions/deliver/), [Firebase native Apple revocation source](https://github.com/firebase/firebase-ios-sdk/blob/main/FirebaseAuth/Sources/Swift/Backend/RPC/RevokeTokenRequest.swift).
