import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import type { OverallVerdict as OverallVerdictType } from '../types';

interface Props {
  verdict: OverallVerdictType;
}

function VerdictPill({
  label,
  value,
  trueIcon,
  falseIcon,
}: {
  label: string;
  value: boolean;
  trueIcon: keyof typeof Ionicons.glyphMap;
  falseIcon: keyof typeof Ionicons.glyphMap;
}) {
  const color = value ? Colors.success : Colors.danger;
  const bg = value ? Colors.successLight : Colors.dangerLight;

  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Ionicons name={value ? trueIcon : falseIcon} size={14} color={color} />
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

export function OverallVerdict({ verdict }: Props) {
  const gradientColors: [string, string] = verdict.trustworthy
    ? [Colors.successLight, '#F0FDF9']
    : verdict.clinicallyApplicable
    ? ['#FEF3C7', '#FFFBEB']
    : [Colors.dangerLight, '#FFF5F5'];

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <Text style={styles.sectionLabel}>OVERALL VERDICT</Text>

      <View style={styles.pillRow}>
        <VerdictPill
          label="Trustworthy"
          value={verdict.trustworthy}
          trueIcon="shield-checkmark"
          falseIcon="shield-outline"
        />
        <VerdictPill
          label="Clinically Applicable"
          value={verdict.clinicallyApplicable}
          trueIcon="medkit"
          falseIcon="medkit-outline"
        />
        <VerdictPill
          label="Read-Worthy"
          value={verdict.readWorthy}
          trueIcon="bookmark"
          falseIcon="bookmark-outline"
        />
      </View>

      <Text style={styles.summary}>{verdict.overallSummary}</Text>

      <View style={styles.takeawayBox}>
        <Ionicons name="bulb" size={16} color={Colors.warning} />
        <Text style={styles.takeawayText}>{verdict.keyTakeaway}</Text>
      </View>

      {verdict.caveats.length > 0 ? (
        <View style={styles.caveatsBox}>
          <Text style={styles.caveatsLabel}>Key caveats when citing this paper:</Text>
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
