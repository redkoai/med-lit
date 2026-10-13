import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors as C } from '../src/constants/colors';
import { AnalysisResult } from '../src/components/AnalysisResult';
import { PageMeta } from '../src/components/PageMeta';
import { WorkspaceHeader } from '../src/components/WorkspaceHeader';
import { createExampleAppraisal } from '../src/services/exampleAppraisal';

export default function ExampleScreen() {
  const analysis = useMemo(createExampleAppraisal, []);
  return <SafeAreaView style={s.screen} edges={['bottom']}>
    <PageMeta title="MedLit — Explore a fictional appraisal" description="Try the evidence review workspace with a clearly labeled, hand-authored example. No account or API key required." path="/example" />
    <WorkspaceHeader active="example" />
    <View style={s.notice}><Text style={s.label}>FICTIONAL EXAMPLE · NO KEY NEEDED</Text><Text style={s.body}>Hand-authored teaching material, not real research or an AI-generated result. Uses MedLit’s real quotation checks. Nothing is added to your library.</Text></View>
    <AnalysisResult analysis={analysis} />
  </SafeAreaView>;
}
const s = StyleSheet.create({ screen: { flex: 1, backgroundColor: C.background }, notice: { paddingHorizontal: 22, paddingVertical: 14, backgroundColor: C.accentLight, gap: 6 }, label: { fontSize: 11, fontWeight: '700', letterSpacing: 0.6, color: C.accent }, body: { fontSize: 12, lineHeight: 19, color: C.primary } });
