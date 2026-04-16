# MedLit

MedLit is a scientific literature analysis app focused on giving fast, structured reviews of medical or scientific papers with plain-language summaries, methodological critique, and bias-aware scoring.

## What This Repo Contains

- `app/`
  Expo Router application screens
- `src/`
  Shared components, services, hooks, and analysis logic
- `scripts/`
  Local testing utilities for fetch and analysis flows
- `METHODOLOGY.md`
  Core scoring and review framework
- `SEO_AND_DEPLOY.md`
  SEO, GEO, and deployment notes
- `FEATURES_ADDED.md`
  Feature tracking / recent additions

## Stack

- Expo
- React Native Web
- Expo Router
- Firebase

## Commands

```bash
npm install
npm run start
npm run web
npm run ios
npm run android
npm run export:web
npm run test:fetch
npm run test:analyze
```

## Product Intent

MedLit should be useful for:

- fast paper triage
- bias and methodology review
- plain-English synthesis
- medical education
- literature comparison workflows

It should avoid overclaiming scientific certainty. The product is strongest when it helps users read papers more critically, not when it pretends to replace peer review or domain expertise.

## Development Notes

- Keep scoring frameworks transparent and documented.
- Prefer structured outputs over vague AI prose.
- Keep deployment, SEO, and citation surfaces consistent with the methodology docs.
- Use local env/config for secrets only.
