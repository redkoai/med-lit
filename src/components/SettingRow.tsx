import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

export interface SettingRowProps {
  label: string;
  subtitle?: string;
  children: React.ReactNode;
}

/** Single responsibility: settings form row layout (label + control). */
export function SettingRow({ label, subtitle, children }: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingLabelBlock}>
        <Text style={styles.settingLabel}>{label}</Text>
        {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.settingControl}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  settingLabelBlock: {
    flex: 1,
    gap: 3,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  settingSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },
  settingControl: {
    alignItems: 'flex-end',
  },
});
