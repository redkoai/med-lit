import React from 'react';
import {
  View,
  Text,
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

function HistoryCard({ entry, onDelete }: { entry: HistoryEntry; onDelete: () => void }) {
  const accuracyColor = getScoreColor(entry.accuracyScore);
  const biasColor = getScoreColor(entry.biasScore);

  const handleTap = () => {
    router.push({ pathname: '/', params: { url: entry.url } });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handleTap} activeOpacity={0.7}>
      {/* Trust badge + delete */}
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.trustBadge,
            { backgroundColor: entry.trustworthy ? Colors.successLight : Colors.dangerLight },
          ]}
        >
          <Ionicons
            name={entry.trustworthy ? 'shield-checkmark' : 'shield-outline'}
            size={12}
            color={entry.trustworthy ? Colors.success : Colors.danger}
          />
          <Text
            style={[
              styles.trustText,
              { color: entry.trustworthy ? Colors.success : Colors.danger },
            ]}
          >
            {entry.trustworthy ? 'Trustworthy' : 'Caution'}
          </Text>
        </View>
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn} activeOpacity={0.6}>
          <Ionicons name="trash-outline" size={15} color={Colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={styles.cardTitle} numberOfLines={3}>{entry.title}</Text>
      <Text style={styles.cardMeta}>
        {entry.journal} · {entry.year} · {entry.studyDesign}
      </Text>

      {/* Scores */}
      <View style={styles.scoresRow}>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreValue, { color: accuracyColor }]}>
            {entry.accuracyScore}/10
          </Text>
          <Text style={styles.scoreLabel}>Accuracy</Text>
        </View>
        <View style={styles.scoreDivider} />
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreValue, { color: biasColor }]}>
            {entry.biasScore}/10
          </Text>
          <Text style={styles.scoreLabel}>Bias-Free</Text>
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
  const { history, removeFromHistory, clearHistory } = useHistory(user?.uid ?? null);

  const handleClearAll = () => {
    Alert.alert(
      'Clear All History',
      'This will permanently delete all past analyses.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: () => clearHistory() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analysis History</Text>
        {history.length > 0 ? (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearAllBtn}>
            <Text style={styles.clearAllText}>Clear all</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 70 }} />
        )}
      </View>

      {history.length === 0 ? (
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
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HistoryCard
              entry={item}
              onDelete={() => removeFromHistory(item.id)}
            />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}

      {/* Bottom navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
          <Ionicons name="home-outline" size={22} color={Colors.textSecondary} />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => {}}>
          <Ionicons name="time" size={22} color={Colors.accent} />
          <Text style={[styles.navLabel, { color: Colors.accent }]}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
          <Text style={styles.navLabel}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push(user ? '/profile' : '/auth')}>
          <Ionicons name={user ? 'person' : 'person-outline'} size={22} color={user ? Colors.science : Colors.textSecondary} />
          <Text style={[styles.navLabel, user ? { color: Colors.science } : {}]}>{user ? 'Profile' : 'Sign in'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  clearAllBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
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
    padding: 16,
    paddingBottom: 32,
  },
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
