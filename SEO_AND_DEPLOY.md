# SEO & GEO Deployment Guide

MedLit is fully optimized for **traditional search engines** (Google, Bing, Yahoo, DuckDuckBot) and **AI/LLM engines** (ChatGPT, Perplexity, Gemini, Claude, Copilot).

---

## Step 1 — Replace the placeholder URL

Search the project for **`https://medlit.app`** and replace with your real deployed URL.

**Files to update (3 files, 3 minutes):**

| File | What to update |
|---|---|
| `app/+html.tsx` | `BASE_URL` constant at the top |
| `public/robots.txt` | `Sitemap:` line at the bottom |
| `public/sitemap.xml` | Every `<loc>` entry |
| `public/llms.txt` | All `https://medlit.app` links |
| `public/llms-full.txt` | All `https://medlit.app` links |
| `public/site.webmanifest` | `start_url`, `related_applications` URLs |

---

## Step 2 — Create the OG image

Create a **1200×630 px** branded image (logo + tagline on navy background) and save as **`public/og-image.png`**. This is referenced in meta tags, sitemap, and the web manifest. Without it, social and AI link previews will have no image.

Tools: Figma, Canva, or any image editor. Navy background (#0F2E4E), white MedLit logo, subtitle "Scientific Literature Analyzer".

---

## Step 3 — Deploy and submit to search engines

### Google (highest priority)
1. [Google Search Console](https://search.google.com/search-console) → Add property → verify ownership
2. Submit sitemap: `https://your-domain.com/sitemap.xml`
3. Request indexing of home, `/methodology`, `/faq` individually via URL Inspection

### Bing + Yahoo
- [Bing Webmaster Tools](https://www.bing.com/webmasters) → Add site → submit sitemap
- Yahoo uses Bing's index; submitting to Bing covers both

### DuckDuckGo
- DuckDuckGo uses Bing + its own crawler; covered by Bing submission

### Yandex (optional, international)
- [Yandex Webmaster](https://webmaster.yandex.com) → add site

---

## Step 4 — AI/LLM engine optimization (GEO)

These AI engines are already configured to crawl and cite MedLit:

| Engine | How it discovers MedLit | Status |
|---|---|---|
| **ChatGPT / OpenAI** | GPTBot + OAI-SearchBot in robots.txt; JSON-LD; llms.txt | ✅ Ready |
| **Perplexity** | PerplexityBot in robots.txt; llms.txt; llms-full.txt | ✅ Ready |
| **Google Gemini** | Google-Extended + Gemini in robots.txt; structured data | ✅ Ready |
| **Claude / Anthropic** | anthropic-ai + ClaudeBot in robots.txt; llms.txt | ✅ Ready |
| **Microsoft Copilot** | Bingbot (Copilot uses Bing); robots.txt | ✅ Ready |
| **You.com** | YouBot in robots.txt | ✅ Ready |
| **Brave Search** | Brave bot in robots.txt | ✅ Ready |
| **Apple Intelligence** | Applebot + Applebot-Extended in robots.txt | ✅ Ready |
| **Meta AI** | FacebookBot + meta-externalagent in robots.txt | ✅ Ready |

**After deployment — submit to AI directories:**
1. [Perplexity](https://perplexity.ai) — search "MedLit scientific paper analyzer" to check if it's indexed; if not, share a link to trigger crawling
2. [ChatGPT plugin/GPT store](https://chatgpt.com/gpts) — submit as a custom GPT action if desired
3. Mention MedLit on Reddit, Twitter, LinkedIn — AI engines crawl social content

---

## Step 5 — Submit to directories for backlinks

Backlinks and citations are the #1 signal for both traditional SEO and AI citation frequency.

### AI tool directories (free)
- [There's An AI For That](https://theresanaiforthat.com) — Category: Research, Medical
- [Futurepedia](https://www.futurepedia.io) — Category: Research
- [AI Valley](https://aivalley.org) — Category: Health, Education
- [ToolAI](https://toolai.io) — Category: Medical
- [Toolify.ai](https://www.toolify.ai)
- [AITopTools](https://aitoptools.com)
- [Product Hunt](https://www.producthunt.com) — Launch as "MedLit – AI scientific paper analyzer"
- [BetaList](https://betalist.com)

### Medical / academic directories
- "Evidence-based medicine resources" roundup blogs — reach out for a listing
- "Tools for medical students" lists
- "Research productivity tools" lists on academic blogs

### Social launch
- **Twitter/X thread:** "I built a free tool to score medical papers in seconds. Paste a PubMed link → accuracy score, bias detection, plain-English summary. 🧵 #MedEd #EvidenceBasedMedicine"
- **Reddit:** r/medicine, r/AskAcademia, r/PhD, r/medicalschool, r/ClinicalPsychology — genuine "I built this" post
- **LinkedIn:** Same angle for clinicians and researchers

---

## What's already in place

### Traditional SEO
| Signal | File | Purpose |
|---|---|---|
| Title + meta description | `app/+html.tsx` | Primary SERP snippet; keywords first |
| Meta keywords | `app/+html.tsx` | 30+ targeted keywords |
| Author, publisher, category meta | `app/+html.tsx` | Entity signals |
| Canonical URL | `app/+html.tsx` | Prevents duplicate content |
| Open Graph + Twitter Card | `app/+html.tsx` | Rich social previews |
| robots.txt | `public/robots.txt` | 25+ crawlers explicitly allowed |
| sitemap.xml | `public/sitemap.xml` | 6 URLs with lastmod + image tags |
| site.webmanifest | `public/site.webmanifest` | PWA + app store signals |
| Semantic SEO block on home | `app/index.tsx` | Keyword-rich crawler-visible text |

### Structured data (JSON-LD) — for Google rich results
| Schema | Purpose |
|---|---|
| `Organization` | Entity disambiguation; sameAs links |
| `WebSite` + `SearchAction` | Sitelinks searchbox in Google |
| `SoftwareApplication` + `WebApplication` | App rich results; "Free" badge |
| `HowTo` (3 steps) | How-to rich results in Google |
| `FAQPage` (20 Q&As) | FAQ rich results; AI citation source |

### GEO (Generative Engine Optimization)
| Signal | File | Purpose |
|---|---|---|
| `llms.txt` | `public/llms.txt` | LLM crawl index (like robots.txt for AI) |
| `llms-full.txt` | `public/llms-full.txt` | Comprehensive AI-readable content |
| AI bot allow list | `public/robots.txt` | GPTBot, PerplexityBot, ClaudeBot, Gemini, etc. |
| FAQ page | `app/faq.tsx` | 35+ Q&As — primary AI citation source |
| `<link>` to llms.txt | `app/+html.tsx` | Signals LLM index to crawlers |

### Content pages (long-tail keywords)
| Page | URL | Targets |
|---|---|---|
| Home | `/` | "medical literature analyzer", "PubMed analyzer" |
| Methodology | `/methodology` | "how critical appraisal works", "CEBM PRISMA CONSORT" |
| FAQ | `/faq` | 35+ specific Q&As covering all keyword variants |

---

## One-line pitch (use for submissions)

> **MedLit** — Paste any PubMed or DOI link. Get an accuracy score (1–10), bias detection (Cochrane RoB 2), methods review (CONSORT, PRISMA), COI flagging, and a plain-language summary. Free. No sign-up. Built for researchers, clinicians, and medical students.

---

## Build & deploy

```bash
# Build static web export
npx expo export --platform web
# Output is in dist/

# Deploy to Vercel (auto-configured via vercel.json)
vercel --prod

# Or deploy to Netlify
netlify deploy --prod --dir=dist
```

After deploy, update all `https://medlit.app` references with your real URL.
