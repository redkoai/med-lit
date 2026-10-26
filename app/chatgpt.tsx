import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { Colors as C } from '../src/constants/colors';
import { WorkspaceHeader } from '../src/components/WorkspaceHeader';
import { PageMeta } from '../src/components/PageMeta';
import { captureEvent } from '../src/services/productAnalytics';
import { fetchArticle } from '../src/services/articleFetcher';
import { hasValidIdentifier, parseArticleUrl } from '../src/services/urlParser';
import { createChatPacket, importChatResponse, MAX_HANDOFF_RESPONSE, type ChatPacket } from '../src/services/chatHandoff';
import { cacheCurrentAnalysis } from '../src/services/currentAnalysis';
import { useAuth } from '../src/hooks/useAuth';
import { useSettings } from '../src/hooks/useSettings';
import { useHistory } from '../src/hooks/useHistory';

export default function ChatHandoffScreen() {
  const params = useLocalSearchParams<{ url?: string }>();
  const [url, setUrl] = useState('');
  const [packet, setPacket] = useState<ChatPacket | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [response, setResponse] = useState('');
  const [copied, setCopied] = useState(false);
  const [showPacket, setShowPacket] = useState(false);
  const inFlight = useRef(false);
  const { user } = useAuth();
  const { settings } = useSettings(user?.uid);
  const { saveToHistory } = useHistory(user?.uid);
  useEffect(() => { if (typeof params.url === 'string') setUrl(params.url); }, [params.url]);
  const prepare = async () => {
    if (inFlight.current) return;
    setError('');
    const identifier = parseArticleUrl(url.trim());
    if (!hasValidIdentifier(identifier)) { setError('Add a PubMed link, DOI, or supported article URL first.'); return; }
    inFlight.current = true; setBusy(true); setPacket(null); setResponse(''); setCopied(false);
    try {
      setStatus('Retrieving the paper…');
      const article = await fetchArticle(identifier, { unpaywallEmail: settings.unpaywallEmail, onProgress: setStatus });
      setPacket(createChatPacket(article, identifier)); setStatus('Your source packet is ready.');
      void captureEvent('source_packet_prepared', {provider:'handoff'});
    } catch (err) { setError(err instanceof Error ? err.message : 'The paper could not be retrieved. Try a PubMed link or DOI.'); }
    finally { setBusy(false); inFlight.current = false; }
  };
  const copy = async () => {
    if (!packet) return;
    try { const ok = await Clipboard.setStringAsync(packet.prompt); if (!ok) throw new Error(); setCopied(true); setError(''); }
    catch { setShowPacket(true); setError('Clipboard access is unavailable. Select and copy the source packet below.'); }
  };
  const finish = async () => {
    if (!packet || inFlight.current) return;
    inFlight.current = true; setBusy(true); setError('');
    try {
      void captureEvent('appraisal_started', {provider:'handoff'});
      setStatus('Matching the response against the supplied source…');
      const analysis = importChatResponse(response, packet);
      const saved = settings.saveHistory ? await saveToHistory(analysis) : analysis;
      await cacheCurrentAnalysis(saved);
      void captureEvent('appraisal_completed', {provider:'handoff',coverage:analysis.appraisal.sourceCoverage.level});
      router.push({ pathname: '/analysis', params: { id: saved.id } });
    } catch (err) { void captureEvent('appraisal_failed', {provider:'handoff'}); setError(err instanceof Error ? err.message : 'The response could not be imported.'); }
    finally { setBusy(false); inFlight.current = false; }
  };
  return <ScrollView style={s.page} contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" role={'main' as never}>
    <PageMeta title="External chat review | MedLit" description="Prepare an evidence packet, use your own chat account, then bring the structured response back to MedLit." path="/chatgpt" noIndex />
    <WorkspaceHeader />
    <View style={s.content}>
      <View style={s.intro}><Ionicons name="chatbubble-ellipses-outline" size={30} color={C.accent} /><Text role="heading" aria-level={1} style={s.title}>Bring your own conversation.</Text><Text style={s.body}>Use ChatGPT, Claude or Gemini with no API key in MedLit. Prepare the paper and questions, paste them into your chosen chat, then bring the response back.</Text><Text style={s.note}>This is a manual transfer to a separate chat, not a login connection. MedLit cannot access your chats. Your chosen provider’s plan and limits apply.</Text></View>
      <View style={s.card}><View style={s.stepHeader}><Text style={s.step}>1</Text><Text style={s.heading}>Prepare your paper</Text></View><TextInput accessibilityLabel="Article for ChatGPT handoff" value={url} onChangeText={setUrl} editable={!busy && !packet} placeholder="PubMed link, DOI, or supported article URL" placeholderTextColor={C.textTertiary} autoCapitalize="none" autoCorrect={false} maxLength={2048} style={s.input} onSubmitEditing={prepare} />{!packet ? <Pressable accessibilityRole="button" onPress={prepare} disabled={busy} style={s.button}>{busy && <ActivityIndicator color="white" />}<Text style={s.buttonText}>{busy ? 'Retrieving source…' : 'Prepare source packet'}</Text></Pressable> : <><Text style={s.paperTitle}>{packet.article.title}</Text><Text style={s.note}>{packet.article.fetchSource === 'full_text' ? 'Full-text extract available' : packet.article.fetchSource === 'abstract_only' ? 'Abstract only — many appraisal questions may remain unclear' : 'Metadata only — not enough text for a substantive appraisal'} · {packet.prompt.length.toLocaleString()} characters in the packet</Text><Pressable accessibilityRole="button" disabled={busy} onPress={() => { setPacket(null); setResponse(''); setCopied(false); setStatus(''); }} style={s.link}><Text style={s.linkText}>Choose another paper</Text></Pressable></>}</View>
      {packet && <>
        <View style={s.card} dataSet={{ motion: 'finding' }}><View style={s.stepHeader}><Text style={s.step}>2</Text><Text style={s.heading}>Continue in your chat</Text></View><Text style={s.body}>Copy the packet, open a new conversation with your chosen provider, and paste it. Keep this MedLit tab open. The packet includes only the retrieved paper, appraisal instructions, and a matching ID.</Text><View style={s.actions}><Pressable accessibilityRole="button" onPress={copy} style={s.button}><Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color="white" /><Text style={s.buttonText}>{copied ? 'Packet copied' : 'Copy source packet'}</Text></Pressable><Pressable accessibilityRole="link" onPress={() => Linking.openURL('https://chatgpt.com/')} style={s.secondary}><Text style={s.linkText}>Open ChatGPT</Text><Ionicons name="open-outline" size={16} color={C.accent} /></Pressable><Pressable accessibilityRole="link" onPress={()=>Linking.openURL('https://claude.ai/')} style={s.secondary}><Text style={s.linkText}>Open Claude</Text></Pressable><Pressable accessibilityRole="link" onPress={()=>Linking.openURL('https://gemini.google.com/')} style={s.secondary}><Text style={s.linkText}>Open Gemini</Text></Pressable></View><Text style={s.note}>When you paste, you share the article text with that provider under your account’s settings. Review it first if needed. Long packets may exceed your chat limits.</Text><Pressable accessibilityRole="button" onPress={() => setShowPacket(v => !v)} style={s.link}><Text style={s.linkText}>{showPacket ? 'Hide source packet' : 'Review or manually copy the packet'}</Text></Pressable>{showPacket && <TextInput accessibilityLabel="Source packet preview" value={packet.prompt} multiline editable={false} style={[s.input, s.preview]} />}</View>
        <View style={s.card}><View style={s.stepHeader}><Text style={s.step}>3</Text><Text style={s.heading}>Bring the appraisal back</Text></View><Text style={s.body}>Paste the chat’s complete JSON response. MedLit matches quoted passages to this source and marks unsupported judgments as unclear.</Text><TextInput accessibilityLabel="ChatGPT JSON response" value={response} onChangeText={setResponse} multiline maxLength={MAX_HANDOFF_RESPONSE + 1} editable={!busy} placeholder="Paste the complete JSON response here…" placeholderTextColor={C.textTertiary} style={[s.input, s.response]} /><Pressable accessibilityRole="button" onPress={finish} disabled={busy || !response.trim()} style={[s.button, (busy || !response.trim()) && { opacity: 0.5 }]}><Text style={s.buttonText}>Verify passages and open appraisal</Text></Pressable><Text style={s.note}>Text matching is not scientific validation. Imported appraisals are labeled as external-chat responses with an unverified model.</Text></View>
      </>}
      {busy && <Text accessibilityLiveRegion="polite" style={s.note}>{status}</Text>}
      {error ? <Text accessibilityRole="alert" style={s.error}>{error}</Text> : null}
    </View>
  </ScrollView>;
}
const s = StyleSheet.create({ page: { flex: 1, backgroundColor: C.background }, scroll: { paddingBottom: 60 }, content: { maxWidth: 780, width: '100%', padding: 24, alignSelf: 'center', gap: 22 }, intro: { gap: 15, marginBottom: 8 }, title: { fontSize: 40, lineHeight: 48, color: C.primary, fontFamily: 'Georgia', letterSpacing: -1 }, body: { fontSize: 15, lineHeight: 24, color: C.textSecondary }, note: { fontSize: 12, lineHeight: 20, color: C.textSecondary }, card: { backgroundColor: C.surface, padding: 24, borderRadius: 18, borderWidth: 1, borderColor: '#D3E1E2', gap: 16 }, stepHeader: { flexDirection: 'row', gap: 12, alignItems: 'center' }, step: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.accentLight, color: C.accent, textAlign: 'center', lineHeight: 32, fontWeight: '700' }, heading: { fontSize: 19, fontWeight: '700', color: C.primary, flexShrink: 1 }, input: { borderWidth: 1, borderColor: '#BDCFD1', borderRadius: 10, minHeight: 52, padding: 14, fontSize: 15, color: C.textPrimary }, button: { minHeight: 52, backgroundColor: C.accent, borderRadius: 10, padding: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 10 }, buttonText: { fontSize: 14, fontWeight: '700', color: 'white', textAlign: 'center' }, link: { minHeight: 44, justifyContent: 'center' }, linkText: { color: C.accent, fontWeight: '600', fontSize: 13 }, paperTitle: { fontSize: 18, lineHeight: 26, color: C.primary, fontFamily: 'Georgia' }, actions: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' }, secondary: { minHeight: 52, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: C.border, borderRadius: 10 }, response: { minHeight: 180, textAlignVertical: 'top', fontSize: 13 }, preview: { height: 240, fontSize: 12, textAlignVertical: 'top' }, error: { padding: 16, backgroundColor: C.dangerLight, color: C.danger, borderRadius: 12, fontSize: 14, lineHeight: 22 } });
