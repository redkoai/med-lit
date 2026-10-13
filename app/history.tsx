import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, getScoreColor } from '../src/constants/colors';
import { useAuth } from '../src/hooks/useAuth';
import { useHistory } from '../src/hooks/useHistory';
import type { HistoryEntry } from '../src/types';
import { PageMeta } from '../src/components/PageMeta';
import { WorkspaceHeader } from '../src/components/WorkspaceHeader';
import { isFirebaseConfigured } from '../src/services/firebase';
import { exportLibraryBackup } from '../src/utils/libraryBackup';

function HistoryCard({ entry, onDelete }: { entry: HistoryEntry; onDelete: () => void }) {
  const evidenceColor = getScoreColor(entry.evidenceScore);
  const biasColor = getScoreColor(entry.biasConcernScore);
  const confidenceColor = entry.confidence === 'higher'
    ? Colors.success
    : entry.confidence === 'moderate' ? Colors.accent : entry.confidence === 'lower' ? Colors.warning : Colors.textSecondary;

  const handleTap = () => {
    router.push({ pathname: '/analysis', params: { id: entry.id } });
  };

  return (
    <TouchableOpacity accessibilityRole="link" accessibilityLabel={`Open appraisal for ${entry.title}`} style={styles.card} onPress={handleTap} activeOpacity={0.7}>
      {/* Trust badge + delete */}
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.trustBadge,
            { backgroundColor: `${confidenceColor}18` },
          ]}
        >
          <Ionicons
            name="layers-outline"
            size={12}
            color={confidenceColor}
          />
          <Text
            style={[
              styles.trustText,
              { color: confidenceColor },
            ]}
          >
            {entry.confidence.replace('_', ' ')} confidence
          </Text>
        </View>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Delete appraisal for ${entry.title}`} onPress={(event) => { event.stopPropagation(); onDelete(); }} style={styles.deleteBtn} activeOpacity={0.6}>
          <Ionicons name="trash-outline" size={15} color={Colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.cardTitle} numberOfLines={3}>{entry.title}</Text>
      <Text style={styles.cardMeta}>
        {entry.journal} · {entry.year} · {entry.studyDesign}
      </Text>
      {entry.collection || entry.tags?.length ? (
        <Text style={styles.libraryMeta}>
          {entry.collection ? `Collection: ${entry.collection}` : ''}
          {entry.collection && entry.tags?.length ? ' · ' : ''}
          {entry.tags?.length ? entry.tags.join(', ') : ''}
        </Text>
      ) : null}

      {/* Scores */}
      <View style={styles.scoresRow}>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreValue, { color: evidenceColor }]}>
            {entry.evidenceScore}/10
          </Text>
          <Text style={styles.scoreLabel}>Appraisal</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreValue, { color: biasColor }]}>
            {entry.biasConcernScore}/10
          </Text>
          <Text style={styles.scoreLabel}>Bias domains</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreItem}>
          <Text style={styles.dateValue}>
            {new Date(entry.analyzedAt).toLocaleDateString()}
          </Text>
          <Text style={styles.scoreLabel}>Analyzed</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const { analyses, history, removeFromHistory, clearHistory, loaded, storageMessage, importGuestHistory, syncHistory } = useHistory(user?.uid ?? null);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const authConfigured = isFirebaseConfigured();
  const filteredHistory = useMemo(() => {
    const queryText = search.trim().toLowerCase();
    if (!queryText) return history;
    return history.filter((entry) => [
      entry.title,
      entry.journal,
      entry.studyDesign,
      entry.collection ?? '',
      ...(entry.tags ?? []),
    ].join(' ').toLowerCase().includes(queryText));
  }, [history, search]);

  const confirmDelete = (id?: string) => {
    const message = id ? 'Delete this saved appraisal? Export it first if you want to keep a copy.' : 'Delete all saved appraisals? Download a backup first if you want to keep them.';
    const remove = async () => {
      try { if (id) await removeFromHistory(id); else await clearHistory(); setNotice(id ? 'Saved appraisal deleted.' : 'Saved library deleted.'); }
      catch { setNotice('Deletion could not finish. Your library may still contain this data. Please try again.'); }
    };
    if (Platform.OS === 'web') { if (window.confirm(message)) void remove(); }
    else Alert.alert('Delete saved data', message, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: remove }]);
  };

  return (
    <>
    <PageMeta title="Saved appraisals — MedLit" description="Your locally saved MedLit appraisal library." path="/history" noIndex />
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <WorkspaceHeader active="library" />
      {/* Header */}
      <View style={styles.header}>
        <Text role="heading" aria-level={1} style={styles.headerTitle}>Your reading library.</Text>
        {history.length > 0 ? (
          <View style={styles.headerActions}>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Download library backup" onPress={() => exportLibraryBackup(analyses)} style={styles.headerIconButton}>
              <Ionicons name="download-outline" size={19} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="link" onPress={() => router.push('/compare' as never)} style={styles.clearAllBtn}>
              <Text style={styles.compareText}>Compare</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" onPress={() => confirmDelete()} style={styles.clearAllBtn}>
              <Text style={styles.clearAllText}>Clear all</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ width: 70 }} />
        )}
      </View>
      <View style={{ paddingHorizontal: 24, gap: 8, paddingBottom: 12 }}>
        <Text style={{ color: Colors.textSecondary, fontSize: 13, lineHeight: 21 }}>{user ? 'Your account library · local cache is isolated from other accounts.' : 'Saved on this device · reopen without another AI charge.'}</Text>
        {storageMessage ? <Text accessibilityLiveRegion="polite" style={{ color: Colors.accent, fontSize: 13 }}>{storageMessage}</Text> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 18 }}>
          <TouchableOpacity accessibilityRole="link" onPress={() => router.push('/import' as never)} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: Colors.accent }}>Import papers or restore a backup →</Text></TouchableOpacity>
          {user && <><TouchableOpacity accessibilityRole="button" onPress={async () => { try { await syncHistory(); setNotice('Device changes synced.'); } catch { setNotice('Cloud sync failed. Device copies are safe.'); } }} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: Colors.accent }}>Sync device changes</Text></TouchableOpacity><TouchableOpacity accessibilityRole="button" onPress={() => {
            const copy = async () => { try { await importGuestHistory(); setNotice('Guest reports copied into this account. Guest originals remain on this device.'); } catch { setNotice('Import or sync did not finish. Device originals are safe.'); } };
            if (Platform.OS === 'web') { if (window.confirm('Copy this device’s guest appraisals, including private notes, into your signed-in account and upload them? Guest originals will remain.')) void copy(); }
            else Alert.alert('Import guest library?', 'Copies reports and private notes into this account and uploads them.', [{ text: 'Cancel' }, { text: 'Import', onPress: copy }]);
          }} style={{ minHeight: 44, justifyContent: 'center' }}><Text style={{ color: Colors.accent }}>Import guest library</Text></TouchableOpacity></>}
        </View>
      </View>
      {notice ? <Text accessibilityLiveRegion="polite" style={{ padding: 16, color: Colors.primary }}>{notice}</Text> : null}

      {!loaded ? <Text style={{ padding: 24, color: Colors.textSecondary }}>Loading your saved appraisals…</Text> : history.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="time-outline" size={40} color={Colors.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>No history yet</Text>
          <Text style={styles.emptyBody}>
            Analyzed articles will appear here.
          </Text>
          <TouchableOpacity style={styles.analyzeBtn} onPress={() => router.push('/')} activeOpacity={0.7}>
            <Ionicons name="sparkles" size={16} color="#fff" />
            <Text style={styles.analyzeBtnText}>Analyze an article</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HistoryCard
              entry={item}
              onDelete={() => confirmDelete(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          ListHeaderComponent={(
            <View style={styles.searchWrap}>
              <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                accessibilityLabel="Search saved appraisals"
                placeholder="Search titles, tags, or collections"
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          )}
          ListEmptyComponent={(
            <Text style={styles.noResults}>No saved appraisals match this search.</Text>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}

      {/* Bottom navbar */}
      {Platform.OS !== 'web' && <View style={styles.navbar}>
        <TouchableOpacity accessibilityRole="link" style={styles.navItem} onPress={() => router.push('/')}>
          <Ionicons name="home-outline" size={22} color={Colors.textSecondary} />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="link" accessibilityState={{ selected: true }} style={styles.navItem} onPress={() => {}}>
          <Ionicons name="time" size={22} color={Colors.accent} />
          <Text style={[styles.navLabel, { color: Colors.accent }]}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="link" style={styles.navItem} onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
          <Text style={styles.navLabel}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="link" style={styles.navItem} onPress={() => router.push(authConfigured ? (user ? '/profile' : '/auth') : '/methodology')}>
          <Ionicons name={authConfigured ? (user ? 'person' : 'person-outline') : 'information-circle-outline'} size={22} color={user ? Colors.science : Colors.textSecondary} />
          <Text style={[styles.navLabel, user ? { color: Colors.science } : {}]}>{authConfigured ? (user ? 'Profile' : 'Sign in') : 'About'}</Text>
        </TouchableOpacity>
      </View>}
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    width: '100%', maxWidth: 1000, alignSelf: 'center', flexWrap: 'wrap', gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    flex: 1,
    fontSize: 30,
    fontWeight: '700',
    color: Colors.primary,
    fontFamily: 'Georgia',
  },
  clearAllBtn: {
    minHeight: 44,
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerIconButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  compareText: { fontSize: 14, fontWeight: '700', color: Colors.accent },
  clearAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },

  navbar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 2 : 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    gap: 3,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  list: {
    width: '100%', maxWidth: 1000, alignSelf: 'center',
    padding: 16,
    paddingBottom: 32,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 14, color: Colors.textPrimary },
  noResults: { textAlign: 'center', color: Colors.textSecondary, padding: 30 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center',
    padding: 6,
    borderRadius: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 21,
  },
  cardMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  libraryMeta: { fontSize: 11, lineHeight: 16, color: Colors.science },
  scoresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  scoreLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  scoreDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    gap: 12,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  analyzeBtn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
  },
  analyzeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
