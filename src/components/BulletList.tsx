import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface Props {
  items: string[];
  color?: string;
  icon?: string;
  style?: object;
}

export function BulletList({ items, color = Colors.accent, icon = '•', style }: Props) {
  if (!items?.length) return null;
  return (
    <View style={[styles.container, style]}>
      {items.map((item, i) => (
        <View key={i} style={styles.row}>
          <Text style={[styles.bullet, { color }]}>{icon}</Text>
          <Text style={styles.text}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  bullet: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 1,
    width: 12,
  },
  text: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
    flex: 1,
  },
});
