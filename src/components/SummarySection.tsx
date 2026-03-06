import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { SectionCard } from './SectionCard';
import { BulletList } from './BulletList';
import type { ArticleSummary } from '../types';
import { calculateReadability } from '../utils/readability';

interface Props {
  summary: ArticleSummary;
}

export function SummarySection({ summary }: Props) {
  const [mode, setMode] = useState<'adult' | 'kid'>('adult');

  const readabilityMetrics = useMemo(() => {
    const fullText = [
      summary.oneLiner,
      ...summary.whatTheyDid,
      ...summary.whatTheyFound,
      summary.whyItMatters,
      summary.bottomLine,
    ].join(' ');
    return calculateReadability(fullText);
  }, [summary]);

  return (
    <SectionCard title="Plain Language Summary" icon="reader-outline" iconColor={Colors.science} defaultExpanded>
      {/* Adult / Kid toggle */}
      <View style={styles.toggleRow}>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'adult' && styles.toggleBtnActive]}
            onPress={() => setMode('adult')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="school-outline"
              size={14}
              color={mode === 'adult' ? '#fff' : Colors.textSecondary}
            />
            <Text style={[styles.toggleText, mode === 'adult' && styles.toggleTextActive]}>
              Adult
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'kid' && styles.toggleBtnActive]}
            onPress={() => setMode('kid')}
            activeOpacity={0.7}
          >
            <Ionicons
              name="happy-outline"
              size={14}
              color={mode === 'kid' ? '#fff' : Colors.textSecondary}
            />
            <Text style={[styles.toggleText, mode === 'kid' && styles.toggleTextActive]}>
              Kid
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.toggleHint}>
          {mode === 'kid' ? 'Simplified view' : 'Full detail'}
        </Text>
      </View>

      {/* One-liner */}
      <View style={styles.oneLinerBox}>
        <Text style={styles.oneLiner}>{summary.oneLiner}</Text>
      </View>

      {mode === 'adult' ? (
        <>
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
        </>
      ) : (
        <>
          {/* Kid-friendly simplified sections */}
          <View style={styles.block}>
            <View style={styles.blockHeader}>
              <Ionicons name="sparkles-outline" size={14} color={Colors.accent} />
              <Text style={styles.blockTitle}>What happened</Text>
            </View>
            <Text style={styles.body}>
              {summary.whatTheyFound[0] || summary.whyItMatters}
            </Text>
          </View>

          <View style={styles.block}>
            <View style={styles.blockHeader}>
              <Ionicons name="star-outline" size={14} color={Colors.warning} />
              <Text style={styles.blockTitle}>Why it's important</Text>
            </View>
            <Text style={styles.body}>{summary.whyItMatters}</Text>
          </View>
        </>
      )}

      {/* Bottom line */}
      <View style={styles.bottomLine}>
        <Text style={styles.bottomLineLabel}>
          {mode === 'kid' ? 'The big idea' : 'Bottom line'}
        </Text>
        <Text style={styles.bottomLineText}>{summary.bottomLine}</Text>
      </View>

      {mode === 'adult' ? (
        <>
          <Text style={styles.audience}>
            <Text style={styles.audienceLabel}>For: </Text>
            {summary.whoShouldCare}
          </Text>

          {/* Readability Metrics */}
          <View style={styles.readabilityBox}>
            <View style={styles.readabilityHeader}>
              <Ionicons name="stats-chart-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.readabilityTitle}>Readability Metrics</Text>
            </View>
            <View style={styles.metricsGrid}>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{readabilityMetrics.readabilityLevel}</Text>
                <Text style={styles.metricLabel}>Reading Level</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>Grade {Math.round(readabilityMetrics.fleschKincaidGrade)}</Text>
                <Text style={styles.metricLabel}>F-K Grade</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>~{readabilityMetrics.readingTimeMinutes} min</Text>
                <Text style={styles.metricLabel}>Reading Time</Text>
              </View>
              <View style={styles.metric}>
                <Text style={styles.metricValue}>{readabilityMetrics.wordCount}</Text>
                <Text style={styles.metricLabel}>Words</Text>
              </View>
            </View>
            <Text style={styles.readabilityNote}>
              Flesch Reading Ease: {readabilityMetrics.fleschReadingEase}/100
              {readabilityMetrics.fleschReadingEase >= 60
                ? ' (easily understood by general public)'
                : readabilityMetrics.fleschReadingEase >= 40
                ? ' (moderate difficulty)'
                : ' (difficult, may need background knowledge)'}
            </Text>
          </View>
        </>
      ) : null}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  toggleBtnActive: {
    backgroundColor: Colors.science,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: '#fff',
  },
  toggleHint: {
    fontSize: 11,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
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
  readabilityBox: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 10,
  },
  readabilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  readabilityTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metric: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: 10,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 8,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  readabilityNote: {
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 15,
  },
});
