import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/constants/colors';

const FAQ_SECTIONS = [
  {
    section: 'Getting Started',
    items: [
      {
        q: 'What is MedLit?',
        a: 'MedLit is a free AI-powered scientific literature analyzer. Paste any PubMed URL, DOI link, or journal article URL and receive a structured critical appraisal report: accuracy score (1–10), bias risk rating, methods quality score, reference check, study design classification, conflict-of-interest status, limitations, and a plain-language summary. Built for researchers, clinicians, and medical students.',
      },
      {
        q: 'Is MedLit free to use?',
        a: 'Yes—completely free. You supply your own Anthropic Claude API key (sign up at console.anthropic.com). There is no subscription, no paywall, and no account required to run an analysis. Add your API key once in Settings and MedLit works indefinitely.',
      },
      {
        q: 'Do I need to create an account?',
        a: 'No. You can analyze papers immediately after adding your Claude API key. Creating an account (via Sign In) is optional—it saves your analysis history to the cloud so you can access it across devices.',
      },
      {
        q: 'How do I analyze a paper?',
        a: 'Copy the URL of any PubMed, DOI, Nature, NEJM, Lancet, BMJ, or bioRxiv article. Paste it into the input on the MedLit home screen. Tap "Analyze Article." Your full appraisal report appears in about 30–60 seconds.',
      },
      {
        q: 'Where do I get a Claude API key?',
        a: 'Go to console.anthropic.com, create a free account, and generate an API key. Paste it in MedLit Settings. Anthropic offers a free usage tier; you only pay if your usage exceeds it. MedLit uses approximately 3,000–8,000 tokens per analysis depending on article length.',
      },
    ],
  },
  {
    section: 'Supported Sources & Journals',
    items: [
      {
        q: 'Which journals does MedLit support?',
        a: 'MedLit works with PubMed, PubMed Central (PMC), DOI links (doi.org), Nature, New England Journal of Medicine (NEJM), The Lancet, BMJ, JAMA, Cell, Science, bioRxiv, medRxiv, Europe PMC, and virtually any journal accessible via URL or DOI. It fetches full text through PMC, Europe PMC, and Unpaywall before falling back to the abstract.',
      },
      {
        q: 'Can MedLit analyze papers behind a paywall?',
        a: 'MedLit tries multiple free-access pathways: PMC Full Text → Europe PMC → Unpaywall → PubMed abstract → CORS scrape. For most indexed papers, at least the abstract is available. If you enable Sci-Hub in Settings, MedLit can also attempt to retrieve paywalled full text through Sci-Hub.',
      },
      {
        q: 'Can I paste a DOI directly?',
        a: 'Yes. Paste a DOI in any format: doi:10.1038/s41586-023-06374-2, https://doi.org/10.1038/s41586-023-06374-2, or just 10.1038/s41586-023-06374-2. MedLit resolves it automatically.',
      },
      {
        q: 'Does MedLit work with preprints?',
        a: 'Yes. bioRxiv and medRxiv preprints are fully supported. MedLit will note in its analysis when a paper is a preprint and has not undergone peer review—this is factored into the accuracy and bias scores.',
      },
    ],
  },
  {
    section: 'Scoring & Methodology',
    items: [
      {
        q: 'How does MedLit score research papers?',
        a: 'MedLit uses established evidence-based medicine frameworks: Oxford CEBM Levels of Evidence for study design, Cochrane RoB 2 and ROBINS-I for bias risk, CONSORT for RCTs, STROBE for observational studies, PRISMA for systematic reviews, EQUATOR standards for methods, and ICMJE for conflict of interest. Every score (1–10) is accompanied by a rationale that cites specific text from the paper.',
      },
      {
        q: 'What does the accuracy score measure?',
        a: 'The accuracy score (1–10) evaluates internal scientific rigor: pre-registration on ClinicalTrials.gov or PROSPERO, adequate sample size with power calculations, appropriate statistical methods, effect sizes with confidence intervals (not just p-values), data and code availability for reproducibility, and conservative interpretation that avoids unsupported causal claims. A score of 8–10 indicates exceptional rigor.',
      },
      {
        q: 'What is the bias risk score based on?',
        a: 'The bias risk score (1–10) uses Cochrane Risk of Bias 2 (RoB 2) for randomized trials, ROBINS-I for non-randomized studies, and the Newcastle-Ottawa Scale for observational studies. It checks for selection bias, attrition bias (>20% dropout), detection bias (unblinded outcomes), reporting bias (selective outcomes), p-hacking, HARKing, and confounding.',
      },
      {
        q: 'What is the Oxford CEBM hierarchy?',
        a: 'The Oxford Centre for Evidence-Based Medicine (CEBM) ranks study designs by quality: Level 1 (systematic reviews, RCTs—highest quality), Level 2 (cohort studies), Level 3 (case-control studies), Level 4 (case series), Level 5 (expert opinion—lowest quality). MedLit classifies every analyzed paper into the appropriate level.',
      },
      {
        q: 'What does a score of 7/10 mean?',
        a: 'A score of 7 (grade B+) means "some concerns"—the paper has solid methodology but identifiable gaps, such as a missing power calculation, incomplete blinding description, or borderline sample size. A score of 8+ (A or A+) indicates a well-conducted study meeting most or all reporting standards for its study type.',
      },
      {
        q: 'How accurate is MedLit\'s analysis?',
        a: 'MedLit uses Claude at temperature 0.2 for scoring consistency. Scores are calibrated to real-world benchmarks: Nature Medicine RCTs typically score ~7.5 accuracy and ~7 bias; Cochrane Systematic Reviews ~8–9 accuracy and ~8 bias; poor observational studies ~3–4 across all dimensions. Every score requires citation of specific paper text—the model cannot invent findings.',
      },
      {
        q: 'What reporting standards does MedLit evaluate?',
        a: 'Oxford CEBM Levels of Evidence, Cochrane Risk of Bias 2 (RoB 2), ROBINS-I (non-randomized studies), Newcastle-Ottawa Scale (observational studies), CONSORT 2010 (randomized controlled trials), STROBE (observational studies), PRISMA 2020 (systematic reviews and meta-analyses), EQUATOR Network standards, ICMJE conflict-of-interest guidelines, and NLM Health Literacy Guidelines.',
      },
      {
        q: 'How does MedLit check for conflict of interest?',
        a: 'MedLit applies ICMJE standards to flag: industry funding with favorable results, missing COI disclosures, and author financial relationships. Results are returned as FLAG (concern identified), CLEAR (no COI found), or DECLARED (COI disclosed transparently).',
      },
    ],
  },
  {
    section: 'AI & Technology',
    items: [
      {
        q: 'What AI model does MedLit use?',
        a: 'Anthropic Claude — either Claude Sonnet or Claude Opus, selectable in Settings. The analysis pipeline runs two stages at temperature 0.2: Stage 1 extracts structured metadata from the article; Stage 2 performs full appraisal scoring. Using your own API key means your data stays between you and Anthropic.',
      },
      {
        q: 'How does MedLit fetch article text?',
        a: 'MedLit tries in order: (1) PubMed Central Full Text XML, (2) Europe PMC Full Text, (3) Unpaywall open-access repository, (4) PubMed abstract, (5) CORS scrape of the journal page, (6) Sci-Hub (optional). It uses the richest available text for the most accurate analysis.',
      },
      {
        q: 'Is my data private?',
        a: 'Yes. Your Claude API key is stored only on your device (or in your Firebase account if you sign in). Article URLs and analysis results are sent to Anthropic via your API key for processing. MedLit itself does not store your analyses on its servers unless you are signed in, in which case history is saved to your personal Firebase account.',
      },
      {
        q: 'Why temperature 0.2?',
        a: 'Low temperature (0.2 out of 1.0) reduces randomness and makes Claude\'s scoring more deterministic and consistent. The same paper analyzed twice should produce nearly identical scores. This is important for a tool used to evaluate scientific rigor—the evaluation itself should be rigorous and reproducible.',
      },
    ],
  },
  {
    section: 'Using the App',
    items: [
      {
        q: 'Does MedLit work on mobile?',
        a: 'Yes. MedLit works in any mobile browser as a progressive web app, and is also available as a native iOS app (App Store) and Android app (Google Play).',
      },
      {
        q: 'Can I export my analysis?',
        a: 'Yes. From the analysis result screen, tap the export button to save as plain text, formatted Markdown, or BibTeX (for citation managers like Zotero, Mendeley, or EndNote).',
      },
      {
        q: 'Is there an analysis history?',
        a: 'Yes. Your recent analyses appear on the home screen. Sign in with an account to sync your full history across devices.',
      },
      {
        q: 'Is there an iOS or Android app?',
        a: 'Yes. MedLit is available on the Apple App Store and Google Play Store. Search for "MedLit" or find it at medlit.app. The app is free and uses the same Claude API key as the web version.',
      },
    ],
  },
  {
    section: 'Evidence-Based Medicine Concepts',
    items: [
      {
        q: 'What is critical appraisal?',
        a: 'Critical appraisal is the systematic process of evaluating the quality, validity, and relevance of a scientific study. It asks: Was the study well-designed? Were the results reliable? Are the conclusions justified? MedLit automates this using AI and established checklists (PRISMA, CONSORT, STROBE, Cochrane RoB 2, CEBM).',
      },
      {
        q: 'What is evidence-based medicine (EBM)?',
        a: 'Evidence-based medicine is the conscientious use of the best available evidence in making clinical decisions. It integrates individual clinical expertise with the best available external clinical evidence from systematic research. EBM relies on hierarchies of evidence (like Oxford CEBM) and tools like critical appraisal checklists.',
      },
      {
        q: 'What is P-hacking and why does it matter?',
        a: 'P-hacking (also called data dredging) occurs when researchers run many statistical tests and selectively report only those with p < 0.05, inflating false-positive rates. MedLit checks for signs of p-hacking: multiple comparisons without correction, outcomes changed after data collection, and subgroup analyses that appear post-hoc.',
      },
      {
        q: 'What is HARKing?',
        a: 'HARKing (Hypothesizing After Results are Known) is when researchers present post-hoc hypotheses as if they were pre-specified. It is a form of selective reporting that inflates apparent confirmatory evidence. MedLit flags HARKing indicators in the bias risk assessment.',
      },
      {
        q: 'What is CONSORT?',
        a: 'CONSORT (Consolidated Standards of Reporting Trials) is a 25-item checklist and flow diagram for reporting randomized controlled trials (RCTs). MedLit evaluates RCTs against CONSORT 2010 criteria in the methods quality score.',
      },
      {
        q: 'What is PRISMA?',
        a: 'PRISMA (Preferred Reporting Items for Systematic Reviews and Meta-Analyses) is a 27-item checklist for reporting systematic reviews. MedLit evaluates systematic reviews against PRISMA 2020 criteria.',
      },
      {
        q: 'What is STROBE?',
        a: 'STROBE (Strengthening the Reporting of Observational Studies in Epidemiology) is a checklist for reporting observational studies (cohort, case-control, cross-sectional). MedLit evaluates observational papers against STROBE criteria.',
      },
    ],
  },
];

export default function FaqScreen() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (key: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.accent} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Frequently Asked Questions</Text>
        <Text style={styles.subtitle}>
          Everything you need to know about MedLit — scientific literature critical appraisal, AI analysis, and evidence-based medicine.
        </Text>
      </View>

      {FAQ_SECTIONS.map((section) => (
        <View key={section.section} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.section}</Text>
          {section.items.map((item, i) => {
            const key = `${section.section}-${i}`;
            const isOpen = openItems.has(key);
            return (
              <TouchableOpacity
                key={key}
                style={[styles.faqItem, isOpen && styles.faqItemOpen]}
                onPress={() => toggleItem(key)}
                activeOpacity={0.8}
              >
                <View style={styles.faqQuestion}>
                  <Text style={[styles.faqQ, isOpen && styles.faqQOpen]}>{item.q}</Text>
                  <Ionicons
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={isOpen ? Colors.accent : Colors.textSecondary}
                  />
                </View>
                {isOpen ? (
                  <Text style={styles.faqA}>{item.a}</Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      ))}

      <View style={styles.cta}>
        <Text style={styles.ctaTitle}>Ready to analyze a paper?</Text>
        <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/')}>
          <Ionicons name="sparkles" size={18} color="#fff" />
          <Text style={styles.ctaBtnText}>Start analyzing — it's free</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.methodologyLink} onPress={() => router.push('/methodology')}>
          <Text style={styles.methodologyLinkText}>See our full methodology →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 32,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 16,
  },
  backText: {
    fontSize: 15,
    color: Colors.accent,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: Colors.accent,
  },
  faqItem: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  faqItemOpen: {
    borderColor: Colors.accent,
    backgroundColor: Colors.surfaceElevated,
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  faqQ: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 21,
  },
  faqQOpen: {
    color: Colors.accent,
  },
  faqA: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  cta: {
    marginTop: 16,
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 16,
    padding: 24,
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.accent,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    marginBottom: 12,
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  methodologyLink: {
    paddingVertical: 4,
  },
  methodologyLinkText: {
    fontSize: 14,
    color: Colors.accent,
  },
});
