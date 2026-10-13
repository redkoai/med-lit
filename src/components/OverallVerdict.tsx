import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import type { OverallVerdict as OverallVerdictType } from '../types';

interface Props {
  verdict: OverallVerdictType;
}

function AssessmentPill({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={[styles.pill, { backgroundColor: `${color}18` }]}>
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[styles.pillText, { color }]}>{label}: {value}</Text>
    </View>
  );
}

export function OverallVerdict({ verdict }: Props) {
  const confidenceColor = verdict.confidence === 'higher'
    ? Colors.success
    : verdict.confidence === 'moderate'
      ? Colors.accent
      : verdict.confidence === 'lower' ? Colors.warning : Colors.textSecondary;
  const gradientColors: [string, string] = [`${confidenceColor}14`, Colors.surface];

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <Text style={styles.sectionLabel}>APPRAISAL OVERVIEW</Text>

      <View style={styles.pillRow}>
        <AssessmentPill
          label="Appraisal support (heuristic)"
          value={verdict.confidence.replace('_', ' ')}
          color={confidenceColor}
          icon="layers-outline"
        />
        <AssessmentPill
          label="Applicability"
          value={verdict.applicability.replace(/_/g, ' ')}
          color={Colors.textSecondary}
          icon="medkit-outline"
        />
      </View>

      <Text style={styles.summary}>{verdict.overallSummary}</Text>

      <View style={styles.takeawayBox}>
        <Ionicons name="bulb" size={16} color={Colors.warning} />
        <Text style={styles.takeawayText}>{verdict.keyTakeaway}</Text>
      </View>

      {verdict.caveats.length > 0 ? (
        <View style={styles.caveatsBox}>
          <Text style={styles.caveatsLabel}>Key caveats before using or citing this appraisal:</Text>
          {verdict.caveats.map((c, i) => (
            <View key={i} style={styles.caveatRow}>
              <Ionicons name="alert-circle-outline" size={13} color={Colors.warning} />
              <Text style={styles.caveatText}>{c}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  summary: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  takeawayBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.warningLight,
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  takeawayText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 20,
    flex: 1,
  },
  caveatsBox: {
    gap: 6,
  },
  caveatsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  caveatRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  caveatText: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
    flex: 1,
  },
});
