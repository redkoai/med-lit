import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, getScoreColor } from '../constants/colors';
import { SectionCard } from './SectionCard';
import { BulletList } from './BulletList';
import { ScoreCircle } from './ScoreCircle';
import type { MethodsScore } from '../types';

interface Props {
  methodsScore: MethodsScore;
}

function CheckRow({ label, value, na = false }: { label: string; value: boolean | null; na?: boolean }) {
  if (na || value === null) {
    return (
      <View style={styles.checkRow}>
        <Ionicons name="remove-circle-outline" size={16} color={Colors.textTertiary} />
        <Text style={[styles.checkLabel, { color: Colors.textTertiary }]}>{label}</Text>
        <Text style={styles.naText}>N/A</Text>
      </View>
    );
  }
  return (
    <View style={styles.checkRow}>
      <Ionicons
        name={value ? 'checkmark-circle' : 'close-circle'}
        size={16}
        color={value ? Colors.success : Colors.danger}
      />
      <Text style={styles.checkLabel}>{label}</Text>
    </View>
  );
}

export function MethodsSection({ methodsScore }: Props) {
  const badgeColor = getScoreColor(methodsScore.score);

  return (
    <SectionCard
      title="Methods & Statistics"
      icon="flask-outline"
      iconColor={Colors.accent}
      badge={`${methodsScore.score}/10`}
      badgeColor={badgeColor}
    >
      <View style={styles.topRow}>
        <ScoreCircle
          score={methodsScore.score}
          label="Methods"
          size="medium"
        />
        <View style={styles.checklistBlock}>
          <CheckRow label="Adequate sample size" value={methodsScore.sampleSizeAdequate} />
          <CheckRow label="Power calculation" value={methodsScore.hasPowerCalculation} />
          <CheckRow label="Blinding applied" value={methodsScore.hasBlinding} />
          <CheckRow label="Confounding addressed" value={methodsScore.confoundingAddressed} />
          <CheckRow label="Missing data handled" value={methodsScore.missingDataHandled} />
        </View>
      </View>

      {/* Sample size explanation */}
      <View style={styles.block}>
        <Text style={styles.blockTitle}>Sample Size</Text>
        <Text style={styles.body}>{methodsScore.sampleSizeExplanation}</Text>
      </View>

      {/* Statistical methods */}
      {methodsScore.statisticalMethodsUsed.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Statistical Methods Used</Text>
          <View style={styles.tagRow}>
            {methodsScore.statisticalMethodsUsed.map((method, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{method}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Reporting framework */}
      {methodsScore.reportingFramework && methodsScore.reportingFramework !== 'none' ? (
        <View style={styles.frameworkRow}>
          <Ionicons
            name={methodsScore.adheresToFramework ? 'checkmark-circle' : 'alert-circle'}
            size={14}
            color={methodsScore.adheresToFramework ? Colors.success : Colors.warning}
          />
          <Text style={styles.frameworkText}>
            {methodsScore.reportingFramework} reporting framework
            {methodsScore.adheresToFramework === true ? ' — adhered to' : ''}
            {methodsScore.adheresToFramework === false ? ' — not fully adhered to' : ''}
          </Text>
        </View>
      ) : null}

      {/* Issues */}
      {methodsScore.issues.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Issues Identified</Text>
          <BulletList items={methodsScore.issues} color={Colors.danger} icon="!" />
        </View>
      ) : null}

      {/* Strengths */}
      {methodsScore.strengths.length > 0 ? (
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Methodological Strengths</Text>
          <BulletList items={methodsScore.strengths} color={Colors.success} icon="✓" />
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
    marginBottom: 14,
    paddingTop: 8,
  },
  checklistBlock: {
    flex: 1,
    gap: 8,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkLabel: {
    fontSize: 13,
    color: Colors.textPrimary,
    flex: 1,
  },
  naText: {
    fontSize: 11,
    color: Colors.textTertiary,
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
  body: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: Colors.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '600',
  },
  frameworkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    backgroundColor: Colors.borderLight,
    padding: 10,
    borderRadius: 8,
  },
  frameworkText: {
    fontSize: 13,
    color: Colors.textPrimary,
    flex: 1,
  },
});
