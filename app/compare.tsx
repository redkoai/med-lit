import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../src/constants/colors';
import { PageMeta } from '../src/components/PageMeta';
import { useAuth } from '../src/hooks/useAuth';
import { useHistory } from '../src/hooks/useHistory';
import type { ArticleAnalysis } from '../src/types';

interface ComparisonRow {
  label: string;
  value: (analysis: ArticleAnalysis) => string;
}

const ROWS: ComparisonRow[] = [
  { label: 'Study design', value: (item) => item.studyDesign.type },
  { label: 'Population', value: (item) => item.pico?.population.value ?? 'Not extracted in this analysis version.' },
  { label: 'Intervention / exposure', value: (item) => item.pico?.intervention.value ?? 'Not extracted in this analysis version.' },
  { label: 'Comparator', value: (item) => item.pico?.comparator.value ?? 'Not extracted in this analysis version.' },
  { label: 'Outcomes', value: (item) => item.pico?.outcomes.value ?? 'Not extracted in this analysis version.' },
  { label: 'Timeframe', value: (item) => item.pico?.timeframe.value ?? 'Not extracted in this analysis version.' },
  { label: 'Source coverage', value: (item) => item.appraisal.sourceCoverage.level.replace(/_/g, ' ') },
  { label: 'Appraisal confidence', value: (item) => `${item.verdict.confidence} (${item.evidenceScore.score}/10 traceability)` },
  { label: 'Risk-of-bias concerns', value: (item) => item.riskOfBias.overallRisk.replace(/_/g, ' ') },
  { label: 'Verified passages', value: (item) => String(item.appraisal.evidence.filter((evidence) => evidence.verified).length) },
  { label: 'Key takeaway', value: (item) => item.verdict.keyTakeaway },
  { label: 'Important limitations', value: (item) => item.limitations.slice(0, 4).join(' · ') || 'None extracted.' },
];

export default function CompareScreen() {
  const { user } = useAuth();
  const { analyses, loaded } = useHistory(user?.uid ?? null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selected = useMemo(
    () => selectedIds.flatMap((id) => analyses.find((analysis) => analysis.id === id) ?? []),
    [analyses, selectedIds],
  );

  const toggle = (id: string) => {
    setSelectedIds((current) => current.includes(id)
      ? current.filter((value) => value !== id)
      : current.length < 3 ? [...current, id] : current);
  };

  return (
    <>
      <PageMeta title="Compare appraisals — MedLit" description="Compare saved evidence-linked appraisals side by side." path="/compare" noIndex />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.header}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Compare papers</Text>
          <View style={styles.headerButton} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.intro}>Choose two or three saved appraisals. Comparisons show extracted evidence and uncertainty; they do not rank which paper is true or clinically preferable.</Text>
          {!loaded ? <Text style={styles.empty}>Loading your library…</Text> : null}
          {loaded && !analyses.length ? (
            <View style={styles.emptyCard}>
              <Ionicons name="library-outline" size={34} color={Colors.textTertiary} />
              <Text style={styles.emptyTitle}>No saved appraisals</Text>
              <TouchableOpacity accessibilityRole="link" onPress={() => router.push('/')} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Appraise a paper</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          <View style={styles.selector}>
            {analyses.map((analysis) => {
              const isSelected = selectedIds.includes(analysis.id);
              const disabled = !isSelected && selectedIds.length >= 3;
              return (
                <TouchableOpacity
                  key={analysis.id}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected, disabled }}
                  accessibilityLabel={`Compare ${analysis.article.title}`}
                  disabled={disabled}
                  onPress={() => toggle(analysis.id)}
                  style={[styles.selectCard, isSelected && styles.selectCardActive, disabled && styles.selectCardDisabled]}
                >
                  <Ionicons name={isSelected ? 'checkbox' : 'square-outline'} size={21} color={isSelected ? Colors.accent : Colors.textTertiary} />
                  <View style={styles.selectText}>
                    <Text style={styles.selectTitle} numberOfLines={2}>{analysis.article.title}</Text>
                    <Text style={styles.selectMeta}>{analysis.article.year ?? 'Undated'} · {analysis.studyDesign.type}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {selected.length < 2 && analyses.length ? (
            <Text style={styles.empty}>Select at least two papers to build the evidence table.</Text>
          ) : null}
          {selected.length >= 2 ? (
            <View style={styles.tableCard}>
              <Text style={styles.tableTitle}>Evidence comparison</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator accessibilityLabel="Side-by-side evidence comparison">
                <View>
                  <View style={styles.tableRow}>
                    <View style={[styles.labelCell, styles.headerCell]}><Text style={styles.headerText}>Field</Text></View>
                    {selected.map((item) => (
                      <View key={item.id} style={[styles.valueCell, styles.headerCell]}>
                        <Text style={styles.paperTitle}>{item.article.title}</Text>
                        <Text style={styles.paperMeta}>{item.article.journal} · {item.article.year ?? 'Undated'}</Text>
                      </View>
                    ))}
                  </View>
                  {ROWS.map((row, index) => (
                    <View key={row.label} style={[styles.tableRow, index % 2 === 1 && styles.alternateRow]}>
                      <View style={styles.labelCell}><Text style={styles.rowLabel}>{row.label}</Text></View>
                      {selected.map((item) => (
                        <View key={item.id} style={styles.valueCell}><Text style={styles.valueText}>{row.value(item)}</Text></View>
                      ))}
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, padding: 12 },
  headerButton: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', color: '#fff', fontSize: 17, fontWeight: '700' },
  content: { width: '100%', maxWidth: 1100, alignSelf: 'center', padding: 18, gap: 14 },
  intro: { color: Colors.textSecondary, fontSize: 14, lineHeight: 21 },
  selector: { gap: 9 },
  selectCard: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: 13, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface },
  selectCardActive: { borderColor: Colors.accent, backgroundColor: Colors.accentLight },
  selectCardDisabled: { opacity: 0.45 },
  selectText: { flex: 1, gap: 3 },
  selectTitle: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  selectMeta: { color: Colors.textSecondary, fontSize: 11 },
  empty: { color: Colors.textSecondary, textAlign: 'center', padding: 18 },
  emptyCard: { alignItems: 'center', gap: 12, padding: 30, borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  emptyTitle: { color: Colors.textPrimary, fontSize: 17, fontWeight: '700' },
  primaryButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 18, borderRadius: 12, backgroundColor: Colors.accent },
  primaryButtonText: { color: '#fff', fontWeight: '700' },
  tableCard: { borderRadius: 16, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, padding: 14, gap: 12 },
  tableTitle: { color: Colors.textPrimary, fontSize: 18, fontWeight: '800' },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  alternateRow: { backgroundColor: Colors.surfaceElevated },
  labelCell: { width: 170, padding: 12 },
  valueCell: { width: 280, padding: 12, borderLeftWidth: 1, borderLeftColor: Colors.borderLight },
  headerCell: { backgroundColor: Colors.primaryMuted, minHeight: 94 },
  headerText: { color: Colors.primary, fontWeight: '800' },
  paperTitle: { color: Colors.textPrimary, fontSize: 12, lineHeight: 17, fontWeight: '800' },
  paperMeta: { color: Colors.textSecondary, fontSize: 10, marginTop: 5 },
  rowLabel: { color: Colors.textPrimary, fontSize: 12, fontWeight: '700' },
  valueText: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },
});
