import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, getScoreColor } from '../src/constants/colors';
import { useHistory } from '../src/hooks/useHistory';
import type { HistoryEntry } from '../src/types';

function HistoryCard({ entry, onDelete }: { entry: HistoryEntry; onDelete: () => void }) {
  const accuracyColor = getScoreColor(entry.accuracyScore);
  const biasColor = getScoreColor(entry.biasScore);

  return (
    <View style={styles.card}>
      {/* Trust badge */}
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
        <TouchableOpacity onPress={onDelete} style={styles.deleteBtn}>
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
    </View>
  );
}

export default function HistoryScreen() {
  const { history, removeFromHistory, clearHistory } = useHistory();

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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis History</Text>
        {history.length > 0 ? (
          <TouchableOpacity onPress={handleClearAll}>
            <Text style={styles.clearAllText}>Clear all</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {history.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="time-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No history yet</Text>
          <Text style={styles.emptyBody}>
            Analyzed articles will appear here.
          </Text>
          <TouchableOpacity style={styles.analyzeBtn} onPress={() => router.back()}>
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
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  backBtn: { padding: 6 },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  clearAllText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    width: 60,
    textAlign: 'right',
  },

  list: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    lineHeight: 20,
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
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  scoreItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  scoreValue: {
    fontSize: 15,
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
    fontWeight: '500',
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
    backgroundColor: Colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  analyzeBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
