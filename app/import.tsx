import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../src/constants/colors';
import { PageMeta } from '../src/components/PageMeta';
import { useAuth } from '../src/hooks/useAuth';
import { useHistory } from '../src/hooks/useHistory';
import { useSettings } from '../src/hooks/useSettings';
import { activeApiKey, runAnalysisPipeline } from '../src/services/analysisPipeline';
import { parseImportText } from '../src/services/importParser';
import { ConnectionSheet } from '../src/components/ConnectionSheet';

type ItemStatus = 'queued' | 'running' | 'saved' | 'failed';

export default function ImportScreen() {
  const { user } = useAuth();
  const { settings, saveSettings } = useSettings(user?.uid ?? null);
  const { saveToHistory } = useHistory(user?.uid ?? null);
  const [input, setInput] = useState('');
  const [statuses, setStatuses] = useState<Record<string, ItemStatus>>({});
  const [messages, setMessages] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [notice, setNotice] = useState('');
  const inFlight = useRef(false);
  const parsed = useMemo(() => parseImportText(input), [input]);
  const batch = parsed.slice(0, 10);

  const runBatch = async () => {
    if (inFlight.current) return;
    if (!batch.length) {
      setNotice('Paste article URLs, DOI or PMID lists, RIS, or BibTeX exported from Zotero.');
      return;
    }
    if (!activeApiKey(settings)) {
      setSheet(true);
      return;
    }
    setRunning(true);
    inFlight.current = true;
    setNotice('');
    let saved = 0;
    for (const item of batch) {
      setStatuses((current) => ({ ...current, [item.id]: 'running' }));
      try {
        const analysis = await runAnalysisPipeline(item.url, settings, (message) => {
          setMessages((current) => ({ ...current, [item.id]: message }));
        });
        await saveToHistory(analysis);
        saved += 1;
        setStatuses((current) => ({ ...current, [item.id]: 'saved' }));
        setMessages((current) => ({ ...current, [item.id]: 'Saved to your library.' }));
      } catch (error) {
        setStatuses((current) => ({ ...current, [item.id]: 'failed' }));
        setMessages((current) => ({
          ...current,
          [item.id]: error instanceof Error ? error.message : 'Appraisal failed.',
        }));
      }
    }
    setRunning(false);
    inFlight.current = false;
    setNotice(`${saved} of ${batch.length} appraisals saved. Open your library to read them.`);
  };

  return (
    <>
      <PageMeta title="Batch import — MedLit" description="Import DOI, PMID, RIS, or BibTeX records into a private appraisal queue." path="/import" noIndex />
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.header}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" onPress={() => router.back()} style={styles.headerButton}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Batch import</Text>
          <View style={styles.headerButton} />
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Import a research list</Text>
          <Text style={styles.body}>
            Paste DOI or PMID lists, URLs, RIS, or BibTeX—including exports from Zotero. MedLit processes at most 10 papers per run so provider cost and failures remain bounded.
          </Text>
          <TextInput
            accessibilityLabel="Research identifiers or citation export"
            value={input}
            onChangeText={(value) => { setInput(value); setStatuses({}); setMessages({}); }}
            placeholder={'10.1056/NEJMoa2300057\nPMID: 26551272\nOr paste RIS/BibTeX'}
            placeholderTextColor={Colors.textTertiary}
            multiline
            maxLength={200000}
            editable={!running}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />
          <View style={styles.summaryRow}>
            <Text style={styles.summary}>{parsed.length} unique record{parsed.length === 1 ? '' : 's'} found</Text>
            {parsed.length > 10 ? <Text style={styles.warning}>First 10 will run</Text> : null}
          </View>
          {batch.map((item) => {
            const status = statuses[item.id] ?? 'queued';
            const color = status === 'saved' ? Colors.success : status === 'failed' ? Colors.danger : status === 'running' ? Colors.accent : Colors.textSecondary;
            return (
              <View key={item.id} style={styles.item}>
                <Ionicons name={status === 'saved' ? 'checkmark-circle' : status === 'failed' ? 'alert-circle' : status === 'running' ? 'hourglass-outline' : 'document-text-outline'} size={19} color={color} />
                <View style={styles.itemText}>
                  <Text style={styles.itemLabel} numberOfLines={2}>{item.label}</Text>
                  <Text style={[styles.itemStatus, { color }]}>{messages[item.id] ?? status}</Text>
                </View>
              </View>
            );
          })}
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Start batch appraisal" disabled={running || !batch.length} onPress={runBatch} style={[styles.runButton, (running || !batch.length) && styles.disabled]}>
            <Ionicons name={running ? 'hourglass-outline' : 'play'} size={18} color="#fff" />
            <Text style={styles.runButtonText}>{running ? 'Processing batch…' : batch.length ? `Appraise ${batch.length} paper${batch.length === 1 ? '' : 's'}` : 'Appraise papers'}</Text>
          </TouchableOpacity>
          <Text style={styles.costNote}>Each paper sends one request to your selected AI provider and may incur provider charges. Failed papers do not stop the remaining queue.</Text>
          {notice ? <Text accessibilityLiveRegion="polite" style={styles.body}>{notice}</Text> : null}
          <TouchableOpacity accessibilityRole="link" onPress={() => router.push('/history')} style={styles.headerButton}><Text style={{ color: Colors.accent }}>Open library</Text></TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
      <ConnectionSheet visible={sheet} settings={settings} saveSettings={saveSettings} onClose={() => setSheet(false)} onHandoff={() => router.push('/chatgpt' as never)} />
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary, padding: 12 },
  headerButton: { width: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, color: '#fff', fontSize: 17, fontWeight: '700', textAlign: 'center' },
  content: { width: '100%', maxWidth: 760, alignSelf: 'center', padding: 20, gap: 12 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.textPrimary },
  body: { fontSize: 14, lineHeight: 21, color: Colors.textSecondary },
  input: { minHeight: 180, padding: 14, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 14, backgroundColor: Colors.surface, color: Colors.textPrimary, fontSize: 14, lineHeight: 20, textAlignVertical: 'top' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  summary: { color: Colors.textSecondary, fontWeight: '600' },
  warning: { color: Colors.warning, fontWeight: '700' },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, backgroundColor: Colors.surface },
  itemText: { flex: 1, gap: 3 },
  itemLabel: { color: Colors.textPrimary, fontSize: 13, fontWeight: '700' },
  itemStatus: { fontSize: 11, lineHeight: 16 },
  runButton: { minHeight: 48, borderRadius: 13, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 4 },
  disabled: { opacity: 0.45 },
  runButtonText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  costNote: { color: Colors.textSecondary, fontSize: 11, lineHeight: 17 },
});
