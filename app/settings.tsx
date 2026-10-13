import { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors as C } from '../src/constants/colors';
import { PROVIDERS, providerKey, MODEL_KEYS } from '../src/constants/providers';
import { useAuth } from '../src/hooks/useAuth';
import { useSettings } from '../src/hooks/useSettings';
import { useHistory } from '../src/hooks/useHistory';
import { ConnectionSheet } from '../src/components/ConnectionSheet';
import { WorkspaceHeader } from '../src/components/WorkspaceHeader';
import { FirstPartyAnalyticsPreferences } from '../src/components/FirstPartyAnalytics';
import { AnalyticsPreferences } from '../src/components/AnalyticsPreferences';
import { PageMeta } from '../src/components/PageMeta';
import type { AppSettings } from '../src/types';

const MODELS = {
  openrouter: [{ id: 'openai/gpt-4.1-mini', label: 'GPT-4.1 Mini via OpenRouter' }, { id: 'openai/gpt-4.1', label: 'GPT-4.1 via OpenRouter' }],
  claude: [{ id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' }, { id: 'claude-opus-4-6', label: 'Claude Opus 4.6' }],
  openai: [{ id: 'gpt-4.1', label: 'GPT-4.1' }, { id: 'gpt-4.1-mini', label: 'GPT-4.1 Mini' }],
  gemini: [{ id: 'gemini-3.7-flash', label: 'Gemini 3.7 Flash' }, { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash Lite' }],
};
export default function SettingsScreen() {
  const { user } = useAuth();
  const { settings, saveSettings, loaded } = useSettings(user?.uid);
  const { clearHistory } = useHistory(user?.uid);
  const [sheet, setSheet] = useState(false);
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [advanced, setAdvanced] = useState(false);
  const [customModel, setCustomModel] = useState('');
  useEffect(() => { setCustomModel(settings[MODEL_KEYS[settings.aiProvider]]); }, [settings]);
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (loaded) setEmail(settings.unpaywallEmail); }, [loaded, settings.unpaywallEmail]);
  const connected = Boolean(providerKey(settings));
  const provider = settings.aiProvider;
  const save = async (changes: Partial<AppSettings>, message = 'Preferences saved.') => {
    setError(''); setNotice('');
    try { await saveSettings(changes); setNotice(message); } catch { setError('Preferences could not be saved. Check available device storage and try again.'); }
  };
  const disconnect = () => save({ claudeApiKey: '', openAiApiKey: '', geminiApiKey: '', openRouterApiKey: '' }, 'All AI providers disconnected. Saved appraisals are still in your library.');
  const remove = async () => {
    setBusy(true); setError(''); setNotice('');
    try { await clearHistory(); setNotice('Your saved library has been deleted.'); }
    catch { setError('Deletion could not be confirmed. Please reconnect and try again.'); }
    finally { setBusy(false); }
  };
  const confirmDelete = () => {
    if (Platform.OS === 'web') { if (window.confirm('Delete your saved MedLit library? Export a backup first if you want to keep it. This cannot be undone.')) void remove(); }
    else Alert.alert('Delete library?', 'Export a backup first. This cannot be undone.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete library', style: 'destructive', onPress: remove }]);
  };
  const modelKey = MODEL_KEYS[provider];
  return <>
    <PageMeta title="Your workspace settings — MedLit" description="Manage personal AI access, local storage, and reading preferences." path="/settings" noIndex />
    <ScrollView style={s.page} contentContainerStyle={{ paddingBottom: 60 }} keyboardShouldPersistTaps="handled" role={'main' as never}>
      <WorkspaceHeader active="settings" />
      <View style={s.content}><Text role="heading" aria-level={1} style={s.title}>Make yourself at home.</Text><Text style={s.body}>Your AI access and reading preferences, in one place.</Text>
        <View style={s.card}><View style={s.row}><View style={s.icon}><Ionicons name="key-outline" size={22} color={C.accent} /></View><View style={{ flex: 1 }}><Text style={s.heading}>{connected ? PROVIDERS[provider].name + ' connected' : 'Connect your own AI'}</Text><Text style={s.note}>{connected ? 'Uses your provider account and its limits.' : 'No company AI credits or paid MedLit plan required.'}</Text></View></View>
          <Text style={s.body}>{Platform.OS === 'web' ? 'Your key stays in this page’s memory. Refreshing or closing the page clears it; moving between screens does not.' : 'Your key stays in encrypted storage on this device.'} It is sent directly to your provider, never to MedLit’s servers.</Text>
          <Pressable accessibilityRole="button" onPress={() => setSheet(true)} style={s.button} dataSet={{ motion: 'press' }}><Text style={s.buttonText}>{connected ? 'Change or reconnect provider' : 'Connect AI provider'}</Text></Pressable>
          {connected && <Pressable accessibilityRole="button" onPress={disconnect} style={s.link}><Text style={s.linkText}>Disconnect all providers</Text></Pressable>}
          <Pressable accessibilityRole="link" onPress={() => router.push('/chatgpt' as never)} style={s.link}><Text style={s.linkText}>Use your ChatGPT account with a source packet</Text></Pressable>
        </View>
        <View style={s.card}><View style={s.row}><View style={{ flex: 1 }}><Text style={s.heading}>Save appraisals</Text><Text style={s.note}>Keep completed appraisals in your device’s library.</Text></View><Switch accessibilityLabel="Save appraisals" value={settings.saveHistory} onValueChange={value => save({ saveHistory: value })} trackColor={{ true: C.accent, false: C.border }} /></View><Text style={s.note}>Local storage is specific to this browser and device. Export a backup from your library to keep a separate copy.</Text><Pressable accessibilityRole="link" onPress={() => router.push('/history')} style={s.link}><Text style={s.linkText}>Open library and backups</Text></Pressable></View>
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: advanced }} onPress={() => setAdvanced(v => !v)} style={s.advanced}><Text style={s.heading}>Advanced preferences</Text><Ionicons name={advanced ? 'chevron-up' : 'chevron-down'} size={18} color={C.textSecondary} /></Pressable>
        {advanced && <View style={s.card}><Text style={s.heading}>Appraisal model</Text><Text style={s.note}>Choose a model available to your provider account. Provider pricing applies.</Text>{MODELS[provider].map(m => <Pressable accessibilityRole="button" accessibilityState={{ selected: settings[modelKey] === m.id }} key={m.id} onPress={() => save({ [modelKey]: m.id } as Partial<AppSettings>)} style={[s.model, settings[modelKey] === m.id && { borderColor: C.accent, backgroundColor: C.accentLight }]}><Text style={s.body}>{m.label}</Text>{settings[modelKey] === m.id && <Ionicons name="checkmark" size={19} color={C.accent} />}</Pressable>)}<Text style={s.heading}>Another model</Text><TextInput accessibilityLabel="Custom model ID" value={customModel} onChangeText={setCustomModel} autoCapitalize="none" autoCorrect={false} style={s.input}/><Pressable accessibilityRole="button" disabled={!customModel.trim()} onPress={()=>save({[modelKey]:customModel.trim()} as Partial<AppSettings>)} style={s.button}><Text style={s.buttonText}>Save model</Text></Pressable><Text style={s.heading}>Unpaywall contact email</Text><Text style={s.note}>Optional. Unpaywall requires a contact email to find legal open-access copies.</Text><TextInput accessibilityLabel="Unpaywall contact email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="you@example.com" placeholderTextColor={C.textTertiary} style={s.input} /><Pressable accessibilityRole="button" onPress={() => save({ unpaywallEmail: email.trim() })} style={s.button}><Text style={s.buttonText}>Save contact email</Text></Pressable></View>}
        <FirstPartyAnalyticsPreferences />
        <AnalyticsPreferences />
        <View style={s.card}><Text style={s.heading}>Your data</Text><Text style={s.note}>Deleting the library removes saved appraisals from this device and, if connected, your account. Export anything you want to keep first.</Text><Pressable accessibilityRole="button" disabled={busy} onPress={confirmDelete} style={s.link}><Text style={{ color: C.danger, fontWeight: '600' }}>{busy ? 'Deleting…' : 'Delete saved library'}</Text></Pressable><Pressable accessibilityRole="link" onPress={() => router.push('/privacy' as never)} style={s.link}><Text style={s.linkText}>Read the privacy policy</Text></Pressable></View>
        {notice ? <Text accessibilityLiveRegion="polite" style={s.notice}>{notice}</Text> : null}{error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
      </View>
    </ScrollView>
    <ConnectionSheet visible={sheet} settings={settings} saveSettings={saveSettings} onClose={() => setSheet(false)} onConnected={() => setNotice('Your provider is connected. You can appraise a paper now.')} onHandoff={() => router.push('/chatgpt' as never)} />
  </>;
}
const s = StyleSheet.create({ page: { flex: 1, backgroundColor: C.background }, content: { maxWidth: 740, alignSelf: 'center', width: '100%', padding: 24, gap: 20 }, title: { color: C.primary, fontFamily: 'Georgia', fontSize: 38, lineHeight: 46, letterSpacing: -1 }, body: { color: C.textSecondary, fontSize: 15, lineHeight: 24 }, note: { color: C.textSecondary, fontSize: 12, lineHeight: 20, marginTop: 3 }, card: { backgroundColor: C.surface, padding: 24, borderRadius: 18, borderWidth: 1, borderColor: '#D3E1E2', gap: 16 }, row: { flexDirection: 'row', alignItems: 'center', gap: 12 }, icon: { backgroundColor: C.accentLight, width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }, heading: { fontSize: 18, color: C.primary, fontWeight: '600' }, button: { minHeight: 52, borderRadius: 10, backgroundColor: C.accent, justifyContent: 'center', alignItems: 'center', padding: 12 }, buttonText: { fontSize: 14, fontWeight: '700', color: 'white' }, link: { minHeight: 44, justifyContent: 'center' }, linkText: { color: C.accent, fontWeight: '600', fontSize: 13 }, advanced: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }, model: { minHeight: 50, borderWidth: 1, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row' }, input: { minHeight: 50, borderWidth: 1, borderColor: C.border, borderRadius: 10, padding: 12, color: C.primary, fontSize: 15 }, notice: { backgroundColor: C.accentLight, color: C.accent, padding: 16, borderRadius: 12, lineHeight: 21 }, error: { backgroundColor: C.dangerLight, color: C.danger, padding: 16, borderRadius: 12, lineHeight: 21 } });
