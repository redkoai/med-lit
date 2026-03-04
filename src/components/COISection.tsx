import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { SectionCard } from './SectionCard';
import type { ConflictOfInterest, COIStatus } from '../types';

interface Props {
  coi: ConflictOfInterest;
  limitations: string[];
}

const COI_CONFIG: Record<COIStatus, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string; label: string; desc: string }> = {
  CLEAR: {
    icon: 'shield-checkmark',
    color: Colors.success,
    bg: Colors.successLight,
    label: 'No Conflict of Interest',
    desc: 'COI statement present; no concerns identified.',
  },
  DECLARED: {
    icon: 'warning',
    color: Colors.warning,
    bg: Colors.warningLight,
    label: 'COI Declared',
    desc: 'Potential conflict declared — interpret results with caution.',
  },
  FLAGGED: {
    icon: 'flag',
    color: Colors.danger,
    bg: Colors.dangerLight,
    label: 'COI Flagged',
    desc: 'Potential undisclosed or concerning conflict of interest detected.',
  },
  MISSING: {
    icon: 'help-circle',
    color: Colors.textSecondary,
    bg: Colors.borderLight,
    label: 'COI Statement Missing',
    desc: 'No conflict of interest statement found in this article.',
  },
};

export function COISection({ coi, limitations }: Props) {
  const config = COI_CONFIG[coi.status];

  return (
    <SectionCard
      title="Conflict of Interest & Limitations"
      icon="ribbon-outline"
      iconColor={config.color}
      badge={coi.status}
      badgeColor={config.color}
    >
      {/* COI Status */}
      <View style={[styles.coiBox, { backgroundColor: config.bg }]}>
        <Ionicons name={config.icon} size={22} color={config.color} />
        <View style={styles.coiText}>
          <Text style={[styles.coiLabel, { color: config.color }]}>{config.label}</Text>
          <Text style={styles.coiDesc}>{config.desc}</Text>
        </View>
      </View>

      {/* Details */}
      {coi.fundingSource ? (
        <View style={styles.row}>
          <Ionicons name="cash-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.detailText}>
            <Text style={styles.detailLabel}>Funding: </Text>
            {coi.fundingSource}
          </Text>
        </View>
      ) : null}

      {coi.industryFunded ? (
        <View style={[styles.industryBadge]}>
          <Ionicons name="business-outline" size={13} color={Colors.warning} />
          <Text style={styles.industryText}>Industry-funded study — results may warrant additional scrutiny</Text>
        </View>
      ) : null}

      {coi.details ? (
        <Text style={styles.detailFull}>{coi.details}</Text>
      ) : null}

      {/* Limitations */}
      {limitations.length > 0 ? (
        <View style={styles.limitsBlock}>
          <View style={styles.limitsHeader}>
            <Ionicons name="alert-circle-outline" size={14} color={Colors.textSecondary} />
            <Text style={styles.limitsTitle}>Study Limitations</Text>
          </View>
          {limitations.map((lim, i) => (
            <View key={i} style={styles.limitRow}>
              <Text style={styles.limitNum}>{i + 1}.</Text>
              <Text style={styles.limitText}>{lim}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  coiBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  coiText: {
    flex: 1,
    gap: 3,
  },
  coiLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  coiDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
    flex: 1,
  },
  detailLabel: {
    fontWeight: '700',
  },
  detailFull: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  industryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.warningLight,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  industryText: {
    fontSize: 13,
    color: Colors.warning,
    fontWeight: '600',
    flex: 1,
    lineHeight: 18,
  },
  limitsBlock: {
    marginTop: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  limitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  limitsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  limitRow: {
    flexDirection: 'row',
    gap: 8,
  },
  limitNum: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textTertiary,
    width: 18,
  },
  limitText: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
    flex: 1,
  },
});
