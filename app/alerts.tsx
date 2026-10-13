import React, { useEffect, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../src/constants/colors';
import { PageMeta } from '../src/components/PageMeta';
import { useAuth } from '../src/hooks/useAuth';
import { useHistory } from '../src/hooks/useHistory';
import {
  addSavedSearch,
  checkPaperUpdates,
  checkSavedSearch,
  loadSavedSearches,
  removeSavedSearch,
  type PaperUpdateSignals,
  type SavedEvidenceSearch,
} from '../src/services/evidenceMonitoring';

export default function AlertsScreen() {
  const { user } = useAuth();
  const { analyses } = useHistory(user?.uid ?? null);
  const [searches, setSearches] = useState<SavedEvidenceSearch[]>([]);
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [signals, setSignals] = useState<Record<string, PaperUpdateSignals>>({});
  useEffect(() => { loadSavedSearches().then(setSearches); }, []);

  return (
    <>
      <PageMeta title="Evidence alerts — MedLit" description="Private saved PubMed searches and manual correction or retraction checks." path="/alerts" noIndex />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.header}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.headerButton}><Ionicons name="arrow-back" size={22} color="#fff" /></TouchableOpacity>
          <Text style={styles.headerTitle}>Evidence alerts</Text><View style={styles.headerButton} />
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.notice}><Ionicons name="notifications-outline" size={19} color={Colors.accent} /><Text style={styles.noticeText}>Checks run only when you request them. Background email/push delivery requires a dedicated authenticated backend and notification consent.</Text></View>
          <Text style={styles.sectionTitle}>Saved PubMed searches</Text>
          <View style={styles.addRow}>
            <TextInput accessibilityLabel="PubMed search query" value={query} onChangeText={setQuery} placeholder="e.g. hypertension randomized controlled trial" placeholderTextColor={Colors.textTertiary} style={styles.input} returnKeyType="done" />
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Save PubMed search" onPress={async () => { setSearches(await addSavedSearch(query)); setQuery(''); }} style={styles.addButton}><Ionicons name="add" size={22} color="#fff" /></TouchableOpacity>
          </View>
          {!searches.length ? <Text style={styles.empty}>No saved searches yet.</Text> : null}
          {searches.map((search) => (
            <View key={search.id} style={styles.card}>
              <View style={styles.cardHeader}><Text style={styles.cardTitle}>{search.query}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Delete saved search ${search.query}`} onPress={async () => setSearches(await removeSavedSearch(search.id))} style={styles.iconButton}><Ionicons name="trash-outline" size={18} color={Colors.textTertiary} /></TouchableOpacity></View>
              <Text style={styles.meta}>{search.lastCheckedAt ? `Checked ${new Date(search.lastCheckedAt).toLocaleString()}` : 'Not checked yet; the first check establishes a baseline.'}</Text>
              {search.newPmids.length ? <Text style={styles.newCount}>{search.newPmids.length} new indexed paper{search.newPmids.length === 1 ? '' : 's'}</Text> : null}
              {search.newPmids.map((pmid) => <TouchableOpacity accessibilityRole="link" key={pmid} onPress={() => Linking.openURL(`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`)}><Text style={styles.link}>Open PMID {pmid}</Text></TouchableOpacity>)}
              <TouchableOpacity accessibilityRole="button" disabled={busyId === search.id} onPress={async () => { setBusyId(search.id); try { setSearches(await checkSavedSearch(search.id)); } finally { setBusyId(null); } }} style={styles.secondaryButton}><Ionicons name="refresh" size={16} color={Colors.accent} /><Text style={styles.secondaryText}>{busyId === search.id ? 'Checking…' : 'Check PubMed now'}</Text></TouchableOpacity>
            </View>
          ))}

          <Text style={styles.sectionTitle}>What changed since this paper?</Text>
          <Text style={styles.sectionBody}>Refresh current PubMed retraction flags and Crossref update/citation signals for saved papers. Citation counts are context, not quality scores.</Text>
          {!analyses.length ? <Text style={styles.empty}>Save an appraisal to monitor a paper.</Text> : null}
          {analyses.slice(0, 25).map((analysis) => {
            const result = signals[analysis.id];
            return (
              <View key={analysis.id} style={styles.card}>
                <Text style={styles.cardTitle}>{analysis.article.title}</Text>
                <Text style={styles.meta}>{analysis.article.journal} · {analysis.article.year ?? 'Undated'}</Text>
                {result ? (
                  <View style={styles.signals}>
                    <Text style={result.retractionStatus === 'notice_found' ? styles.danger : styles.signalText}>Retraction/update notice: {result.retractionStatus.replace(/_/g, ' ')}</Text>
                    <Text style={styles.signalText}>Crossref citations: {result.citationCount ?? 'not available'}</Text>
                    {result.updateRelations.map((relation) => <Text key={relation} style={styles.danger}>Update relation: {relation}</Text>)}
                    <Text style={styles.note}>{result.note}</Text>
                  </View>
                ) : null}
                <TouchableOpacity accessibilityRole="button" disabled={busyId === analysis.id} onPress={async () => { setBusyId(analysis.id); try { const nextSignals = await checkPaperUpdates(analysis); setSignals((current) => ({ ...current, [analysis.id]: nextSignals })); } finally { setBusyId(null); } }} style={styles.secondaryButton}><Ionicons name="pulse-outline" size={16} color={Colors.accent} /><Text style={styles.secondaryText}>{busyId === analysis.id ? 'Checking…' : 'Check index signals'}</Text></TouchableOpacity>
              </View>
            );
          })}
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
  content: { width: '100%', maxWidth: 820, alignSelf: 'center', padding: 18, gap: 12 },
  notice: { flexDirection: 'row', gap: 9, borderRadius: 12, backgroundColor: Colors.accentLight, padding: 12 },
  noticeText: { flex: 1, color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },
  sectionTitle: { marginTop: 5, color: Colors.textPrimary, fontSize: 20, fontWeight: '800' },
  sectionBody: { color: Colors.textSecondary, fontSize: 13, lineHeight: 19 },
  addRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, minHeight: 46, borderWidth: 1, borderColor: Colors.border, borderRadius: 11, paddingHorizontal: 12, color: Colors.textPrimary, backgroundColor: Colors.surface },
  addButton: { width: 48, minHeight: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: Colors.accent },
  card: { gap: 8, borderWidth: 1, borderColor: Colors.border, borderRadius: 14, backgroundColor: Colors.surface, padding: 14 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  cardTitle: { flex: 1, color: Colors.textPrimary, fontSize: 14, lineHeight: 20, fontWeight: '800' },
  iconButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  meta: { color: Colors.textSecondary, fontSize: 11, lineHeight: 16 },
  newCount: { color: Colors.success, fontSize: 12, fontWeight: '800' },
  link: { color: Colors.accent, fontSize: 12, fontWeight: '700', paddingVertical: 5 },
  secondaryButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 10, backgroundColor: Colors.accentLight },
  secondaryText: { color: Colors.accent, fontSize: 12, fontWeight: '800' },
  signals: { gap: 5, backgroundColor: Colors.background, borderRadius: 10, padding: 10 },
  signalText: { color: Colors.textPrimary, fontSize: 12, lineHeight: 17 },
  danger: { color: Colors.danger, fontSize: 12, lineHeight: 17, fontWeight: '800' },
  note: { color: Colors.textSecondary, fontSize: 10, lineHeight: 15 },
  empty: { color: Colors.textSecondary, textAlign: 'center', padding: 15 },
});
