import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { GuidePage, guide as s } from '../src/components/GuidePage';
import { captureEvent } from '../src/services/productAnalytics';
import { finishOpenRouterLogin } from '../src/services/openRouterAuth';
import { useSettings } from '../src/hooks/useSettings';
import { useAuth } from '../src/hooks/useAuth';

export default function ConnectScreen() {
  const { user } = useAuth();
  const { loaded, saveSettings } = useSettings(user?.uid);
  const started = useRef(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!loaded || started.current || typeof window === 'undefined') return;
    started.current = true;
    const callback = window.location.href;
    window.history.replaceState(null, '', '/connect');
    void (async () => {
      const result = await finishOpenRouterLogin(callback, window.location.origin, window.sessionStorage);
      await saveSettings({ aiProvider: 'openrouter', openRouterApiKey: result.key });
      void captureEvent('ai_connected', { provider: 'openrouter' });
      // Connecting never starts a billed generation automatically.
      router.replace({ pathname: '/', params: { url: result.article, connected: 'openrouter' } });
    })().catch(err => setError(err instanceof Error ? err.message : 'Please start a new connection.'));
  }, [loaded, saveSettings]);
  return <GuidePage title={error ? 'Let’s reconnect.' : 'Finishing your connection.'} description="Your AI account stays yours. MedLit does not receive or store your provider key on its servers." path="/connect">
    <View style={s.card}>{error ? <Text accessibilityRole="alert" style={s.body}>{error}</Text> : <><ActivityIndicator /><Text accessibilityLiveRegion="polite" style={s.body}>Verifying this one-time connection with OpenRouter…</Text></>}
    <Pressable accessibilityRole="link" onPress={() => router.replace('/')} style={s.link}><Text style={s.linkText}>Return to MedLit</Text></Pressable></View>
  </GuidePage>;
}
