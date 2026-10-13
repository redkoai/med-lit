# MedLit account activation

## Verified external state

Created the separate Firebase project **MedLit Evidence**, project ID `medlit-evidence`, in the existing REDKO Google organization/account on September 12, 2026. Firebase Console showed Spark, no-cost $0/month. Google Analytics was disabled during creation. Authentication was initialized, but no sign-in provider was enabled and the project is not connected to the public app. No existing project data was imported or changed. Do not create another duplicate project.

Console: https://console.firebase.google.com/project/medlit-evidence/overview

The legacy shared project `med-lit` is intentionally rejected by `projectBoundary.ts`; do not weaken that boundary to speed up activation. Firebase CLI credentials were expired; the browser had an active REDKO session. No private credentials were copied from browser storage or from another product.

## Implementation

- Web uses Firebase Google and Apple popups. Native uses the official Google and Apple SDK controls, Google ID-token exchange and fresh Apple nonce binding.
- Independent `EXPO_PUBLIC_ENABLE_GOOGLE_SIGN_IN` and `EXPO_PUBLIC_ENABLE_APPLE_SIGN_IN` flags default false. Dedicated cloud configuration is also required. Native Google additionally requires the correct iOS/web OAuth client IDs; native Apple is iOS-only and checks device availability.
- Provider availability is enforced by the auth service as well as the UI. Email is progressively disclosed; the provider, account and AI-billing concepts stay distinct. Cancellation, blocked popups, unauthorized domains, credential conflicts and rate limits have recovery messages.
- Existing same-user reauthentication, Apple revocation and scoped account deletion remain in place. They require a real-backend end-to-end test before any production claim.

## Remaining activation gates

1. Owner confirmation requested before enabling public Google account creation and deploying owner-scoped private-library rules through Firebase Console.
2. Register the MedLit web and native app identities in this dedicated project. Use the existing bundle ID `com.redko.medlit`; do not create a new Apple app identity by guesswork.
3. Configure the Google provider and a monitored support address; authorize the exact production domain. Configure native client IDs, URL scheme and Android release SHA fingerprints where applicable.
4. Configure Apple in the owner's developer team: primary App ID capability, Services ID for the website, approved domains/return URL, team ID, key ID and private signing key. Private material belongs in the provider configuration, never an `EXPO_PUBLIC_*` variable or source file. Owner Apple access is still needed.
5. Create the dedicated Firestore database, review its region and deploy `firestore.rules`/indexes. Test unauthenticated denial, cross-user denial, permitted user operations, guest isolation/import and account deletion. Do not use test-mode public rules.
6. Set the dedicated public Firebase config in Vercel and the native build environment. Only then enable each verified provider flag, one at a time. Test create/login/cancel/reset/session-restoration/deletion on the exact hosted/signed candidate.

Apple and Google sign-in do not supply AI credits or access a ChatGPT subscription. They authenticate the MedLit library account only.

Official references: [Firebase Google web auth](https://firebase.google.com/docs/auth/web/google-signin), [Firebase Apple web auth](https://firebase.google.com/docs/auth/web/apple). The local SDK's gapi loader uses `https://apis.google.com/js/api.js`; the production browser policy must permit that loader before web OAuth is activated.

The candidate CSP now permits the official `apis.google.com` loader and retains the Firebase-only auth frame, no inline/eval scripts, and `frame-ancestors 'none'`. The web-security checker guards this prerequisite. Provider authorization, redirect-domain approval and real sign-in still require separate verification.
