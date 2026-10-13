# Production release checklist

## Current web release

- September 10, 2026: analysis contract 4.1.0. See `docs/release-4.1-2026-09-10.md` for the own-account AI workflow, privacy/UI changes, exact validation, and remaining gates.
- Public guest-mode deployment: https://medlit-evidence-appraisal.vercel.app
- The canonical URL, sitemap, security headers, and allowlisted article proxy are configured for this origin.
- Account sign-in and cloud sync remain intentionally unavailable until a dedicated MedLit Firebase project passes the gates below.

## Automated gates

- `npm ci --ignore-scripts`
- `npm run typecheck`
- `npm test`
- `npm run test:analyze`
- `npm run test:fetch`
- `npm run test:ingest`
- `npm run export:web`
- `MEDLIT_SMOKE_URL=<candidate-url> npm run test:web-ui`
- Browser verification of home, Settings, example retrieval, analysis, saved-library reopen, export, privacy, terms, responsive layout, keyboard flow, console, and network errors

## External configuration gates

- Use a dedicated Firebase project, not a shared product project.
- Deploy `firestore.rules` and enable email/password plus authorized web domains.
- Configure reCAPTCHA v3 App Check and enforce it for Firestore after verifying live traffic.
- When enabling accounts, set only public Firebase config in Vercel. Never deploy AI-provider keys.
- Confirm `privacy@redko.ai` is monitored or replace the public contact before launch.
- Review Vercel request logs/retention and configure spend/traffic alerts.
- Add a persistent edge/WAF rate limit or managed rate-limit store before high-volume promotion; the repository throttle is a per-instance defense, not a distributed quota.
- Add the production origin to Firebase authorized domains.
- Complete a real, blinded expert benchmark before making validation or agreement claims.
- Complete trademark/name clearance and select a controlled custom domain before investing in the MedLit name as a durable public brand.

## Scope boundary

The supported launch surface is structured metadata, JATS/XML, open-access HTML, abstracts, and bounded machine-readable PDF text. Page markers, HTML table text, PDF table-row candidates, and up to three allowlisted supplement files are captured when possible. Reading order, scans/OCR, figures, equations, complex table meaning, and inaccessible/oversized supplements remain incomplete. Do not market extraction as equivalent to a human review of the original article and all supplements.
