import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, getSeverityColor } from '../constants/colors';
import { SectionCard } from './SectionCard';
import { BulletList } from './BulletList';
import type { RiskOfBiasAssessment, BiasSeverity } from '../types';

interface Props {
  riskOfBias: RiskOfBiasAssessment;
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

export function BiasSection({ riskOfBias }: Props) {
  const riskColors: Record<string, string> = {
    low: Colors.success,
    some_concerns: Colors.warning,
    high: Colors.danger,
    unclear: Colors.textSecondary,
  };
  const riskColor = riskColors[riskOfBias.overallRisk] || Colors.textSecondary;

  return (
    <SectionCard
      title="Bias Assessment"
      icon="eye-outline"
      iconColor={Colors.warning}
      badge={riskOfBias.overallRisk.replace('_', ' ').toUpperCase()}
      badgeColor={riskColor}
    >
      {/* Score + overall risk */}
      <View style={styles.topRow}>
        <View style={styles.riskBlock}>
          <Text style={styles.riskLabel}>Overall Risk</Text>
          <View style={[styles.riskPill, { backgroundColor: riskColor }]}>
            <Text style={styles.riskPillText}>
              {riskOfBias.overallRisk.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.reasoning}>{riskOfBias.overallReasoning}</Text>
        </View>
      </View>

      {/* Biases found */}
      {riskOfBias.biasesFound.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Bias concerns to review</Text>
          {riskOfBias.biasesFound.map((bias, i) => (
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
          <Ionicons name={riskOfBias.overallRisk === 'unclear' ? 'help-circle-outline' : 'shield-checkmark'} size={20} color={Colors.textSecondary} />
          <Text style={[styles.cleanBillText, { color: Colors.textSecondary }]}>{riskOfBias.overallRisk === 'unclear' ? 'Insufficient evidence to resolve all domains. This is not a low-risk finding.' : 'No concern identified in the assessable domains. This is not proof of absence of bias.'}</Text>
        </View>
      )}

      {/* Positive practices */}
      {riskOfBias.positivePractices.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Bias-Reduction Practices</Text>
          <BulletList
            items={riskOfBias.positivePractices}
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
