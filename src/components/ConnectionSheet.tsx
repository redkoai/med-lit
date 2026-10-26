import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Linking, Modal, Platform, ScrollView, Text, TextInput, View, StyleSheet } from 'react-native';
import { MotionPress as Pressable, MotionReveal } from './WorkspaceMotion';
import { WorkspaceIcon as Ionicons } from './WorkspaceIcon';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors as C } from '../constants/colors';
import { MODEL_KEYS, PROVIDERS } from '../constants/providers';
import { captureEvent } from '../services/productAnalytics';
import { checkProviderConnection, testProviderConnection, type ProviderModel } from '../services/providerConnection';
import { providerFailureReason } from '../services/providerTransport';
import { prepareOpenRouterLogin } from '../services/openRouterAuth';
import type { AIProvider, AppSettings } from '../types';

export function ConnectionSheet({ article = '', visible, settings, saveSettings, onClose, onConnected, onHandoff }: {
  article?: string; visible: boolean; settings: AppSettings; saveSettings: (value: Partial<AppSettings>) => Promise<void>;
  onClose: () => void; onConnected?: () => void; onHandoff?: () => void;
}) {
  const [provider, setProvider] = useState<AIProvider>(settings.aiProvider);
  const [key, setKey] = useState(''); const [model, setModel] = useState('');
  const [models, setModels] = useState<ProviderModel[]>([]);
  const [revealed, setRevealed] = useState(false); const [busy, setBusy] = useState(false);
  const [operation, setOperation] = useState<'models' | 'connect' | 'redirect'>('connect');
  const [error, setError] = useState(''); const [notice, setNotice] = useState('');
  useEffect(() => { if (visible) { setProvider(settings.aiProvider); setModel(settings[MODEL_KEYS[settings.aiProvider]]); setKey(''); setError(''); setNotice(''); setModels([]); setRevealed(false); } else { setKey(''); setRevealed(false); } }, [visible]);
  const meta = PROVIDERS[provider];
  const choose = (id: AIProvider) => { setProvider(id); setModel(settings[MODEL_KEYS[id]]); setKey(''); setModels([]); setError(''); setNotice(''); setRevealed(false); };
  const loadModels = async () => {
    if (busy) return; setOperation('models'); setBusy(true); setError(''); setNotice('');
    try { const result = await checkProviderConnection(provider, key.trim()); setModels(result.models); setNotice(result.warning ?? 'Model list loaded. Choose a text model below or enter its exact ID.'); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not load models.'); }
    finally { setBusy(false); }
  };
  const connect = async () => {
    if (busy) return; setOperation('connect'); setBusy(true); setError('');
    void captureEvent('ai_connection_started', { provider });
    try {
      await testProviderConnection(provider, key.trim(), model);
      await saveSettings({ aiProvider: provider, [meta.settingsKey]: key.trim(), [MODEL_KEYS[provider]]: model.trim().replace(/^models\//, '') });
      void captureEvent('ai_connected', { provider }); setKey(''); setRevealed(false); onClose(); onConnected?.();
    } catch (e) { void captureEvent('ai_connection_failed', { provider, reason: providerFailureReason(e) }); setError(e instanceof Error ? e.message : 'Connection failed. Please try again.'); }
    finally { setBusy(false); }
  };
  const accountLogin = async () => {
    if (busy || Platform.OS !== 'web') return;
    setOperation('redirect'); setBusy(true); setError('');
    try {
      const url = await prepareOpenRouterLogin(window.location.origin, window.sessionStorage, article);
      window.location.assign(url);
    } catch { setError('The connection could not start. Allow session storage or paste an OpenRouter key below.'); setBusy(false); }
  };
  return <Modal visible={visible} transparent animationType="none" onRequestClose={() => { if (!busy) onClose(); }}>
    <SafeAreaView style={s.scrim} edges={['top','bottom']}><KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.center} keyboardShouldPersistTaps="handled"><MotionReveal style={s.sheet} accessibilityViewIsModal role="dialog" aria-label="Connect your AI" dataSet={{ motion: 'sheet' }}>
        <View style={s.row}><View style={s.mark}><Ionicons name="key-outline" size={25} color={C.accent}/></View><Pressable accessibilityRole="button" accessibilityLabel="Close connection setup" disabled={busy} onPress={onClose} style={s.icon}><Ionicons name="close" size={24} color={C.textPrimary}/></Pressable></View>
        <Text style={s.title}>Choose your AI provider</Text>
        <Text style={s.body}>Choose a provider, paste your API key, then test the connection. You pay your provider directly. A MedLit account is optional for library sync.</Text>
        <View style={s.providers}>{(Object.keys(PROVIDERS) as AIProvider[]).map(id => <Pressable key={id} accessibilityRole="button" accessibilityState={{selected:provider===id}} disabled={busy} onPress={()=>choose(id)} style={[s.provider,id===provider&&s.selected]}><Text style={s.providerText}>{PROVIDERS[id].name}</Text></Pressable>)}</View>
        {provider === 'openrouter' && Platform.OS === 'web' && <><Pressable accessibilityRole="button" disabled={busy} onPress={accountLogin} style={s.connect}><Text style={s.connectText}>Connect an OpenRouter account</Text></Pressable><Text style={s.note}>Authorize on OpenRouter without copying a key. You choose your spending limit there. Connecting does not start an appraisal.</Text></>}
        <Text style={s.label}>{meta.company} API key</Text>
        <View style={s.inputRow}><TextInput accessibilityLabel={`${meta.company} API key`} value={key} onChangeText={value=>{setKey(value);setModels([]);setNotice('');setError('');}} style={s.input} secureTextEntry={!revealed} autoCapitalize="none" autoCorrect={false} autoComplete="off" textContentType="none" maxLength={4096} placeholder={meta.placeholder} placeholderTextColor={C.textTertiary} editable={!busy}/><Pressable accessibilityRole="button" accessibilityLabel={revealed?'Hide key':'Show key'} onPress={()=>setRevealed(v=>!v)} style={s.icon}><Ionicons name={revealed?'eye-off-outline':'eye-outline'} size={20} color={C.textSecondary}/></Pressable></View>
        <Pressable accessibilityRole="link" onPress={()=>Linking.openURL(meta.keyUrl)} style={s.link}><Text style={s.linkText}>Get an API key from {meta.company}</Text></Pressable>
        <Pressable accessibilityRole="button" disabled={busy||!key.trim()} onPress={loadModels} style={s.alternative}><Text style={s.alternativeText}>Load available models</Text></Pressable>
        {notice?<Text accessibilityLiveRegion="polite" style={s.note}>{notice}</Text>:null}
        <Text style={s.label}>Model ID</Text><TextInput accessibilityLabel="Model ID" value={model} onChangeText={setModel} style={[s.input,s.inputRow]} autoCapitalize="none" autoCorrect={false} editable={!busy} maxLength={200}/>
        <Text style={s.note}>Choose a text-generation model. Restricted keys can be tested directly without loading a model list.</Text>
        {models.length>0&&<ScrollView style={{maxHeight:180}} nestedScrollEnabled>{models.map(item=><Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`Select ${item.id}`} disabled={busy} onPress={()=>setModel(item.id)} style={[s.link,model===item.id&&s.selected]}><Text style={s.linkText}>{item.id}</Text></Pressable>)}</ScrollView>}
        {error?<Text accessibilityRole="alert" style={s.error}>{error}</Text>:null}
        <Pressable accessibilityRole="button" accessibilityLabel="Test and connect" disabled={busy||!key.trim()||!model.trim()} onPress={connect} style={[s.connect,(busy||!key.trim()||!model.trim())&&{opacity:.55}]}>{busy?<ActivityIndicator color="#fff"/>:<Ionicons name="lock-closed-outline" size={18} color="#fff"/>}<Text style={s.connectText}>{busy ? operation === 'models' ? 'Loading models…' : operation === 'redirect' ? 'Opening OpenRouter…' : 'Testing connection…' : 'Test and connect'}</Text></Pressable>
        <Text style={s.note}>Testing sends a short connection prompt, with no paper, and may incur a small provider charge. Appraisals also use your provider balance. {Platform.OS==='web'?'Your key stays in page memory until refresh or disconnect.':'Your key is saved in this device’s secure storage.'} It never goes to MedLit’s servers or analytics.</Text>
        {provider !== 'openrouter' && <Text style={s.note}>{provider === 'openai' ? 'ChatGPT sign-in and plan usage are not available in MedLit yet. Use an OpenAI Platform API key with API billing enabled.' : provider === 'claude' ? 'Use a Claude Console API key. A Claude or Claude Code subscription does not connect to MedLit.' : 'Use a Gemini API key from Google AI Studio. Your project’s API quota and billing apply.'}</Text>}
        <Text style={s.note}>Use a provider API key, not an account password, cloud service-account file, or Claude Code token. Azure and Vertex AI credentials use different APIs and are not supported here.</Text>
        {onHandoff&&<Pressable accessibilityRole="button" disabled={busy} onPress={()=>{onClose();onHandoff();}} style={s.alternative}><Text style={s.alternativeText}>Review in an external chat instead</Text></Pressable>}
      </MotionReveal></ScrollView>
    </KeyboardAvoidingView></SafeAreaView>
  </Modal>;
}
const s = StyleSheet.create({
  scrim: { flex: 1, backgroundColor: 'rgba(15,35,40,0.5)' }, center: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  sheet: { width: '100%', maxWidth: 570, borderRadius: 24, backgroundColor: C.surface, padding: 26, gap: 14 }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, mark: { width: 52, height: 52, borderRadius: 18, backgroundColor: C.accentLight, alignItems: 'center', justifyContent: 'center' }, icon: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: Platform.OS === "web" ? "IBM Plex Sans" : undefined, fontSize: 31, fontWeight: '700', color: C.primary, letterSpacing: -1 }, body: { color: C.textSecondary, fontFamily: Platform.OS === "web" ? "IBM Plex Sans" : undefined, fontSize: 15, lineHeight: 23 }, providers: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 5 }, provider: { flex: 1, minWidth: 85, borderWidth: 1, borderColor: C.border, borderRadius: 12, minHeight: 48, alignItems: 'center', justifyContent: 'center' }, selected: { borderColor: C.accent, backgroundColor: C.accentLight }, providerText: { color: C.textSecondary, fontWeight: '700' }, label: { fontWeight: '700', fontFamily: Platform.OS === "web" ? "IBM Plex Sans" : undefined, fontSize: 14, color: C.textPrimary }, inputRow: { borderColor: C.border, borderWidth: 1, borderRadius: 12, flexDirection: 'row', alignItems: 'center' }, input: { flex: 1, minWidth: 0, minHeight: 52, padding: 14, color: C.textPrimary, fontFamily: Platform.OS === "web" ? "IBM Plex Sans" : undefined, fontSize: 16 }, link: { minHeight: 44, flexDirection: 'row', gap: 7, alignItems: 'center' }, linkText: { color: C.accent, fontWeight: '600' }, note: { color: C.textSecondary, fontFamily: Platform.OS === "web" ? "IBM Plex Sans" : undefined, fontSize: 12, lineHeight: 19 }, error: { color: C.danger, backgroundColor: C.dangerLight, padding: 12, borderRadius: 10, fontFamily: Platform.OS === "web" ? "IBM Plex Sans" : undefined, fontSize: 14, lineHeight: 21 }, connect: { backgroundColor: C.accent, borderRadius: 13, minHeight: 52, flexDirection: 'row', gap: 9, alignItems: 'center', justifyContent: 'center' }, connectText: { color: '#fff', fontWeight: '700', fontFamily: Platform.OS === "web" ? "IBM Plex Sans" : undefined, fontSize: 15 }, alternative: { borderTopWidth: 1, borderColor: C.border, minHeight: 52, paddingTop: 12, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center' }, alternativeText: { color: C.textPrimary, fontWeight: '600', flexShrink: 1 },
});
