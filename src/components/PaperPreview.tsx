import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors as C } from '../constants/colors';
import { createExampleAppraisal } from '../services/exampleAppraisal';

const DOMAINS = ['rct.randomization', 'rct.missing', 'rct.selection'];
export function PaperPreview() {
  const example = useMemo(createExampleAppraisal, []);
  const [selected, setSelected] = useState('rct.missing');
  const judgment = example.appraisal.judgments.find(j => j.id === selected)!;
  const quote = example.appraisal.evidence.find(e => judgment.evidenceIds.includes(e.id) && e.verified);
  return <View style={s.stage}>
    <View style={s.top}><Text style={s.caption}>INSIDE AN APPRAISAL</Text><View style={s.tag}><Text style={s.tagText}>Key-free example</Text></View></View>
    <View style={s.paper} dataSet={{ motion: 'paper' }}>
      <View style={s.titleRow}><Ionicons name="document-text-outline" size={23} color={C.accent} /><View style={{ flex: 1 }}><Text style={s.title}>A reading app & concentration</Text><Text style={s.meta}>Fictional study · 120 adults · 4 weeks</Text></View></View>
      <Text style={s.instruction}>Choose a domain to inspect its evidence.</Text>
      <View style={s.domains}>{example.appraisal.judgments.filter(j => DOMAINS.includes(j.id)).map(j => {
        const color = j.judgment === 'low' ? C.success : j.judgment === 'unclear' ? C.textSecondary : C.warning;
        return <Pressable key={j.id} accessibilityRole="button" accessibilityLabel={'Inspect ' + j.domain} accessibilityState={{ selected: selected === j.id }} onPress={() => setSelected(j.id)} style={[s.domain, selected === j.id && s.active]} dataSet={{ motion: 'evidence' }}><View style={[s.dot, { backgroundColor: color }]} /><Text style={s.domainTitle}>{j.domain}</Text><Text style={[s.domainState, { color }]}>{j.judgment === 'low' ? 'Low concern' : j.judgment === 'unclear' ? 'Unclear' : 'Review'}</Text><Ionicons name="chevron-forward" size={13} color={C.textSecondary} /></Pressable>;
      })}</View>
      <View key={selected} style={s.finding} dataSet={{ motion: 'finding' }} accessibilityLiveRegion="polite">
        <View style={s.sourceLabel}><Ionicons name={quote ? 'link-outline' : 'alert-circle-outline'} size={15} color={C.accent} /><Text style={s.findingLabel}>{quote ? 'PASSAGE MATCHED IN EXAMPLE' : 'NO MATCHED SUPPORTING PASSAGE'}</Text></View>
        <Text style={s.quote}>{quote ? '“' + quote.quote + '”' : 'The claimed preregistration passage is not in the source. The judgment stays unclear.'}</Text>
        <Text style={s.limit}>{selected === 'rct.missing' ? '24 missing outcomes = 20% of the sample. Why they are missing matters as much as how many.' : selected === 'rct.randomization' ? 'A matching passage supports review. It does not prove the reported methods were carried out.' : 'This deliberately unsupported claim demonstrates the real validator—not a real scientific finding.'}</Text>
      </View>
      <Pressable accessibilityRole="link" accessibilityLabel="Explore the full example" onPress={() => router.push('/example' as never)} style={s.open} dataSet={{ motion: 'press' }}><Text style={s.openText}>Explore the full example</Text><Ionicons name="arrow-forward" size={17} color={C.accent} /></Pressable>
    </View>
    <Text style={s.footnote}>Hand-authored teaching material. No account, key, or payment required.</Text>
  </View>;
}
const s = StyleSheet.create({
  stage: { minWidth: 0 }, top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, paddingBottom: 14 }, caption: { fontSize: 10, fontWeight: '700', letterSpacing: 1.1, color: C.textSecondary }, tag: { borderWidth: 1, borderColor: '#CED7FA', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 4, backgroundColor: C.accentLight }, tagText: { fontSize: 10, color: C.accent, fontWeight: '500' },
  paper: { backgroundColor: C.surface, borderRadius: 12, borderWidth: 1, borderColor: '#DDE2EE', overflow: 'hidden' }, titleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 20 }, title: { fontSize: 16, fontWeight: '600', color: C.primary, lineHeight: 23 }, meta: { fontSize: 11, color: C.textSecondary, lineHeight: 19 }, instruction: { fontSize: 11, color: C.textSecondary, paddingHorizontal: 20, paddingBottom: 13 }, domains: { paddingHorizontal: 10, gap: 2 }, domain: { minHeight: 46, padding: 10, flexDirection: 'row', gap: 8, alignItems: 'center', borderRadius: 6, borderWidth: 1, borderColor: 'transparent' }, active: { backgroundColor: C.accentLight, borderColor: '#DDE3FE' }, dot: { width: 6, height: 6, borderRadius: 3 }, domainTitle: { fontSize: 12, color: C.primary, flex: 1, lineHeight: 18 }, domainState: { fontSize: 10, fontWeight: '600' },
  finding: { marginTop: 14, marginHorizontal: 20, paddingTop: 17, paddingBottom: 15, borderTopWidth: 1, borderColor: C.border, gap: 10, minHeight: 188 }, sourceLabel: { flexDirection: 'row', gap: 6, alignItems: 'center' }, findingLabel: { color: C.accent, fontSize: 9, fontWeight: '700', letterSpacing: 0.5, flexShrink: 1 }, quote: { fontFamily: 'Georgia', fontSize: 15, color: C.primary, lineHeight: 24 }, limit: { fontSize: 11, lineHeight: 19, color: C.textSecondary }, open: { minHeight: 53, paddingHorizontal: 20, borderTopWidth: 1, borderColor: C.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: C.surfaceElevated }, openText: { fontSize: 12, fontWeight: '600', color: C.accent }, footnote: { color: C.textSecondary, fontSize: 10, lineHeight: 17, marginTop: 11, paddingHorizontal: 1 },
});
