import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, getSeverityColor, getScoreColor } from '../constants/colors';
import { SectionCard } from './SectionCard';
import { BulletList } from './BulletList';
import { ScoreCircle } from './ScoreCircle';
import type { BiasScore, BiasSeverity } from '../types';

interface Props {
  biasScore: BiasScore;
}

function SeverityBadge({ severity }: { severity: BiasSeverity }) {
  const color = getSeverityColor(severity);
  const bgMap: Record<BiasSeverity, string> = {
    low: Colors.successLight,
    moderate: Colors.warningLight,
    high: Colors.dangerLight,
    critical: '#FEE2E2',
  };
  return (
    <View style={[styles.severityBadge, { backgroundColor: bgMap[severity] }]}>
      <Text style={[styles.severityText, { color }]}>
        {severity.toUpperCase()}
      </Text>
    </View>
  );
}

export function BiasSection({ biasScore }: Props) {
  const badgeColor = getScoreColor(biasScore.score);
  const riskColors: Record<string, string> = {
    low: Colors.success,
    moderate: Colors.warning,
    high: Colors.danger,
    critical: '#7F1D1D',
  };
  const riskColor = riskColors[biasScore.overallRisk] || Colors.textSecondary;

  return (
    <SectionCard
      title="Bias Assessment"
      icon="eye-outline"
      iconColor={Colors.warning}
      badge={`${biasScore.score}/10`}
      badgeColor={badgeColor}
    >
      {/* Score + overall risk */}
      <View style={styles.topRow}>
        <ScoreCircle
          score={biasScore.score}
          label="Bias-Free"
          subtitle="10 = least biased"
          size="medium"
        />
        <View style={styles.riskBlock}>
          <Text style={styles.riskLabel}>Overall Risk</Text>
          <View style={[styles.riskPill, { backgroundColor: riskColor }]}>
            <Text style={styles.riskPillText}>
              {biasScore.overallRisk.toUpperCase()}
            </Text>
          </View>
          <Text style={styles.reasoning}>{biasScore.overallReasoning}</Text>
        </View>
      </View>

      {/* Biases found */}
      {biasScore.biasesFound.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Biases Detected</Text>
          {biasScore.biasesFound.map((bias, i) => (
            <View key={i} style={styles.biasItem}>
              <View style={styles.biasHeader}>
                <Ionicons
                  name="alert-circle"
                  size={14}
                  color={getSeverityColor(bias.severity)}
                />
                <Text style={styles.biasType}>{bias.type}</Text>
                <SeverityBadge severity={bias.severity} />
              </View>
              <Text style={styles.biasExplanation}>{bias.explanation}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.cleanBill}>
          <Ionicons name="shield-checkmark" size={20} color={Colors.success} />
          <Text style={styles.cleanBillText}>No significant biases detected</Text>
        </View>
      )}

      {/* Positive practices */}
      {biasScore.positivePractices.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Bias-Reduction Practices</Text>
          <BulletList
            items={biasScore.positivePractices}
            color={Colors.success}
            icon="✓"
          />
        </View>
      ) : null}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingTop: 8,
  },
  riskBlock: {
    flex: 1,
    gap: 6,
  },
  riskLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  riskPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  riskPillText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  reasoning: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  block: {
    marginTop: 8,
    gap: 8,
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  biasItem: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    padding: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  biasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  biasType: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
  },
  biasExplanation: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  severityBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cleanBill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.successLight,
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
  },
  cleanBillText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.success,
  },
});
