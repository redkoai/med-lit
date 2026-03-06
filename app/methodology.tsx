import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { Colors } from '../src/constants/colors';

export default function MethodologyScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>How MedLit Works</Text>
      <Text style={styles.subtitle}>
        Evidence-based critical appraisal using established medical research frameworks
      </Text>

      <Section title="📊 Scoring Overview">
        <Text style={styles.text}>
          MedLit analyzes scientific articles across <Bold>8 dimensions</Bold> using AI powered by Claude:
        </Text>
        <ScoreTable />
      </Section>

      <Section title="🎯 Study Design Classification">
        <Text style={styles.text}>
          Articles are classified using the <Bold>Oxford CEBM Levels of Evidence</Bold>:
        </Text>
        <BulletPoint text="Level 1: Systematic reviews, RCTs (highest quality)" />
        <BulletPoint text="Level 2: Cohort studies" />
        <BulletPoint text="Level 3: Case-control studies" />
        <BulletPoint text="Level 4: Case series" />
        <BulletPoint text="Level 5: Expert opinion (lowest quality)" />
      </Section>

      <Section title="✓ Accuracy Score (1-10)">
        <Text style={styles.text}>
          Evaluates internal scientific rigor:
        </Text>
        <BulletPoint text="Pre-registration (ClinicalTrials.gov, PROSPERO)" />
        <BulletPoint text="Adequate sample size with power calculations" />
        <BulletPoint text="Appropriate statistical methods" />
        <BulletPoint text="Effect sizes + confidence intervals (not just p-values)" />
        <BulletPoint text="Data/code availability for reproducibility" />
        <BulletPoint text="Conservative interpretation avoiding causal claims" />

        <GradeScale />
      </Section>

      <Section title="⚖️ Bias Risk Score (1-10)">
        <Text style={styles.text}>
          Uses <Bold>Cochrane RoB 2</Bold>, <Bold>ROBINS-I</Bold>, and <Bold>Newcastle-Ottawa Scale</Bold> to detect:
        </Text>
        <BulletPoint text="Selection bias (non-representative samples)" />
        <BulletPoint text="Attrition bias (>20% dropout without ITT analysis)" />
        <BulletPoint text="Detection bias (unblinded outcome assessment)" />
        <BulletPoint text="Reporting bias (selective outcome reporting)" />
        <BulletPoint text="Publication bias (funnel plot asymmetry)" />
        <BulletPoint text="P-hacking (multiple testing without correction)" />
        <BulletPoint text="HARKing (hypothesizing after results known)" />
        <BulletPoint text="Confounding (unmeasured variables)" />
      </Section>

      <Section title="🔬 Methods Quality Score (1-10)">
        <Text style={styles.text}>
          Evaluates adherence to reporting standards (<Bold>CONSORT</Bold>, <Bold>STROBE</Bold>, <Bold>PRISMA</Bold>):
        </Text>
        <BulletPoint text="Sample size justification" />
        <BulletPoint text="Blinding procedures" />
        <BulletPoint text="Statistical assumptions checked" />
        <BulletPoint text="Missing data handled properly" />
        <BulletPoint text="Confounding addressed" />
      </Section>

      <Section title="📚 Reference Verification">
        <Text style={styles.text}>
          Checks citation quality:
        </Text>
        <BulletPoint text="Citation indexing consistency" />
        <BulletPoint text="Claim-reference plausibility" />
        <BulletPoint text="Self-citation rate (<30% is healthy)" />
        <BulletPoint text="Citation of null/negative results" />
      </Section>

      <Section title="💰 Conflict of Interest">
        <Text style={styles.text}>
          Uses <Bold>ICMJE standards</Bold> to flag:
        </Text>
        <BulletPoint text="Industry funding with favorable results" />
        <BulletPoint text="Missing COI disclosures" />
        <BulletPoint text="Author financial relationships" />
      </Section>

      <Section title="📝 Plain Language Summary">
        <Text style={styles.text}>
          6-part summary following <Bold>NLM Health Literacy Guidelines</Bold>:
        </Text>
        <BulletPoint text="One-liner (elevator pitch)" />
        <BulletPoint text="What they did (methods)" />
        <BulletPoint text="What they found (results)" />
        <BulletPoint text="Why it matters (significance)" />
        <BulletPoint text="Who should care (audience)" />
        <BulletPoint text="Bottom line (practical takeaway)" />
      </Section>

      <Section title="🎓 Calibration">
        <Text style={styles.text}>
          Scores are calibrated to real-world benchmarks:
        </Text>
        <BulletPoint text="Nature Medicine RCT: ~7.5 accuracy, ~7 bias" />
        <BulletPoint text="Cochrane Systematic Review: ~8-9 accuracy, ~8 bias" />
        <BulletPoint text="Case series: ~5 accuracy, ~5 bias" />
        <BulletPoint text="Poor observational study: ~3-4 across dimensions" />
      </Section>

      <Section title="⚙️ AI Pipeline">
        <Text style={styles.text}>
          <Bold>Model:</Bold> Claude Sonnet 4 or Opus 4 (Anthropic)
          {'\n'}
          <Bold>Temperature:</Bold> 0.2 (low, for consistency)
          {'\n'}
          <Bold>Evidence requirement:</Bold> Every score must cite specific text
          {'\n'}
          <Bold>Safeguard:</Bold> Model explicitly instructed not to invent findings
        </Text>
      </Section>

      <Section title="⚠️ Limitations">
        <BulletPoint text="Text-based only - cannot re-analyze raw data" />
        <BulletPoint text="Abstract-only analysis is limited (flagged clearly)" />
        <BulletPoint text="Cannot verify every cited reference" />
        <BulletPoint text="Not a substitute for expert peer review" />
        <BulletPoint text="Optimized for English-language publications" />
      </Section>

      <Section title="📖 Standards Used">
        <Text style={styles.smallText}>
          • Oxford CEBM Levels of Evidence{'\n'}
          • Cochrane Risk of Bias 2 (RoB 2){'\n'}
          • ROBINS-I (non-randomized studies){'\n'}
          • CONSORT 2010 (RCT reporting){'\n'}
          • STROBE (observational studies){'\n'}
          • PRISMA 2020 (systematic reviews){'\n'}
          • EQUATOR Network standards{'\n'}
          • ICMJE COI guidelines{'\n'}
          • Newcastle-Ottawa Scale{'\n'}
          • NLM Health Literacy Guidelines
        </Text>
      </Section>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          MedLit v1.0 • Evidence-based critical appraisal
        </Text>
      </View>
    </ScrollView>
  );
}

// ──── Components ──────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Bold({ children }: { children: string }) {
  return <Text style={styles.bold}>{children}</Text>;
}

function BulletPoint({ text }: { text: string }) {
  return (
    <View style={styles.bulletContainer}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

function ScoreTable() {
  const scores = [
    { dimension: 'Accuracy', scale: '1-10', framework: 'Internal validity + methodology' },
    { dimension: 'Bias Risk', scale: '1-10', framework: 'Cochrane RoB 2, ROBINS-I' },
    { dimension: 'Methods', scale: '1-10', framework: 'CONSORT, STROBE, PRISMA' },
    { dimension: 'References', scale: 'PASS/WARN/FAIL', framework: 'Citation-claim mapping' },
    { dimension: 'Study Design', scale: 'Level 1-5', framework: 'Oxford CEBM' },
    { dimension: 'COI', scale: 'Status', framework: 'ICMJE standards' },
  ];

  return (
    <View style={styles.table}>
      {scores.map((score, i) => (
        <View key={i} style={styles.tableRow}>
          <Text style={styles.tableCell1}>{score.dimension}</Text>
          <Text style={styles.tableCell2}>{score.scale}</Text>
          <Text style={styles.tableCell3}>{score.framework}</Text>
        </View>
      ))}
    </View>
  );
}

function GradeScale() {
  const grades = [
    { score: '9-10', grade: 'A+', desc: 'Exceptional rigor' },
    { score: '8', grade: 'A', desc: 'Minor gaps' },
    { score: '7', grade: 'B+', desc: 'Some concerns' },
    { score: '6', grade: 'B', desc: 'Notable weaknesses' },
    { score: '5', grade: 'C', desc: 'Significant issues' },
    { score: '3-4', grade: 'D', desc: 'Major flaws' },
    { score: '1-2', grade: 'F', desc: 'Fundamental errors' },
  ];

  return (
    <View style={styles.gradeTable}>
      {grades.map((g, i) => (
        <View key={i} style={styles.gradeRow}>
          <Text style={styles.gradeScore}>{g.score}</Text>
          <Text style={styles.gradeGrade}>{g.grade}</Text>
          <Text style={styles.gradeDesc}>{g.desc}</Text>
        </View>
      ))}
    </View>
  );
}

// ──── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  text: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
    marginBottom: 8,
  },
  smallText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
    color: Colors.primary,
  },
  bulletContainer: {
    flexDirection: 'row',
    marginBottom: 6,
    paddingLeft: 8,
  },
  bullet: {
    fontSize: 15,
    color: Colors.primary,
    marginRight: 8,
    fontWeight: '700',
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  table: {
    marginTop: 12,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    padding: 12,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tableCell1: {
    flex: 1.2,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  tableCell2: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  tableCell3: {
    flex: 2,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  gradeTable: {
    marginTop: 12,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
    padding: 12,
  },
  gradeRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    alignItems: 'center',
  },
  gradeScore: {
    width: 50,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  gradeGrade: {
    width: 40,
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  gradeDesc: {
    flex: 1,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
