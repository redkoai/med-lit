import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors } from '../src/constants/colors';
import { GuidePage } from '../src/components/GuidePage';
import { AppraisalScore } from '../src/components/AppraisalScore';
import { createExampleAppraisal } from '../src/services/exampleAppraisal';
import { PageMeta } from '../src/components/PageMeta';

const sections = [
  {
    title: '1. Retrieval and source coverage',
    body: 'MedLit accepts a PubMed, PubMed Central, DOI, or supported preprint identifier. It attempts authoritative metadata and lawful open-access sources, including bounded server-side extraction of machine-readable PDF page text, HTML tables, and a small number of allowlisted supplements. Every report distinguishes full text, abstract only, and metadata only. Metadata-only records are not analyzed.',
    bullets: ['PDF reading order and table-row candidates can be wrong; scans/OCR, figures, equations, and complex table meaning still require source review.', 'Abstract-only reports deliberately lower confidence and leave unsupported domains unable to assess.', 'Preprints are labeled; publication status is not treated as evidence of validity.'],
  },
  {
    title: '2. Untrusted source boundary',
    body: 'Article text is data, not an instruction. The analysis prompt tells the provider to ignore instructions embedded in an article, avoid outside facts, and use exact passages from the supplied source.',
    bullets: ['Generated quotations are normalized and matched against the retrieved title, abstract, or full text.', 'A domain cannot receive a determinate judgment when none of its linked passages can be matched.', 'Unmatched quotations are counted and disclosed in the report.'],
  },
  {
    title: '3. Design-specific question set',
    body: 'The detected design selects a concise, published-framework-aligned question set. These are transparent MedLit questions informed by RoB 2, ROBIS, ROBINS-I, QUADAS-2, JBI, or CASP concepts; MedLit does not claim to reproduce or validate the official instruments.',
    bullets: ['Each report shows the exact rubric ID, version, domain, question, judgment, rationale, and supporting passage.', 'Possible judgments are low, some concerns, high, unclear, or not applicable.', 'Design classification includes a rationale and can be wrong; readers should verify it.'],
  },
  {
    title: '4. Deterministic safeguards',
    body: 'The language model proposes structured evidence, summaries, and domain rationales. Application code verifies quotations, fills missing rubric questions, derives source coverage, and computes the displayed confidence and concern summaries.',
    bullets: ['Appraisal confidence measures source completeness, evidence traceability, and domain assessability—not whether a paper is true. No matched evidence or no assessable domains means insufficient confidence.', 'Risk-of-bias concern and the overview are derived from visible domain judgments—not a hidden model verdict. No assessable domains is unclear, never low risk.', 'Narratives, methods, registration, and disclosure descriptions are model-generated and must be checked against the source. Clinical applicability is not assessed.'],
  },
  {
    title: '5. Reference and disclosure scope',
    body: 'When structured references contain DOI identifiers, MedLit attempts a bounded Crossref resolution and checks indexed update relationships for retraction or withdrawal notices. This is not a complete citation audit or a guarantee that an article is unretracted.',
    bullets: ['The number of references found, identifiers present, identifiers checked, and notices found are reported.', 'Conflict-of-interest and funding fields only summarize disclosures visible in the supplied text.', 'Missing disclosure text is reported as missing or unclear, never assumed clear.'],
  },
  {
    title: '6. Storage, revisions, and export',
    body: 'Saved reports preserve the full structured analysis, analysis contract version, timestamp, and revision. Users can reopen reports without spending provider tokens, compare papers, review individual judgments, organize collections, run local evidence alerts, create bounded read-only snapshots, and export or back up the library.',
    bullets: ['Guest libraries and saved searches stay on the device.', 'Signed-in libraries can sync through Firebase when configured.', 'AI-provider keys never sync with the library, and portable links omit private notes and feedback.'],
  },
  {
    title: 'Known limitations',
    body: 'MedLit is an AI-assisted reading aid. It cannot reanalyze raw data, reliably interpret every table or figure, detect all statistical errors, establish causal truth, perform a complete retraction search, or replace domain expertise and peer review.',
    bullets: ['English scientific prose is the primary supported language.', 'Paywalled full text is not bypassed.', 'Expert validation is an external release-evidence step; no expert agreement result is claimed until real blinded reviews are collected.'],
  },
];

export default function MethodologyScreen() {
  return (
    <>
      <PageMeta title="Methodology — MedLit" description="Read MedLit’s transparent evidence, uncertainty, rubric, and validation contract." path="/methodology" />
      <GuidePage title="Look inside the methodology." description="Transparent questions. Traceable passages. Explicit uncertainty." path="/methodology" active="methodology">
      <Text style={styles.body}>The score below uses a fictional teaching example, not real research. Its calculation is the same function used to validate reports.</Text>
      <AppraisalScore analysis={createExampleAppraisal()} expanded />
      <Text accessibilityRole="header" style={styles.sectionTitle}>The complete appraisal process</Text>
      {sections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.body}>{section.body}</Text>
          {section.bullets.map((bullet) => (
            <View key={bullet} style={styles.bulletRow}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{bullet}</Text>
            </View>
          ))}
        </View>
      ))}
      <Text style={styles.footer}>Analysis contract v4.1.0 · Last reviewed September 10, 2026</Text>
      </GuidePage>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 48, width: '100%', maxWidth: 820, alignSelf: 'center' },
  title: { fontSize: 30, fontWeight: '800', color: Colors.primary, marginBottom: 8 },
  subtitle: { fontSize: 17, lineHeight: 25, color: Colors.textSecondary, marginBottom: 28 },
  section: { backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, padding: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 10 },
  body: { fontSize: 15, lineHeight: 23, color: Colors.textPrimary, marginBottom: 10 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 7 },
  bullet: { color: Colors.primary, fontWeight: '800', marginRight: 9, lineHeight: 22 },
  bulletText: { flex: 1, fontSize: 15, lineHeight: 22, color: Colors.textSecondary },
  footer: { textAlign: 'center', color: Colors.textSecondary, fontSize: 13, marginTop: 18 },
});
