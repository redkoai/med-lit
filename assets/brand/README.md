# MedLit identity · September 2026

The folded-page M uses two violet page forms with a central reading crease and a clipped corner. It replaces the previous flask at the user's request.

- Canonical vector: `mark.svg`
- Transparent PNG: `mark.png`
- Palette and favicon framing: `brand.json`
- App icon: `../icon.png`, 1024px, opaque pale lavender
- Android foreground: `../adaptive-icon.png`, transparent and inset for platform masks
- Splash: `../splash-icon.png`, transparent
- Web assets: `../../public/icon-192.png`, `icon-512.png`, `apple-touch-icon.png`, favicons
- Social preview: `../../public/og-image.svg`
- Previous icon and imagegen concept/prompt record: `2026-09-redesign/`

Use the supplied mark, preserve its central gap, and scale proportionally. Use the app icon when a contained badge is needed; use the transparent mark for other lockups. Do not add shadows, outlines, gradients or tiny lettering.

Production masters are clean authored vectors developed from built-in imagegen concepts. The raster edit with a checkerboard was rejected as a production asset. Export with `node scripts/export-brand.cjs` using a local Sharp installation, or set `SHARP_MODULE` to its absolute module path. No product dependency was added.

Applied locally to shared web/native headers, app/launcher/splash icons, browser metadata and the social preview. The existing native splash image reference was corrected to the new asset catalog entry. TypeScript, existing brand tests and the web export pass. Desktop and phone web headers and the Android in-app header were inspected. No production deployment or signed native release was performed. The previous iOS simulator license blocker remains.
