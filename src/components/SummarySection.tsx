import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { SectionCard } from './SectionCard';
import { BulletList } from './BulletList';
import type { ArticleSummary } from '../types';

interface Props {
  summary: ArticleSummary;
}

export function SummarySection({ summary }: Props) {
  return (
    <SectionCard title="Plain Language Summary" icon="reader-outline" iconColor={Colors.science} defaultExpanded>
      {/* One-liner */}
      <View style={styles.oneLinerBox}>
        <Text style={styles.oneLiner}>{summary.oneLiner}</Text>
      </View>

      {/* What they did */}
      <View style={styles.block}>
        <View style={styles.blockHeader}>
          <Ionicons name="flask-outline" size={14} color={Colors.accent} />
          <Text style={styles.blockTitle}>What they did</Text>
        </View>
        <BulletList items={summary.whatTheyDid} color={Colors.accent} />
      </View>

      {/* What they found */}
      <View style={styles.block}>
        <View style={styles.blockHeader}>
          <Ionicons name="search-outline" size={14} color={Colors.success} />
          <Text style={styles.blockTitle}>What they found</Text>
        </View>
        <BulletList items={summary.whatTheyFound} color={Colors.success} />
      </View>

      {/* Why it matters */}
      <View style={styles.block}>
        <View style={styles.blockHeader}>
          <Ionicons name="heart-outline" size={14} color={Colors.warning} />
          <Text style={styles.blockTitle}>Why it matters</Text>
        </View>
        <Text style={styles.body}>{summary.whyItMatters}</Text>
      </View>

      {/* Bottom line */}
      <View style={styles.bottomLine}>
        <Text style={styles.bottomLineLabel}>Bottom line</Text>
        <Text style={styles.bottomLineText}>{summary.bottomLine}</Text>
      </View>

      <Text style={styles.audience}>
        <Text style={styles.audienceLabel}>For: </Text>
        {summary.whoShouldCare}
      </Text>
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  oneLinerBox: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  oneLiner: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
    lineHeight: 22,
  },
  block: {
    marginBottom: 14,
    gap: 8,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  body: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  bottomLine: {
    backgroundColor: Colors.accentLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  bottomLineLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  bottomLineText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  audience: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  audienceLabel: {
    fontWeight: '700',
    color: Colors.textSecondary,
  },
});
