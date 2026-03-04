import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, getScoreColor } from '../constants/colors';
import { SectionCard } from './SectionCard';
import { BulletList } from './BulletList';
import { ScoreCircle } from './ScoreCircle';
import type { AccuracyScore } from '../types';

interface Props {
  accuracyScore: AccuracyScore;
}

const GRADE_COLORS: Record<string, string> = {
  'A+': Colors.scoreExcellent,
  'A': Colors.scoreExcellent,
  'B+': Colors.scoreGood,
  'B': Colors.scoreGood,
  'C': Colors.scoreFair,
  'D': Colors.scorePoor,
  'F': Colors.scorePoor,
};

export function AccuracySection({ accuracyScore }: Props) {
  const badgeColor = getScoreColor(accuracyScore.score);
  const gradeColor = GRADE_COLORS[accuracyScore.grade] || Colors.textSecondary;

  return (
    <SectionCard
      title="Accuracy & Rigor"
      icon="analytics-outline"
      iconColor={Colors.accent}
      badge={`${accuracyScore.score}/10`}
      badgeColor={badgeColor}
    >
      <View style={styles.topRow}>
        <ScoreCircle
          score={accuracyScore.score}
          label="Accuracy"
          size="medium"
        />
        <View style={styles.gradeBlock}>
          <Text style={styles.gradeLabel}>Grade</Text>
          <View style={[styles.gradeCircle, { borderColor: gradeColor }]}>
            <Text style={[styles.gradeText, { color: gradeColor }]}>
              {accuracyScore.grade}
            </Text>
          </View>
        </View>
      </View>

      {/* Red flags */}
      {accuracyScore.redFlags.length > 0 ? (
        <View style={styles.redFlagBox}>
          <Text style={styles.redFlagTitle}>🚩 Red Flags</Text>
          <BulletList items={accuracyScore.redFlags} color={Colors.danger} icon="!" />
        </View>
      ) : null}

      {/* Strengths */}
      {accuracyScore.strengths.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Strengths</Text>
          <BulletList items={accuracyScore.strengths} color={Colors.success} icon="✓" />
        </View>
      ) : null}

      {/* Weaknesses */}
      {accuracyScore.weaknesses.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Weaknesses</Text>
          <BulletList items={accuracyScore.weaknesses} color={Colors.warning} icon="⚠" />
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
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradeText: {
    fontSize: 22,
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
