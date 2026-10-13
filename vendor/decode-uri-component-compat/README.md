# Temporary CommonJS compatibility facade

Expo Router 57 imports query-string 7, which requires the old callable CommonJS
decoder. decode-uri-component 0.5.0 fixes CVE-2026-45822 but exports ESM. This
facade preserves the call signature and delegates to the unmodified upstream
0.5.0 package under an npm alias; no decoder algorithm is forked.

Node 24 and Metro support this interop. Tests exercise malformed inputs through
query-string itself, and the exported website must pass browser navigation.
Remove the override when Expo Router adopts a patched compatible dependency.

Upstream advisory: https://github.com/advisories/GHSA-vcc3-ghjq-m6fr
