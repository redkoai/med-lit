import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../src/constants/colors';
import { PageMeta } from '../src/components/PageMeta';
import { decodeSharedSnapshot, type SharedAnalysisSnapshot } from '../src/services/shareSnapshot';

export default function SharedAnalysisScreen() {
  const params = useLocalSearchParams<{ data?: string }>();
  const [hydrated, setHydrated] = useState(false);
  const [snapshot, setSnapshot] = useState<SharedAnalysisSnapshot | null>(null);
  useEffect(() => {
    const read = () => {
      const fragment = Platform.OS === 'web' && typeof window !== 'undefined'
        ? new URLSearchParams(window.location.hash.slice(1)).get('data') : null;
      setSnapshot(decodeSharedSnapshot(fragment || (typeof params.data === 'string' ? params.data : '')));
      setHydrated(true);
    };
    read();
    if (Platform.OS === 'web') { window.addEventListener('hashchange', read); return () => window.removeEventListener('hashchange', read); }
  }, [params.data]);
  if (!hydrated) {
    return (
      <SafeAreaView style={styles.safe}>
        <PageMeta title="Opening shared appraisal — MedLit" description="Opening a portable MedLit appraisal snapshot." path="/shared" noIndex />
        <View style={styles.empty}><Text style={styles.body}>Opening shared appraisal…</Text></View>
      </SafeAreaView>
    );
  }
  if (!snapshot) {
    return (
      <SafeAreaView style={styles.safe}>
        <PageMeta title="Shared appraisal unavailable — MedLit" description="This portable MedLit share link is invalid or incomplete." path="/shared" noIndex />
        <View style={styles.empty}>
          <Ionicons name="link-outline" size={40} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>Shared appraisal unavailable</Text>
          <Text style={styles.body}>The link may be incomplete. Ask the sender to create a new read-only link.</Text>
          <TouchableOpacity accessibilityRole="link" onPress={() => router.replace('/')} style={styles.button}><Text style={styles.buttonText}>Open MedLit</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <>
      <PageMeta title={`${snapshot.title} — shared MedLit appraisal`} description="A read-only, evidence-linked appraisal snapshot shared by a MedLit user." path="/shared" noIndex />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.header}><Text style={styles.headerTitle}>Read-only appraisal</Text><Text style={styles.headerBadge}>Portable snapshot</Text></View>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.notice}>
            <Ionicons name="information-circle-outline" size={19} color={Colors.accent} />
            <Text style={styles.noticeText}>This snapshot was created by a user and is not hosted as a validated clinical record. Verify every important claim against the original paper.</Text>
          </View>
          <Text style={styles.title}>{snapshot.title}</Text>
          <Text style={styles.meta}>{snapshot.journal} · {snapshot.year ?? 'Undated'}{snapshot.doi ? ` · DOI ${snapshot.doi}` : ''}</Text>
          <View style={styles.metrics}>
            <Text style={styles.metric}>Confidence: {snapshot.confidence}</Text>
            <Text style={styles.metric}>Coverage: {snapshot.coverage.replace(/_/g, ' ')}</Text>
            <Text style={styles.metric}>Bias concerns: {snapshot.risk.replace(/_/g, ' ')}</Text>
          </View>
          <View style={styles.card}><Text style={styles.cardTitle}>Key takeaway</Text><Text style={styles.body}>{snapshot.keyTakeaway}</Text></View>
          {snapshot.pico ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>PICO</Text>
              {Object.entries(snapshot.pico).map(([key, value]) => <Text key={key} style={styles.body}><Text style={styles.bold}>{key}: </Text>{value.value} ({value.status.replace(/_/g, ' ')})</Text>)}
            </View>
          ) : null}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Evidence table</Text>
            {snapshot.judgments.map((judgment, index) => (
              <View key={`${judgment.domain}-${index}`} style={styles.judgment}>
                <Text style={styles.judgmentTitle}>{judgment.domain} · {judgment.judgment.replace(/_/g, ' ')}</Text>
                <Text style={styles.question}>{judgment.question}</Text>
                <Text style={styles.body}>{judgment.rationale}</Text>
                {judgment.quote ? <Text style={styles.quote}>“{judgment.quote}”{judgment.location ? ` — ${judgment.location}` : ''}</Text> : <Text style={styles.missing}>No verified passage included.</Text>}
              </View>
            ))}
          </View>
          <View style={styles.card}><Text style={styles.cardTitle}>Caveats</Text>{snapshot.caveats.map((value) => <Text key={value} style={styles.body}>• {value}</Text>)}</View>
          <Text style={styles.provenance}>Generated {new Date(snapshot.analyzedAt).toLocaleDateString()} with {snapshot.analysisModel}, analysis contract v{snapshot.analysisVersion}.</Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, backgroundColor: Colors.primary, paddingHorizontal: 18, paddingVertical: 15 },
  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '800' },
  headerBadge: { color: '#fff', fontSize: 10, fontWeight: '800', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  content: { width: '100%', maxWidth: 820, alignSelf: 'center', padding: 18, gap: 13 },
  notice: { flexDirection: 'row', gap: 9, padding: 12, borderRadius: 12, backgroundColor: Colors.accentLight },
  noticeText: { flex: 1, color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },
  title: { color: Colors.textPrimary, fontSize: 25, lineHeight: 32, fontWeight: '800' },
  meta: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  metric: { color: Colors.primary, backgroundColor: Colors.primaryMuted, fontSize: 11, fontWeight: '700', paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8 },
  card: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 15, padding: 15, gap: 9 },
  cardTitle: { color: Colors.textPrimary, fontSize: 17, fontWeight: '800' },
  body: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20 },
  bold: { color: Colors.textPrimary, fontWeight: '800', textTransform: 'capitalize' },
  judgment: { borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 11, gap: 6 },
  judgmentTitle: { color: Colors.textPrimary, fontSize: 13, fontWeight: '800', textTransform: 'capitalize' },
  question: { color: Colors.textSecondary, fontSize: 12, fontWeight: '600' },
  quote: { color: Colors.primary, backgroundColor: Colors.primaryMuted, borderRadius: 8, padding: 10, fontSize: 12, lineHeight: 18 },
  missing: { color: Colors.textTertiary, fontSize: 11, fontStyle: 'italic' },
  provenance: { color: Colors.textTertiary, fontSize: 10, lineHeight: 15, textAlign: 'center', paddingBottom: 18 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 30 },
  emptyTitle: { color: Colors.textPrimary, fontSize: 19, fontWeight: '800' },
  button: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 18, borderRadius: 11, backgroundColor: Colors.accent },
  buttonText: { color: '#fff', fontWeight: '800' },
});
