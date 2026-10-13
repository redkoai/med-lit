# Security policy

Report suspected security issues privately to `privacy@redko.ai`. Do not include live credentials or sensitive article content in a public issue.

## Current controls

- Provider keys are excluded from Firestore, exports, logs, and repository files.
- Native secrets use encrypted device storage; web secrets stay only in memory and expire on refresh, close, or disconnect. No provider key is written to browser storage.
- Retrieval and ingestion endpoints accept HTTPS only, reject credentials in URLs, enforce an explicit scientific-host allowlist, recheck redirect destinations, apply timeouts and size/page limits, and use a bounded per-instance abuse throttle. The text proxy rejects binary content; the dedicated ingestion route handles bounded PDFs.
- Structured server logs contain request IDs, source hosts, sizes, timing, and failures—not provider keys or retrieved article text. Persistent distributed rate limiting, log drains, and spend alerts remain deployment-account controls.
- Firestore rules scope user profiles, preferences, and analyses to the authenticated owner; preference documents cannot contain provider-key fields.
- Browser security headers restrict scripts, network destinations, frames, forms, sensors, and referrer detail.
- Executable inline scripts use exact CSP hashes; a build gate rejects unmatched scripts. No script `unsafe-inline` or `unsafe-eval` is permitted. Inline styles remain necessary for React Native Web.
- Provider connection checks use fixed hosts, header-only keys, omitted browser credentials, and rejected redirects. Keys never appear in Gemini query strings.
- New portable links keep their payload in a URL fragment, outside HTTP request URLs. Legacy query links remain readable; treat existing shared links as already disclosed.
- Scientific-source text is treated as untrusted input and cannot supply instructions to the model.
- Portable public snapshots exclude private notes and reviewer feedback, but the snapshot itself is readable by anyone with its URL.

Rotate any credential that was ever committed. Never commit `.env` or `.p8` files.

## September 10 dependency review

Compatible updates remove the browserslist and js-yaml high advisories. The runtime decoder vulnerability CVE-2026-45822 is fixed by upstream decode-uri-component 0.5.0 through a small CommonJS compatibility facade required by Expo Router. `npm audit --omit=dev` still reports 10 moderate entries, all tracing to uuid 3 in Expo's xcode/config build tooling; they are not ten independent browser vulnerabilities. No forced Expo downgrade was applied. Native build-tool remediation and an independent penetration test remain outstanding.
