import { ScrollViewStyleReset } from 'expo-router/html';
import { PUBLIC_SITE_URL } from '../src/constants/site';

const DESCRIPTION = 'Create a structured, evidence-linked appraisal of a scientific article from a PubMed, PMC, or DOI identifier. Source coverage and uncertainty are shown explicitly.';

export default function Root({ children }: { children: React.ReactNode }) {
  const applicationSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'MedLit Evidence Appraisal',
    url: PUBLIC_SITE_URL,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    description: DESCRIPTION,
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    featureList: [
      'Evidence-linked domain judgments',
      'Visible full-text or abstract-only source coverage',
      'Design-specific transparent appraisal questions',
      'Evidence-linked PICO and paper comparison tables',
      'Batch citation imports and saved PubMed searches',
      'Versioned reports, corrections, collections, tags, notes, backups, and portable sharing',
      'Bring-your-own AI provider key',
    ],
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${PUBLIC_SITE_URL}/og-image.svg`} />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="icon" href="/icon-192.png?v=20260918-redesign" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=20260918-redesign" sizes="180x180" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#5145CD" />
        <link rel="stylesheet" href="/fonts/plex.css" />
        <link rel="stylesheet" href="/medlit-workspace.css" />
        <link rel="preload" href="/fonts/ibm-plex-mono-500.ttf" as="font" type="font/ttf" crossOrigin="anonymous" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: `
          * { box-sizing: border-box; }
          html, body, #root { min-height: 100%; }
          body { margin: 0; background: #F8F9FC; }
          body, input, textarea, button { font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
          [data-layout="public-nav"] { display: flex; }
          @media (min-width: 900px) { [data-layout="review-desk"] { flex-direction: row !important; } }
          @media (max-width: 1000px) {
            [data-layout="menu-toggle"] { display: flex !important; }
            [data-layout="public-nav"] { display: none !important; width: 100%; flex-direction: column !important; align-items: stretch !important; padding: 12px 0; }
            [data-layout="public-nav"][data-open="true"] { display: flex !important; }
          }
          @media (min-width: 900px) {
            [data-layout="studio"] { flex-direction: row !important; min-height: 100vh; }
            [data-layout="rail"] { width: 216px; flex-shrink: 0; border-right: 1px solid #E5E7EB; padding-top: 28px !important; }
            [data-layout="studio-nav"] { flex-direction: column !important; }
            [data-layout="rail-detail"] { display: flex !important; }
            [data-layout="mobile-tag"] { display: none !important; }
            [data-layout="studio-main"] { padding: 28px 36px !important; }
            [data-layout="review-desk"] { flex-direction: row !important; align-items: flex-start !important; }
          }
          @media (max-width: 540px) {
            [data-layout="reading-headline"] { font-size: 37px !important; line-height: 42px !important; letter-spacing: -1.4px !important; }
            [data-layout="reading-hero"] { padding-top: 20px !important; padding-bottom: 24px !important; gap: 12px !important; }
            [data-layout="studio-nav"] { flex-wrap: nowrap !important; overflow-x: auto; }
            [data-layout="studio-nav"] > * { flex-shrink: 0; }
          }
          @keyframes paper-in { from { opacity: 0; transform: translateY(14px) rotate(1deg); } to { opacity: 1; transform: translateY(0) rotate(0); } }
          @keyframes finding-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
          [data-motion="paper"] { animation: finding-in 260ms cubic-bezier(.23,1,.32,1) both; }
          [data-motion="finding"], [data-motion="sheet"] { animation: finding-in 240ms cubic-bezier(.23,1,.32,1) both; }
          [data-motion="press"] { transition: transform 120ms ease-out, opacity 120ms ease-out; }
          [data-motion="press"]:active { transform: scale(.985); }
          @media (hover: hover) { [data-motion="press"]:hover { filter: brightness(.97); } }
          [data-motion="evidence"] { transition: background-color 180ms ease-out, border-color 180ms ease-out; }
          [role="button"]:focus-visible, [role="link"]:focus-visible, [role="tab"]:focus-visible, a:focus-visible, input:focus-visible, textarea:focus-visible {
            outline: 3px solid #1D70B7 !important;
            outline-offset: 3px !important;
          }
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
            [data-motion="press"]:active { transform: none; }
          }
        ` }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationSchema) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
