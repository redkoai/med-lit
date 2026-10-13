# Research workspace revision

## Product premise

Hypothesis, not human-tested evidence: a student, researcher or research-literate reader needs to understand what a paper actually supports, with less setup and clearer source limitations.

Critical path: choose link/PDF/text → inspect input and sharing limits → connect a personally funded AI provider → explicitly start appraisal → inspect passage-linked findings and uncertainty → save/reopen/export. Account signup is optional and distinct from connecting an AI provider. No surprise generation charges or mandatory account wall.

Scope clarification: the user's last sentence about input types was cut off. The implemented revision retains the existing DOI/article-link intake and lawful retrieval; arbitrary pasted manuscripts, local PDF uploads and OCR were assessed but not added without clarifying that request. No new upload destination or silent source-provenance assumption was introduced.

## Visual direction

A research desk with a single prominent intake surface and an interactive, explicitly fictional evidence preview. White paper against a pale blue-grey workspace; ink navy #192443, indigo #4C46C8, pale iris #EEEDFF, muted slate #647086 and restrained amber #9A641B for uncertainty. Avenir Next where available and system sans-serif fallbacks. Body 16–17, controls at least 14; mobile hierarchy and safe areas are designed explicitly.

Layout is left-aligned and task-first, not a marketing hero above the tool. Desktop combines the input workspace and teaching preview; native stacks the real task first, with preview collapsed by choice. Quiet supporting navigation and mission content sit below. This replaces the old oversized slogan + repeated cards rather than merely recoloring it.

Motion gates: press feedback at 120 ms; occasional disclosure/paper-preview feedback at 220–280 ms; native stack transitions for navigation. No looping decoration or sliding tab changes. Reduced motion removes transforms. Simulator checks are not a real-device performance certification.

## Release gates

- Preserve scientific methodology and deterministic scoring; user-provided source authenticity must not be inferred from quote matches.
- Apple/Google require the dedicated backend/provider configuration and real account tests; inactive buttons are not completion.
- Input limits, upload/provider destinations, unreadable-PDF recovery and partial-text coverage must be visible.
- Terms/privacy must describe implemented practices, retain non-waivable rights, and avoid claiming that all liability disappears. Operator identity/contact need owner confirmation and legal review.
- Verify web and native render/interaction, errors, empty/loading states, text scale, keyboard navigation, reduced motion and account-disabled fallback.
- Do not touch the personal portfolio or Synaptik in this revision.

## Verification notes

The first browser run caught a width-dependent SSR/hydration mismatch. Home now starts with identical server/client markup before using the measured width. Visual inspection also caught mobile column flex causing preview overlap; the desktop flex ratio is now removed on stacked layouts. These were source fixes, not hidden or suppressed test errors.

The current approach is an unvalidated usability hypothesis. Agent-driven checks verify mechanics, not human comprehension or desirability. Next human test: five research readers should connect their own provider, explain what the score does not mean, trace one supported judgment and identify one unknown, then reopen a saved report. Track successful task completion, errors and help needed, not time spent for its own sake.
