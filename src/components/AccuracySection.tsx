import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';
import { SectionCard } from './SectionCard';
import { BulletList } from './BulletList';
import type { EvidenceConfidenceScore } from '../types';

interface Props {
  evidenceScore: EvidenceConfidenceScore;
}

const LABEL_COLORS: Record<EvidenceConfidenceScore['label'], string> = {
  higher: Colors.scoreExcellent,
  moderate: Colors.scoreGood,
  lower: Colors.scoreFair,
  insufficient: Colors.scorePoor,
};

export function AccuracySection({ evidenceScore }: Props) {
  const gradeColor = LABEL_COLORS[evidenceScore.label];

  return (
    <SectionCard
      title="Appraisal support & limitations"
      icon="analytics-outline"
      iconColor={Colors.accent}
      badge={evidenceScore.label}
      badgeColor={gradeColor}
    >
      <View style={styles.topRow}>
        <Text style={{ color: Colors.textSecondary, fontSize: 13, lineHeight: 21 }}>This heuristic combines source coverage, matched quotations, and assessable domains. It is not a probability that the findings are correct or a validated quality rating.</Text>
      </View>

      {/* Red flags */}
      {evidenceScore.redFlags.length > 0 ? (
        <View style={styles.redFlagBox}>
          <Text style={styles.redFlagTitle}>🚩 Red Flags</Text>
          <BulletList items={evidenceScore.redFlags} color={Colors.danger} icon="!" />
        </View>
      ) : null}

      {/* Strengths */}
      {evidenceScore.strengths.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Strengths</Text>
          <BulletList items={evidenceScore.strengths} color={Colors.success} icon="✓" />
        </View>
      ) : null}

      {/* Weaknesses */}
      {evidenceScore.weaknesses.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Weaknesses</Text>
          <BulletList items={evidenceScore.weaknesses} color={Colors.warning} icon="⚠" />
        </View>
      ) : null}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingTop: 8,
  },
  gradeBlock: {
    alignItems: 'center',
    gap: 6,
  },
  gradeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  gradeCircle: {
    minWidth: 92,
    minHeight: 60,
    borderRadius: 30,
    paddingHorizontal: 10,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  redFlagBox: {
    backgroundColor: Colors.dangerLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    gap: 8,
  },
  redFlagTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.danger,
  },
  block: {
    marginTop: 8,
    gap: 6,
  },
  blockTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
