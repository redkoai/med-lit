import { productLoop } from '../services/firstPartyAnalytics';
import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { analyticsAllowed, analyticsConfigured, setAnalyticsConsent } from '../services/productAnalytics';
import { guide as s } from './GuidePage';
export function AnalyticsPreferences() {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => { setEnabled(analyticsAllowed()); return productLoop.subscribe(() => setEnabled(analyticsAllowed())); }, []);
  const configured = analyticsConfigured();
  return <View style={s.card}><Text style={s.heading}>Help improve the reading experience</Text><Text style={s.body}>{configured ? 'Optional usage analytics are off unless you choose to allow them.' : 'The separate PostHog collector is not enabled on this deployment.'} We do not record your screen, keystrokes, papers, notes, API keys, or email. Server operational logs are separate.</Text>{configured && <><Text style={s.body}>With your permission, PostHog receives a random browser identifier and events such as appraisal completed or tutorial opened. Its network infrastructure receives ordinary connection information. Do Not Track and Global Privacy Control override this choice.</Text><Pressable accessibilityRole="switch" aria-checked={enabled} accessibilityState={{ checked: enabled }} onPress={() => { try { setAnalyticsConsent(!enabled); setEnabled(analyticsAllowed()); setMessage('Preference saved.'); } catch { setMessage('Your browser could not save this preference. Analytics remain off.'); } }} style={s.button}><Text style={s.buttonText}>{enabled ? 'Turn usage analytics off' : 'Allow basic usage analytics'}</Text></Pressable></>}{message ? <Text accessibilityLiveRegion="polite" style={s.body}>{message}</Text> : null}</View>;
}
