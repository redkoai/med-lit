// Root HTML for web — SEO, Open Graph, and LLM/AI discovery.
// Replace BASE_URL with your real domain (e.g. from Vercel/Netlify) when you have one.

import { ScrollViewStyleReset } from 'expo-router/html';

const BASE_URL = 'https://medlit.app'; // Replace with your deployed URL when you have a domain
const SITE_NAME = 'MedLit';
const TAGLINE = 'Scientific Literature Analyzer';
const DESCRIPTION =
  'Analyze any medical or scientific paper in seconds. Paste a PubMed, DOI, or journal link—get accuracy scores, bias detection, methods review, and plain-English summaries. Free tool for researchers, clinicians, and students.';
const KEYWORDS =
  'medical literature analyzer, scientific paper analyzer, PubMed analyzer, critical appraisal tool, evidence-based medicine, bias detection, research paper quality, journal article appraisal, plain language summary, CEBM, PRISMA, CONSORT, STROBE, Cochrane RoB 2, research paper checker, DOI analyzer, study quality assessment, medical research tool, paper bias checker, academic paper analyzer, free research tool, PubMed paper review, NEJM paper analyzer, Lancet paper analyzer, Nature paper analyzer, bioRxiv analyzer, medRxiv analyzer, systematic review tool, RCT appraisal, observational study checker, conflict of interest checker, ICMJE standards, statistical methods review, Oxford CEBM, ROBINS-I, Newcastle-Ottawa Scale';

export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* ——— Primary SEO ——— */}
        <title>MedLit — Scientific Literature Analyzer | Free PubMed & DOI Paper Appraisal Tool</title>
        <meta name="description" content={DESCRIPTION} />
        <meta name="keywords" content={KEYWORDS} />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        <meta name="bingbot" content="index, follow" />
        <link rel="canonical" href={BASE_URL} />

        {/* ——— Author & Publisher ——— */}
        <meta name="author" content="MedLit" />
        <meta name="publisher" content="MedLit" />
        <meta name="copyright" content="MedLit" />
        <meta name="category" content="Health, Research, Medical Education, Science" />
        <meta name="classification" content="Health/Medicine, Science/Research" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        <meta name="revisit-after" content="7 days" />
        <meta name="language" content="English" />
        <meta name="target" content="researchers, clinicians, medical students, scientists, academics" />

        {/* ——— Open Graph (Facebook, LinkedIn, AI crawlers) ——— */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={BASE_URL} />
        <meta property="og:title" content={`${SITE_NAME} — Free Scientific Literature Analyzer | PubMed & DOI Appraisal`} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:image" content={`${BASE_URL}/og-image.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="MedLit — Scientific Literature Analyzer. Paste a PubMed or DOI link, get accuracy scores and plain-English summaries." />
        <meta property="og:image:type" content="image/png" />

        {/* ——— Twitter / X Card ——— */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@medlit_app" />
        <meta name="twitter:creator" content="@medlit_app" />
        <meta name="twitter:title" content={`${SITE_NAME} — Free Scientific Literature Analyzer`} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={`${BASE_URL}/og-image.png`} />
        <meta name="twitter:image:alt" content="MedLit — Scientific Literature Analyzer" />

        {/* ——— Favicons & PWA ——— */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icon-192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0F2E4E" />
        <meta name="application-name" content={SITE_NAME} />
        <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* ——— AI / LLM discovery signals ——— */}
        {/* llms.txt is the crawlable plain-text index for AI engines */}
        <link rel="alternate" type="text/plain" href={`${BASE_URL}/llms.txt`} title="AI-readable site summary" />

        <ScrollViewStyleReset />

        {/* ——— JSON-LD structured data for Google rich results and AI citation ——— */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                // ── Organization ──
                {
                  '@type': 'Organization',
                  '@id': `${BASE_URL}/#organization`,
                  name: 'MedLit',
                  url: BASE_URL,
                  logo: {
                    '@type': 'ImageObject',
                    url: `${BASE_URL}/icon-192.png`,
                    width: 192,
                    height: 192,
                  },
                  description:
                    'MedLit builds free tools for critical appraisal of medical and scientific literature, helping researchers, clinicians, and students evaluate study quality.',
                  sameAs: [
                    'https://twitter.com/medlit_app',
                  ],
                },
                // ── WebSite ──
                {
                  '@type': 'WebSite',
                  '@id': `${BASE_URL}/#website`,
                  url: BASE_URL,
                  name: SITE_NAME,
                  description: DESCRIPTION,
                  publisher: { '@id': `${BASE_URL}/#organization` },
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: {
                      '@type': 'EntryPoint',
                      urlTemplate: `${BASE_URL}/?q={search_term_string}`,
                    },
                    'query-input': 'required name=search_term_string',
                  },
                },
                // ── SoftwareApplication / WebApplication ──
                {
                  '@type': ['SoftwareApplication', 'WebApplication'],
                  '@id': `${BASE_URL}/#app`,
                  name: 'MedLit — Scientific Literature Analyzer',
                  url: BASE_URL,
                  applicationCategory: 'HealthApplication',
                  applicationSubCategory: 'Medical Education, Research Tool',
                  operatingSystem: 'Web, iOS, Android',
                  browserRequirements: 'Requires JavaScript',
                  offers: {
                    '@type': 'Offer',
                    price: '0',
                    priceCurrency: 'USD',
                    availability: 'https://schema.org/InStock',
                    description: 'Free to use. Bring your own Claude API key.',
                  },
                  description: DESCRIPTION,
                  featureList: [
                    'Accuracy score (1–10) using CEBM frameworks',
                    'Bias risk detection with Cochrane RoB 2, ROBINS-I, and Newcastle-Ottawa Scale',
                    'Methods and statistics quality review (CONSORT, STROBE, PRISMA)',
                    'Reference index verification and citation quality check',
                    'Study design classification (Oxford CEBM Levels 1–5)',
                    'Conflict of interest flagging (ICMJE standards)',
                    'Plain-language summary using NLM Health Literacy Guidelines',
                    'Supports PubMed, DOI, Nature, NEJM, Lancet, BMJ, bioRxiv, medRxiv',
                    'Export to text, markdown, and BibTeX',
                    'Analysis history stored per user',
                    'No account required to start',
                    'iOS and Android apps available',
                  ],
                  screenshot: `${BASE_URL}/og-image.png`,
                  publisher: { '@id': `${BASE_URL}/#organization` },
                  audience: {
                    '@type': 'Audience',
                    audienceType: 'Researchers, Clinicians, Medical Students, Scientists, Academics',
                  },
                  keywords: KEYWORDS,
                },
                // ── HowTo ──
                {
                  '@type': 'HowTo',
                  name: 'How to analyze a scientific paper with MedLit',
                  description:
                    'Use MedLit to critically appraise any PubMed, DOI, or journal article URL in three steps.',
                  totalTime: 'PT1M',
                  tool: { '@type': 'HowToTool', name: 'MedLit', url: BASE_URL },
                  step: [
                    {
                      '@type': 'HowToStep',
                      position: 1,
                      name: 'Paste the article URL or DOI',
                      text: 'Copy the URL from PubMed, DOI.org, Nature, NEJM, Lancet, BMJ, bioRxiv, medRxiv, or any major journal. Paste it into the MedLit input box.',
                      url: BASE_URL,
                    },
                    {
                      '@type': 'HowToStep',
                      position: 2,
                      name: 'Click "Analyze Article"',
                      text: 'MedLit fetches the full text (using PMC, Europe PMC, or Unpaywall), then runs a two-stage AI pipeline with Claude at temperature 0.2 for consistent scoring.',
                      url: BASE_URL,
                    },
                    {
                      '@type': 'HowToStep',
                      position: 3,
                      name: 'Review your appraisal report',
                      text: 'You receive an accuracy score (1–10), bias risk rating, methods quality score, reference check, study design level, COI status, limitations list, and plain-language summary—all with evidence-based rationale.',
                      url: `${BASE_URL}/analysis`,
                    },
                  ],
                },
                // ── FAQPage ──
                {
                  '@type': 'FAQPage',
                  mainEntity: [
                    {
                      '@type': 'Question',
                      name: 'What is MedLit?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'MedLit is a free scientific literature analyzer. Paste a PubMed, DOI, or journal article URL and get an accuracy score (1–10), bias risk assessment, methods quality review, reference check, and plain-English summary powered by Claude AI. It is built for researchers, clinicians, and medical students who need fast, evidence-based critical appraisal.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'Is MedLit free to use?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Yes. MedLit is completely free. You bring your own Anthropic Claude API key (available at console.anthropic.com) and paste it in Settings. There is no subscription, no paywall, and no account required to start.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'Which journals and article sources does MedLit support?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'MedLit supports PubMed, PubMed Central (PMC), DOI links (doi.org), Nature, NEJM (New England Journal of Medicine), The Lancet, BMJ, JAMA, bioRxiv, medRxiv, Europe PMC, and virtually any journal accessible via a URL or DOI. It tries PMC Full Text first, then Europe PMC, Unpaywall, and PubMed abstract as fallbacks.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'How does MedLit score research papers?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'MedLit uses established evidence-based medicine frameworks: Oxford CEBM Levels of Evidence for study design, Cochrane RoB 2 and ROBINS-I for bias risk, CONSORT for RCTs, STROBE for observational studies, PRISMA for systematic reviews, and ICMJE for conflict of interest. Each score (1–10) is accompanied by a rationale citing specific text from the paper.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'What is a critical appraisal tool?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'A critical appraisal tool helps readers systematically evaluate the quality, validity, and relevance of a scientific study. It checks for methodological rigor, potential biases, statistical appropriateness, and transparency of reporting. MedLit automates this process using AI and established frameworks like CEBM, Cochrane RoB 2, PRISMA, and CONSORT.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'How does bias detection work in MedLit?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'MedLit uses the Cochrane Risk of Bias 2 (RoB 2) tool for randomized trials and ROBINS-I for non-randomized studies. It checks for selection bias, attrition bias (>20% dropout), detection bias (unblinded outcomes), reporting bias (selective outcomes), p-hacking (multiple testing without correction), HARKing (hypothesizing after results known), and confounding. The Newcastle-Ottawa Scale is applied for observational studies.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'What does the accuracy score measure?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'The accuracy score (1–10) evaluates internal scientific rigor: pre-registration (ClinicalTrials.gov, PROSPERO), adequate sample size with power calculations, appropriate statistical methods, effect sizes with confidence intervals (not just p-values), data and code availability for reproducibility, and conservative interpretation that avoids unsupported causal claims.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'How does MedLit check for conflict of interest?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'MedLit applies ICMJE (International Committee of Medical Journal Editors) standards to flag industry funding with favorable results, missing COI disclosures, and author financial relationships. The result is reported as FLAG (concern identified), CLEAR (no COI found), or DECLARED (COI disclosed).',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'What is the Oxford CEBM Levels of Evidence?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'The Oxford Centre for Evidence-Based Medicine (CEBM) hierarchy ranks study designs by quality: Level 1 (systematic reviews and RCTs, highest), Level 2 (cohort studies), Level 3 (case-control studies), Level 4 (case series), Level 5 (expert opinion, lowest). MedLit classifies every analyzed paper into the appropriate level.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'Can MedLit analyze papers behind a paywall?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'MedLit tries multiple free-access sources: PMC Full Text, Europe PMC, Unpaywall, and PubMed abstract. If you enable the Sci-Hub option in Settings, it can attempt to retrieve paywalled papers via Sci-Hub. For open-access articles and most PMC-indexed papers, full text is available without Sci-Hub.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'How accurate is MedLit\'s AI analysis?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'MedLit uses Claude at temperature 0.2 (low randomness) for consistency. Scores are calibrated to real-world benchmarks: Nature Medicine RCTs typically score ~7.5 accuracy and ~7 bias; Cochrane Systematic Reviews ~8–9 accuracy and ~8 bias; poor observational studies ~3–4. Every score requires the model to cite specific evidence from the paper—it cannot invent findings.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'What AI model does MedLit use?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'MedLit uses Anthropic\'s Claude (Sonnet or Opus, selectable in Settings). It runs a two-stage pipeline: Stage 1 extracts structured metadata from the article HTML/XML; Stage 2 performs full scoring analysis at temperature 0.2. You supply your own Claude API key from console.anthropic.com.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'Does MedLit work on mobile?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Yes. MedLit is available as a web app (works on any mobile browser), and as native iOS and Android apps. The iOS app is on the App Store and the Android app is on the Google Play Store.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'Can I export my MedLit analysis?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Yes. MedLit lets you export analyses as plain text, formatted Markdown, or BibTeX (for citation managers). You can also share results directly from the app.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'How is MedLit different from other research paper tools?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'MedLit is purpose-built for evidence-based medicine critical appraisal, using validated frameworks (Cochrane RoB 2, CEBM, PRISMA, CONSORT) rather than generic summarization. It gives scored dimensions with rationale, not just a summary. It is free (bring-your-own API key), requires no account, and works with PubMed, DOI, and all major medical journals.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'What reporting standards does MedLit evaluate?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'MedLit evaluates papers against: Oxford CEBM Levels of Evidence, Cochrane Risk of Bias 2 (RoB 2), ROBINS-I (non-randomized studies), CONSORT 2010 (randomized trials), STROBE (observational studies), PRISMA 2020 (systematic reviews and meta-analyses), EQUATOR Network standards, ICMJE COI guidelines, Newcastle-Ottawa Scale, and NLM Health Literacy Guidelines.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'What is a plain language summary in MedLit?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'MedLit generates a 6-part plain-language summary following NLM Health Literacy Guidelines: (1) one-liner elevator pitch, (2) what they did (methods), (3) what they found (results), (4) why it matters (significance), (5) who should care (audience), (6) bottom line (practical takeaway). This makes complex research accessible to patients, students, and non-specialists.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'Is MedLit suitable for medical students?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Yes. MedLit is designed for medical students, residents, and early-career researchers who need to learn critical appraisal. Each score includes a rationale explaining which aspect of the framework the paper passed or failed, making it an educational tool as well as a productivity tool.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'How do I analyze a PubMed paper with MedLit?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'Go to medlit.app, paste your PubMed URL (e.g. https://pubmed.ncbi.nlm.nih.gov/38514723/) into the input box, and click "Analyze Article". MedLit will fetch the full text from PMC and return a complete appraisal with scores in about 30–60 seconds.',
                      },
                    },
                    {
                      '@type': 'Question',
                      name: 'What does the methods quality score evaluate?',
                      acceptedAnswer: {
                        '@type': 'Answer',
                        text: 'The methods quality score (1–10) evaluates adherence to reporting standards (CONSORT, STROBE, PRISMA): sample size justification, blinding procedures, statistical assumptions checked, missing data handling, and confounding addressed. A score of 8–10 means the methods section meets the highest reporting standards for that study type.',
                      },
                    },
                  ],
                },
              ],
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
