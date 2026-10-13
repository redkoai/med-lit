# MedLit: audience, design and acquisition plan

Prepared October 13, 2026. This is a product-fit hypothesis informed by the current app and public sources. It is not customer research, a keyword-volume study, or evidence of traffic growth.

## Positioning

MedLit is a workbench for critically reading a specific scientific paper. Its useful distinction is an inspectable review trail: source coverage, supporting passages, open questions, and the reader's own notes. The promise should stay narrower than an autonomous systematic review or clinical decision tool.

Suggested primary message: **Read beyond the abstract.** Explain the next action immediately: bring a PubMed link or DOI, connect a supported AI provider, and inspect a structured appraisal.

## Whom to serve first

| Priority | Audience and moment | What they need | Product fit and friction |
| --- | --- | --- | --- |
| Primary | Medical students, residents and fellows preparing an assigned journal club paper | A clear account of the question, methods, important limitations and discussion points | Specific paper + repeat assignment fits the existing appraisal. API setup is significant friction. Start with the free teaching example and downloadable worksheet. |
| Secondary | Biomedical graduate students and early-career researchers reading papers for a lab meeting | Source-linked judgments, comparisons and a portable reading record | Existing Library, comparison and export fit individual reading. Do not promise collaborative lab workspaces or comprehensive literature coverage. |
| Distribution partners | Librarians, journal club organizers and evidence-based medicine educators | A transparent teaching aid they can inspect before recommending | Publish methodology, a labeled fictional example, a reusable worksheet and specific limitations. Invitations or outreach need separate authorization. |
| Later hypothesis | Clinicians maintaining a personal reading practice | Fast orientation with evidence they can verify | Clinical use carries a higher evidence and workflow bar. Avoid treatment advice and patient-data use as an acquisition message. |

The BMJ journal-club article describes journal clubs as a setting for critical appraisal learning. CASP provides different checklists for different study designs. Those are signals of a concrete educational task, not proof that these groups will adopt MedLit. Elicit publicly serves broad research and literature-review workflows; competing on generic “AI research” positioning would make MedLit's present value less clear.

## Design brief and review

Preserve the existing violet folded-page M artwork. The terminal idea comes from the user's request, not from treating a medical audience as programmers. A normal labeled input and normal buttons remain the primary interaction; no command knowledge is required.

- Paper: `#F8F9FC`; ink: `#242638`; editor: `#272938`; brand violet: `#5145CD`; editor action: `#C1B6FF`; quiet rule: `#DCDDE7`.
- IBM Plex Mono for the headline, short terminal labels and typed command. IBM Plex Sans for reading, buttons and explanations. Fonts are hosted locally with their license files.
- Left-aligned introduction, then one integrated workbench: dark paper input on the left, light evidence example on the right. Stack in reading order on phones.
- Brief typing on the introductory command only. No pretend model progress, infinite typing or blocked interaction. Reduced-motion users get the completed command.
- Use a labeled fictional report and three selectable findings to teach the real product model. Keep unknown evidence visibly unresolved.

Wireframe:

    M medlit.       Workspace  Library  Reading guides  Methodology  AI settings
    ~/medlit read --with-questions
    Read beyond                     A research workbench for the paper
    the abstract.                   you need to understand.
    ┌ new appraisal | library ───────────────────────────────────────────┐
    │ input / paper                 │ output / evidence                 │
    │ Paper URL or DOI              │ Fictional teaching example        │
    │ [                       ]     │ Strength | Concern | Unknown       │
    │ [ Appraise this paper    ]    │ Judgment + source + uncertainty   │
    │ Provider connection           │ How the appraisal works           │
    └───────────────────────────────────────────────────────────────────┘
    Task-specific reading guides → library → compact footer

Critique before implementation: an all-dark page with green text and fake console logs would be familiar terminal decoration but poor fit for long research reading. Restrict the dark surface to the actual input workbench, retain the violet identity, and keep the evidence surface light. Remove the previous numbered feature-card grid because it was not a necessary sequence.

## Search and AI-discovery content

These are intent targets, not measured search-volume estimates. Each route has a different job; avoid publishing synonym pages for the same question.

| Page | Search intent | Reader outcome | Product action |
| --- | --- | --- | --- |
| `/guides/journal-club` | journal club presentation template; how to review a paper for journal club | Original downloadable worksheet and suggested discussion agenda | Inspect an example, then appraise the assigned paper |
| `/guides/critical-appraisal` | how to critically appraise a research paper | Source-aware overview and links to study-design frameworks | Open methodology and the workspace |
| `/guides/randomized-trial-critical-appraisal` | critical appraisal of a randomized controlled trial | Result-specific questions and a worked missing-data concern | Review a trial and retain unresolved questions |
| `/guides/pubmed-paper-review` | review a PubMed paper with AI | Citation-to-appraisal workflow with retrieval limits | Paste a PubMed link |
| `/guides/abstract-vs-full-text` | can you critically appraise an abstract | Direct answer, missing-information example and source boundary | Inspect coverage in an appraisal |
| `/guides/bring-your-own-ai` | use OpenAI / Claude / Gemini API key for paper review | Honest provider setup, billing and storage expectations | Connect a supported provider |

Implemented foundations: static HTML, descriptive titles, canonical URLs, public crawlable links, a sitemap, factual Article/CollectionPage metadata, visible sources, update dates and linked related guides. Keep the existing machine-readable guide corpus in sync. Google's AI-search guidance says there are no special AI requirements or special schema to qualify; llms.txt is supplementary, not a ranking mechanism. Do not manufacture medical expertise, customer testimonials, local pages, citations or search-demand numbers.

## Acquisition and validation sequence

1. Publish and verify the guide + example + appraisal path on production. Submit the canonical sitemap in the correct Search Console property once access is available. Do not claim submission without a receipt.
2. Conduct five short interviews with people who recently presented journal club and five with biomedical graduate students. Ask them to show a recent paper and their current preparation notes. Observe where they stop trusting an AI review and where API setup prevents starting. These interviews have not been conducted.
3. Use the worksheet in a small, explicitly recruited journal-club pilot. Measure whether participants can locate the source behind a claim and distinguish missing information from a negative finding. Avoid measuring success only by self-reported time saved.
4. After indexing, evaluate Search Console impressions and clicks by landing page and query intent. Look for qualified use through the existing consent-respecting product flow events: appraisal started, completed and failed. Page visits alone do not demonstrate usefulness.
5. Expand only from demonstrated use: a cohort-study guide or a diagnostic-study guide may follow if readers search for those questions. Revisit content when methodology or provider behavior changes. Do not mass-generate pages on disease treatments.

## Measurement and hosting boundaries

The current first-party collector supports broad appraisal flow events; it does not establish a complete organic-landing-to-appraisal attribution funnel. Add only coarse, allowlisted guide identifiers if that funnel is needed. Do not collect API keys, article text, paper URLs, query strings, notes or health information for acquisition analytics. Actual query demand and conversion baselines still need measurement.

On October 13, Redko Team ownership of the canonical Vercel URL-prefix property was verified in Search Console using the HTML tag. Google confirmed sitemap submission. The initial sitemap report showed "Couldn't fetch"; a subsequent Google live URL test confirmed the sitemap is available to Google. The public endpoint returns HTTP 200, application/xml and 14 valid URL entries, including all six guides. Sitemap processing and indexing remain unconfirmed; submission is not traffic or ranking evidence.

Keep the existing Vercel origin canonical until a chosen Redko domain is connected and verified. Vercel can continue hosting an app at a custom domain while retaining its Vercel URL. A later canonical change needs a deliberate redirect/canonical plan; do not publish duplicate competing copies or move Wix/DNS as part of this design change.

## Sources consulted

- BMJ Evidence-Based Medicine, *Journal Clubs: 2. Why and how to run them and how to publish them*: https://ebm.bmj.com/content/22/6/232
- CASP, study-design-specific critical appraisal checklists: https://casp-uk.net/casp-tools-checklists/
- Cochrane Handbook, chapter 8, result-specific risk-of-bias assessment: https://www.cochrane.org/authors/handbooks-and-manuals/handbook/current/chapter-08
- Elicit, current research workflows and audiences: https://elicit.com/
- Google Search Central, AI features and your website: https://developers.google.com/search/docs/appearance/ai-features

No paid keyword dataset or MedLit Search Console performance was available for this plan. These recommendations should be tested against observed behavior.
