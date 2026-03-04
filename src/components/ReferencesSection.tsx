import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { SectionCard } from './SectionCard';
import { BulletList } from './BulletList';
import type { ReferenceCheck, RefCheckStatus } from '../types';

interface Props {
  referenceCheck: ReferenceCheck;
}

const STATUS_CONFIG: Record<RefCheckStatus, { icon: keyof typeof Ionicons.glyphMap; color: string; bg: string; label: string }> = {
  PASS: { icon: 'checkmark-circle', color: Colors.success, bg: Colors.successLight, label: 'References OK' },
  WARN: { icon: 'warning', color: Colors.warning, bg: Colors.warningLight, label: 'Minor Issues' },
  FAIL: { icon: 'close-circle', color: Colors.danger, bg: Colors.dangerLight, label: 'Issues Found' },
};

export function ReferencesSection({ referenceCheck }: Props) {
  const config = STATUS_CONFIG[referenceCheck.status];

  return (
    <SectionCard
      title="Reference Check"
      icon="library-outline"
      iconColor={Colors.primary}
      badge={referenceCheck.status}
      badgeColor={config.color}
    >
      {/* Status banner */}
      <View style={[styles.statusBanner, { backgroundColor: config.bg }]}>
        <Ionicons name={config.icon} size={20} color={config.color} />
        <View style={styles.statusText}>
          <Text style={[styles.statusLabel, { color: config.color }]}>{config.label}</Text>
          {referenceCheck.totalReferences > 0 ? (
            <Text style={styles.refCount}>
              {referenceCheck.totalReferences} references found
              {referenceCheck.selfCitationRate != null
                ? ` · ${Math.round(referenceCheck.selfCitationRate * 100)}% self-citations`
                : ''}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Issues */}
      {referenceCheck.issues.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Issues</Text>
          <BulletList items={referenceCheck.issues} color={Colors.warning} icon="⚠" />
        </View>
      ) : null}

      {/* Indexing problems */}
      {referenceCheck.indexingProblems.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Indexing Problems</Text>
          <BulletList items={referenceCheck.indexingProblems} color={Colors.danger} icon="✗" />
        </View>
      ) : null}

      {/* Positives */}
      {referenceCheck.positives.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Good Practices</Text>
          <BulletList items={referenceCheck.positives} color={Colors.success} icon="✓" />
        </View>
      ) : null}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    marginTop: 8,
  },
  statusText: {
    flex: 1,
    gap: 2,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  refCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  block: {
    marginTop: 10,
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
