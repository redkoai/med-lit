# MedLit brand consistency

The existing flask artwork in `assets/icon.png` is the canonical mark. It is unchanged. Both web and native workspace headers now render it through `BrandMark`, instead of separate reader glyphs. Existing 192px/512px exports supply the web manifest and favicon; the 180px export supplies the Apple touch icon. The obsolete, differently drawn `public/favicon.svg` was removed. Wordmark, typography, palette, and product behavior are unchanged.

Verification: TypeScript, 55 tests, 21-route web export, security-header/inline-script checks, and iOS JavaScript/Hermes export passed. Chrome inspection covered desktop and 375x667 layouts, the rendered flask, mobile navigation, FAQ and logo return-home behavior. Exported favicon/manifest references and public asset bytes were checked. New brand regressions cover shared header artwork and icon metadata.

Local preview: http://localhost:8118/. No production deployment or native binary distribution occurred. The iOS export is a bundle check, not a simulator/device run. Xcode currently requests acceptance of its license, so no new native build was attempted. Existing unrelated dirty work was preserved. No methodology, account, privacy, telemetry, or scientific-claim changes were made.
