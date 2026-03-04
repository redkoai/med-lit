import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getScoreColor, Colors } from '../constants/colors';

interface Props {
  score: number; // 1–10
  label: string;
  subtitle?: string;
  size?: 'small' | 'medium' | 'large';
  inverted?: boolean; // for bias: higher = better
}

const SIZES = {
  small: { circle: 64, font: 18, label: 10 },
  medium: { circle: 84, font: 24, label: 11 },
  large: { circle: 104, font: 30, label: 12 },
};

export function ScoreCircle({ score, label, subtitle, size = 'medium', inverted = false }: Props) {
  const dim = SIZES[size];
  const color = getScoreColor(score);
  const borderWidth = dim.circle * 0.06;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.circle,
          {
            width: dim.circle,
            height: dim.circle,
            borderRadius: dim.circle / 2,
            borderWidth,
            borderColor: color,
          },
        ]}
      >
        <Text style={[styles.scoreText, { fontSize: dim.font, color }]}>
          {score.toFixed(1)}
        </Text>
        <Text style={[styles.tenText, { color: Colors.textTertiary }]}>/10</Text>
      </View>
      <Text style={[styles.label, { fontSize: dim.label }]}>{label}</Text>
      {subtitle ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    gap: 6,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  scoreText: {
    fontWeight: '700',
    lineHeight: undefined,
  },
  tenText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: -2,
  },
  label: {
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
