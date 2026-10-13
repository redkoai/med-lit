# App Store release

Use Fastlane 2.239.0 with Ruby 3.1+ (`bundle install`). Localizations are product-page translations; the app interface is currently English and every localized description says so. They do not imply localized clinical protocols or validated health outcomes.

## Existing account and listing preservation

Put `ASC_KEY_ID`, `ASC_ISSUER_ID`, and `ASC_KEY_FILEPATH` in ignored `fastlane/.env`, with an App Manager API key stored outside this repository. `APPLE_TEAM_ID` must identify the existing developer team. Never paste private keys into source, command arguments, issue reports, or chat. No key or certificate is included here.

- `bundle exec fastlane ios validate_metadata`: checks all localizations.
- `bundle exec fastlane ios snapshot_live_listing`: preserves both live and editable metadata and screenshots before any write. Stops if the account/app is unavailable; never guesses an Apple app ID.
- `npm run release:prepare:ios`: validates public environment configuration, then generates the iOS project. Run native tests and capture screenshots from the actual binary.
- `bundle exec fastlane ios build`: signs an archive using the configured team.
- `bundle exec fastlane ios upload_metadata`: snapshots first, updates text only, and does not submit.
- `bundle exec fastlane ios submit`: snapshots first, uploads the exact verified binary and real screenshots, submits for review, and leaves release manual after approval.

`readiness.json` is a local release evidence record, not an approval checkbox to bypass. Record `native_device_qa`, `google_sign_in`, `apple_sign_in`, `account_deletion`, `privacy_labels`, `age_rating`, `content_rights`, `reviewer_access`, and `screenshots` as true only after actual verification. Include `source_sha256` from the fingerprint lane and `ipa_path`/`ipa_sha256` for the exact binary. `ASC_REVIEW_INFORMATION_JSON` holds private Apple review contact/details outside the repository. `ASC_SUBMISSION_INFORMATION_JSON` contains the verified export-compliance answers for this build; use the encryption-exemption assessment in the release notes, not a blanket claim that HTTPS uses no encryption. Review account credentials or AI access are never bundled.

## Store growth

Lead screenshots with the actual core activity; then show the library, saved results, and privacy controls. Use genuine iPhone and iPad captures, legible captions, and no performance or treatment promises. Localize captions alongside descriptions once the final screenshots exist. Keep the first release focused; compare product-page variants using Apple's Product Page Optimization after release. Measure store impressions → product page → downloads → first completed activity, without sending symptoms, screening answers, paper text, credentials, or game-specific health categories to marketing analytics. Ask for a review only after a meaningful completed activity, using Apple's native request API, with no incentive or selective positive-rating gate. No paid advertising or outreach has been started by these lanes.

Sources: https://developer.apple.com/app-store/product-page/ ; https://developer.apple.com/app-store/review/guidelines/ ; https://docs.fastlane.tools/actions/deliver/
