# MedLit Agent Contract

This repo is a public-facing scientific literature review product. Agents must optimize for product quality, structured outputs, and scientific credibility.

## Required Behavior

- Do not overclaim scientific certainty or imply MedLit replaces peer review or domain expertise.
- Keep UI, methodology, and output structure aligned.
- Prefer transparent, structured analysis over vague AI prose.
- Treat loading, error, empty, and citation or analysis-quality states as part of the feature.

## Done Criteria

Before saying work is complete:

- Run the most relevant checks for the changed area.
- Prefer `npm run test:fetch` and `npm run test:analyze` when analysis flows are touched.
- Run `npx tsc --noEmit` for TypeScript-heavy changes when feasible.
- Verify the actual user-facing or analysis flow touched.
- Report what changed, what was verified, and any remaining credibility risks.

## Anti-Patterns That Must Not Ship

- Hidden methodology drift.
- Generic AI summaries presented as rigorous analysis.
- Claims that outrun the documented methodology.
