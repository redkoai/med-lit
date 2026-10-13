import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/colors';
import type { PicoExtraction } from '../types';
import { SectionCard } from './SectionCard';

interface Props {
  pico?: PicoExtraction;
}

export function PicoSection({ pico }: Props) {
  if (!pico) return null;
  const rows = [
    ['Population', pico.population],
    ['Intervention / exposure', pico.intervention],
    ['Comparator', pico.comparator],
    ['Outcomes', pico.outcomes],
    ['Timeframe', pico.timeframe],
  ] as const;
  return (
    <SectionCard title="PICO extraction" icon="list-outline" iconColor={Colors.accent} badge="Evidence linked" badgeColor={Colors.accent} defaultExpanded>
      <Text style={styles.intro}>Structured from the supplied article text. “Not reported” means MedLit did not verify enough source evidence; it is not proof the paper omitted the item.</Text>
      {rows.map(([label, element]) => (
        <View key={label} style={styles.row}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{label}</Text>
            <Text style={[styles.status, element.status === 'identified' ? styles.identified : styles.missing]}>{element.status.replace(/_/g, ' ')}</Text>
          </View>
          <Text style={styles.value}>{element.value}</Text>
          <Text style={styles.evidence}>{element.evidenceIds.length ? `${element.evidenceIds.length} verified passage${element.evidenceIds.length === 1 ? '' : 's'}` : 'No verified passage linked'}</Text>
        </View>
      ))}
    </SectionCard>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 12, lineHeight: 18, color: Colors.textSecondary, marginVertical: 8 },
  row: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight, gap: 5 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { flex: 1, color: Colors.textPrimary, fontSize: 13, fontWeight: '800' },
  status: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  identified: { color: Colors.success },
  missing: { color: Colors.textSecondary },
  value: { color: Colors.textPrimary, fontSize: 13, lineHeight: 19 },
  evidence: { color: Colors.textTertiary, fontSize: 10, fontWeight: '600' },
});
