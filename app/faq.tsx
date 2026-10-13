import React, { useState } from 'react';
import { ScrollView, StyleSheet, TextInput, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../src/constants/colors';
import { GuidePage } from '../src/components/GuidePage';
import { PageMeta } from '../src/components/PageMeta';

const FAQS = [
  ['What is MedLit?', 'MedLit is an AI-assisted reading aid that creates a structured, evidence-linked appraisal from article text. It reports source coverage and uncertainty. It does not decide whether a paper is true, replace peer review, or give medical advice.'],
  ['What do I need to use it?', 'Connect your own OpenAI, Claude or Gemini API key in AI & settings. OpenRouter is optional. Select a text model and test the connection. Then paste a PubMed, PMC, DOI, or supported preprint identifier. A MedLit account is optional and separate from your AI account. Your provider may charge for usage.'],
  ['Where is my AI-provider key stored?', 'On the web, the key stays only in page memory and is cleared when you refresh, close the page, or disconnect. Moving between screens keeps it available. On iOS and Android it uses encrypted device storage. Keys are never written to browser storage, Firebase, the synced library, or MedLit servers.'],
  ['Can I use an existing chat subscription?', 'You can manually use a source packet in ChatGPT, Claude or Gemini and import the JSON response. Automatic subscription login is not activated in MedLit. OpenAI’s commercial sign-in program requires access approval; ordinary in-app appraisals use your provider API key and billing.'],
  ['What content is sent to the AI provider?', 'The retrieved title, abstract, available full-text extract, and a bounded reference extract are sent directly from your device to the provider you selected. Review that provider’s privacy and retention terms before use.'],
  ['Can it analyze paywalled papers?', 'MedLit uses lawful public metadata, PubMed Central, Europe PMC, and open-access locations. It does not bypass paywalls. If full text is unavailable, it may produce a clearly labeled abstract-only appraisal; metadata alone is never enough.'],
  ['How are PDFs, tables, and supplements handled?', 'A bounded server-side route can extract text from machine-readable PDFs with page markers, preserve text from HTML tables, identify PDF table-row candidates, and include up to three allowlisted supplement files. Reading order may be wrong, and scans/OCR, figures, equations, complex tables, inaccessible files, and oversized supplements still require direct source review.'],
  ['What does appraisal confidence mean?', 'It measures how much source text was available, how many generated quotations matched that text, and how many rubric questions were assessable. It is not an accuracy score and is not evidence that the article’s conclusions are correct.'],
  ['Which methods does it use?', 'The design selects a transparent question set aligned with concepts from RoB 2, ROBIS, ROBINS-I, QUADAS-2, JBI, or CASP. MedLit does not claim to implement or replace the official instruments. The exact rubric and version appear in every report.'],
  ['Are quotations verified?', 'MedLit normalizes each generated quotation and checks that it occurs in the supplied article text. If a question has no matched passage, a determinate judgment is replaced with “unclear.” This reduces one failure mode but does not guarantee a correct interpretation.'],
  ['How are references checked?', 'For a bounded set of structured DOI references, MedLit attempts Crossref resolution and checks indexed update relationships for retraction or withdrawal notices. It shows the checked scope. This is not a complete retraction or citation-integrity search.'],
  ['Can I reopen an analysis without paying again?', 'Yes. When Save History is enabled, the full versioned report is stored locally, or synced to your account when Firebase is configured and you sign in. Opening it from the library does not rerun the provider.'],
  ['Can I compare, import, or monitor papers?', 'Yes. You can compare two or three saved appraisals, queue up to ten DOI/PMID/RIS/BibTeX/Zotero records per batch, save PubMed searches, and manually check index signals for new, corrected, or retracted evidence. Guest alerts run only when you request them; they are not background notifications or a complete literature-surveillance service.'],
  ['What is in a read-only link?', 'A portable link contains a bounded appraisal snapshot directly in the URL. Anyone with the link can read it. Private library notes and reviewer correction history are excluded; do not share the link if the paper or extracted appraisal should remain private.'],
  ['Can I delete my data?', 'Yes. You can delete individual reports, clear the local library, reset provider keys, or delete a signed-in account. Account deletion removes the known user profile, settings, and saved-analysis documents before deleting the authentication account.'],
  ['Is MedLit clinically validated?', 'No clinical-validation or expert-agreement result is currently claimed. The repository includes a blinded expert-review template so real validation can be collected and reported later without inventing benchmark data.'],
] as const;

export default function FaqScreen() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<number | null>(0);
  return (
    <>
      <PageMeta title="FAQ — MedLit" description="Answers about MedLit’s scope, provider keys, article sources, cost, storage, and scientific limitations." path="/faq" />
      <GuidePage title="Good questions deserve clear answers." description="Scope, cost, privacy, and the limits of AI-assisted appraisal." path="/faq" active="faq">
      <TextInput accessibilityLabel="Search frequently asked questions" placeholder="Search questions, e.g. cost or history" value={search} onChangeText={setSearch} style={{ borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, borderRadius: 12, padding: 16, fontSize: 16, color: Colors.primary }} />
      {!FAQS.some(pair => pair.join(" ").toLowerCase().includes(search.toLowerCase())) && <Text accessibilityLiveRegion="polite" style={styles.answer}>No matching questions. Try “key,” “score,” or “history.”</Text>}

      {FAQS.map(([question, answer], index) => {
        if (!`${question} ${answer}`.toLowerCase().includes(search.toLowerCase())) return null;
        const expanded = Boolean(search.trim()) || open === index;
        return (
          <View key={question} style={styles.card}>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              aria-expanded={expanded}
              accessibilityLabel={`${question}. ${expanded ? 'Collapse answer' : 'Expand answer'}`}
              style={styles.question}
              onPress={() => setOpen(expanded ? null : index)}
            >
              <Text style={styles.questionText}>{question}</Text>
              <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={21} color={Colors.primary} />
            </TouchableOpacity>
            {expanded ? <Text style={styles.answer}>{answer}</Text> : null}
          </View>
        );
      })}
      </GuidePage>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 20, paddingBottom: 48, width: '100%', maxWidth: 820, alignSelf: 'center' },
  title: { fontSize: 30, fontWeight: '800', color: Colors.primary, marginBottom: 8 },
  subtitle: { fontSize: 17, lineHeight: 25, color: Colors.textSecondary, marginBottom: 24 },
  card: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 13, marginBottom: 10, overflow: 'hidden' },
  question: { minHeight: 54, paddingHorizontal: 17, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  questionText: { flex: 1, fontSize: 16, lineHeight: 23, color: Colors.textPrimary, fontWeight: '700' },
  answer: { paddingHorizontal: 17, paddingBottom: 17, color: Colors.textSecondary, fontSize: 15, lineHeight: 23 },
});
