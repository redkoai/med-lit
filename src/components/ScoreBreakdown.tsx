import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface ScoreBreakdownProps {
  title: string;
  score: number;
  criteria: Array<{
    name: string;
    passed: boolean;
    description: string;
    evidence?: string;
  }>;
}

export function ScoreBreakdown({ title, score, criteria }: ScoreBreakdownProps) {
  const [expanded, setExpanded] = useState(false);

  const passedCount = criteria.filter((c) => c.passed).length;
  const totalCount = criteria.length;
  const percentage = Math.round((passedCount / totalCount) * 100);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <Ionicons
            name={expanded ? 'chevron-down' : 'chevron-forward'}
            size={18}
            color={Colors.textSecondary}
          />
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.scoreText}>{score}/10</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {passedCount}/{totalCount} criteria
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${percentage}%`, backgroundColor: getScoreColor(score) },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{percentage}% met</Text>
          </View>

          {criteria.map((criterion, index) => (
            <View key={index} style={styles.criterion}>
              <View style={styles.criterionHeader}>
                <Ionicons
                  name={criterion.passed ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={criterion.passed ? Colors.success : Colors.danger}
                />
                <Text style={styles.criterionName}>{criterion.name}</Text>
              </View>
              <Text style={styles.criterionDesc}>{criterion.description}</Text>
              {criterion.evidence && (
                <View style={styles.evidenceBox}>
                  <Text style={styles.evidenceLabel}>Evidence:</Text>
                  <Text style={styles.evidenceText}>{criterion.evidence}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function getScoreColor(score: number): string {
  if (score >= 9) return Colors.scoreExcellent;
  if (score >= 7) return Colors.scoreGood;
  if (score >= 5) return Colors.scoreFair;
  return Colors.scorePoor;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.primary,
  },
  badge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  content: {
    padding: 16,
    paddingTop: 0,
    gap: 16,
  },
  progressBarContainer: {
    gap: 6,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'right',
  },
  criterion: {
    gap: 6,
  },
  criterionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  criterionName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  criterionDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginLeft: 28,
  },
  evidenceBox: {
    marginLeft: 28,
    marginTop: 4,
    padding: 10,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  evidenceLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  evidenceText: {
    fontSize: 12,
    color: Colors.textPrimary,
    lineHeight: 17,
    fontStyle: 'italic',
  },
});
