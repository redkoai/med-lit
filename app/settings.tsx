import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../src/constants/colors';
import { useAuth } from '../src/hooks/useAuth';
import { useSettings } from '../src/hooks/useSettings';
import { SettingRow } from '../src/components/SettingRow';
import { SectionHeader } from '../src/components/SectionHeader';
import type { AppSettings, AIProvider, ClaudeModel, OpenAIModel, GeminiModel } from '../src/types';

const PROVIDERS: { id: AIProvider; label: string; icon: string }[] = [
  { id: 'claude',  label: 'Claude',   icon: 'sparkles' },
  { id: 'openai',  label: 'ChatGPT',  icon: 'chatbubble-ellipses' },
  { id: 'gemini',  label: 'Gemini',   icon: 'planet' },
];

const PROVIDER_META: Record<AIProvider, {
  keyLabel: string;
  keyPlaceholder: string;
  keyUrl: string;
  keyUrlLabel: string;
  models: { id: string; label: string }[];
}> = {
  claude: {
    keyLabel: 'Anthropic API Key',
    keyPlaceholder: 'sk-ant-...',
    keyUrl: 'https://console.anthropic.com/',
    keyUrlLabel: 'console.anthropic.com',
    models: [
      { id: 'claude-sonnet-4-6', label: 'Claude Sonnet (faster)' },
      { id: 'claude-opus-4-6',   label: 'Claude Opus (thorough)' },
    ],
  },
  openai: {
    keyLabel: 'OpenAI API Key',
    keyPlaceholder: 'sk-...',
    keyUrl: 'https://platform.openai.com/api-keys',
    keyUrlLabel: 'platform.openai.com',
    models: [
      { id: 'gpt-4o',       label: 'GPT-4o (recommended)' },
      { id: 'gpt-4o-mini',  label: 'GPT-4o Mini (faster)' },
      { id: 'gpt-4-turbo',  label: 'GPT-4 Turbo' },
    ],
  },
  gemini: {
    keyLabel: 'Google AI API Key',
    keyPlaceholder: 'AIza...',
    keyUrl: 'https://aistudio.google.com/app/apikey',
    keyUrlLabel: 'aistudio.google.com',
    models: [
      { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash (fast)' },
      { id: 'gemini-1.5-pro',   label: 'Gemini 1.5 Pro (thorough)' },
    ],
  },
};

export default function SettingsScreen() {
  const { user } = useAuth();
  const { settings, saveSettings, clearSettings } = useSettings(user?.uid ?? null);

  const [claudeKey,   setClaudeKey]   = useState(settings.claudeApiKey);
  const [openAiKey,   setOpenAiKey]   = useState(settings.openAiApiKey);
  const [geminiKey,   setGeminiKey]   = useState(settings.geminiApiKey);
  const [showKey,     setShowKey]     = useState(false);
  const [unpaywallEmail, setUnpaywallEmail] = useState(settings.unpaywallEmail);
  const [sciHubMirror,   setSciHubMirror]   = useState(settings.sciHubMirror);
  const [saving, setSaving] = useState(false);

  const provider = settings.aiProvider ?? 'claude';
  const meta = PROVIDER_META[provider];

  const activeKey    = provider === 'openai' ? openAiKey  : provider === 'gemini' ? geminiKey  : claudeKey;
  const setActiveKey = provider === 'openai' ? setOpenAiKey : provider === 'gemini' ? setGeminiKey : setClaudeKey;

  const handleSave = async () => {
    setSaving(true);
    await saveSettings({
      claudeApiKey:  claudeKey.trim(),
      openAiApiKey:  openAiKey.trim(),
      geminiApiKey:  geminiKey.trim(),
      unpaywallEmail: unpaywallEmail.trim(),
      sciHubMirror:   sciHubMirror.trim(),
    });
    setSaving(false);
    Alert.alert('Saved', 'Settings saved successfully.');
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'This will permanently delete all past analyses.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => clearSettings(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* AI Provider */}
        <SectionHeader title="AI Provider" />

        {/* Provider picker */}
        <View style={styles.providerRow}>
          {PROVIDERS.map((p) => {
            const active = provider === p.id;
            return (
              <TouchableOpacity
                key={p.id}
                style={[styles.providerBtn, active && styles.providerBtnActive]}
                onPress={() => saveSettings({ aiProvider: p.id })}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={p.icon as 'sparkles'}
                  size={16}
                  color={active ? '#fff' : Colors.textSecondary}
                />
                <Text style={[styles.providerBtnText, active && styles.providerBtnTextActive]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Key + model for the active provider */}
        <View style={styles.card}>
          {/* Security notice */}
          <View style={styles.securityBanner}>
            <Ionicons name="lock-closed" size={13} color={Colors.success} />
            <Text style={styles.securityText}>
              Your API key is stored only on this device and sent directly to {
                provider === 'openai' ? 'OpenAI' : provider === 'gemini' ? 'Google' : 'Anthropic'
              }. MedLit never sees or stores it.
            </Text>
          </View>

          <View style={styles.divider} />

          <SettingRow
            label={meta.keyLabel}
            subtitle={`Get yours at ${meta.keyUrlLabel}`}
          >
            <View style={styles.apiKeyRow}>
              <TextInput
                style={styles.apiKeyInput}
                value={activeKey}
                onChangeText={setActiveKey}
                placeholder={meta.keyPlaceholder}
                placeholderTextColor={Colors.textTertiary}
                secureTextEntry={!showKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowKey((v) => !v)} style={styles.eyeBtn}>
                <Ionicons
                  name={showKey ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </SettingRow>

          <TouchableOpacity
            style={styles.getKeyLink}
            onPress={() => Linking.openURL(meta.keyUrl)}
            activeOpacity={0.7}
          >
            <Ionicons name="open-outline" size={13} color={Colors.accent} />
            <Text style={styles.getKeyLinkText}>Get API key at {meta.keyUrlLabel}</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <SettingRow label="Model" subtitle="Select the model to use for analysis">
            <View style={styles.modelToggle}>
              {meta.models.map((m) => {
                const currentModel =
                  provider === 'openai' ? settings.openAiModel :
                  provider === 'gemini' ? settings.geminiModel :
                  settings.claudeModel;
                const isActive = currentModel === m.id;
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.modelOption, isActive && styles.modelOptionActive]}
                    onPress={() => {
                      if (provider === 'openai') saveSettings({ openAiModel: m.id as OpenAIModel });
                      else if (provider === 'gemini') saveSettings({ geminiModel: m.id as GeminiModel });
                      else saveSettings({ claudeModel: m.id as ClaudeModel });
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.modelOptionText, isActive && styles.modelOptionTextActive]}>
                      {m.label.split(' ')[0]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </SettingRow>
        </View>

        {/* Article Fetching */}
        <SectionHeader title="Article Fetching" />
        <View style={styles.card}>
          <SettingRow label="Unpaywall Email" subtitle="Required by their API. Any email works.">
            <TextInput
              style={styles.textInput}
              value={unpaywallEmail}
              onChangeText={setUnpaywallEmail}
              placeholder="you@example.com"
              placeholderTextColor={Colors.textTertiary}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </SettingRow>
        </View>

        {/* Sci-Hub */}
        <SectionHeader title="Sci-Hub (Optional)" />
        <View style={[styles.card, styles.cardWarning]}>
          <View style={styles.warningBanner}>
            <Ionicons name="warning-outline" size={16} color={Colors.warning} />
            <Text style={styles.warningText}>
              Sci-Hub access may be illegal in your jurisdiction. Use at your own discretion.
              MedLit accepts no liability for Sci-Hub usage.
            </Text>
          </View>

          <View style={styles.divider} />

          <SettingRow label="Enable Sci-Hub" subtitle="Use as last-resort source for full text">
            <Switch
              value={settings.sciHubEnabled}
              onValueChange={(v) => saveSettings({ sciHubEnabled: v })}
              trackColor={{ false: Colors.border, true: Colors.accent }}
            />
          </SettingRow>

          {settings.sciHubEnabled ? (
            <>
              <View style={styles.divider} />
              <SettingRow label="Mirror URL" subtitle="e.g. sci-hub.se, sci-hub.st">
                <TextInput
                  style={styles.textInput}
                  value={sciHubMirror}
                  onChangeText={setSciHubMirror}
                  placeholder="sci-hub.se"
                  placeholderTextColor={Colors.textTertiary}
                  autoCapitalize="none"
                />
              </SettingRow>
            </>
          ) : null}
        </View>

        {/* App Settings */}
        <SectionHeader title="App" />
        <View style={styles.card}>
          <SettingRow label="Save History" subtitle="Store past analyses on this device">
            <Switch
              value={settings.saveHistory}
              onValueChange={(v) => saveSettings({ saveHistory: v })}
              trackColor={{ false: Colors.border, true: Colors.accent }}
            />
          </SettingRow>
        </View>

        {/* Methodology note */}
        <TouchableOpacity
          style={styles.methodologyNote}
          onPress={() => router.push('/methodology')}
          activeOpacity={0.7}
        >
          <View style={styles.methodologyIcon}>
            <Ionicons name="document-text-outline" size={18} color={Colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.methodologyTitle}>How MedLit Works</Text>
            <Text style={styles.methodologyText}>
              Learn about scoring frameworks, bias detection, and AI analysis methods
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
        </TouchableOpacity>

        {/* Danger zone */}
        <SectionHeader title="Danger Zone" />
        <TouchableOpacity style={styles.dangerBtn} onPress={handleClearHistory} activeOpacity={0.7}>
          <Ionicons name="trash-outline" size={16} color={Colors.danger} />
          <Text style={styles.dangerBtnText}>Clear all history</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/')}>
          <Ionicons name="home-outline" size={22} color={Colors.textSecondary} />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/history')}>
          <Ionicons name="time-outline" size={22} color={Colors.textSecondary} />
          <Text style={styles.navLabel}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => {}}>
          <Ionicons name="settings" size={22} color={Colors.accent} />
          <Text style={[styles.navLabel, { color: Colors.accent }]}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push(user ? '/profile' : '/auth')}>
          <Ionicons name={user ? 'person' : 'person-outline'} size={22} color={user ? Colors.science : Colors.textSecondary} />
          <Text style={[styles.navLabel, user ? { color: Colors.science } : {}]}>{user ? 'Profile' : 'Sign in'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 0 },

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardWarning: {
    borderColor: Colors.warning,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 14,
  },

  apiKeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingLeft: 10,
    paddingRight: 4,
    width: 180,
  },
  apiKeyInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    paddingVertical: 8,
  },
  eyeBtn: {
    padding: 6,
  },

  textInput: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 13,
    color: Colors.textPrimary,
    width: 160,
  },

  modelToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: Colors.background,
  },
  modelOption: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modelOptionActive: {
    backgroundColor: Colors.accent,
  },
  modelOptionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modelOptionTextActive: {
    color: '#fff',
  },

  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    backgroundColor: Colors.warningLight,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: Colors.warning,
    lineHeight: 17,
    fontWeight: '500',
  },

  methodologyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  methodologyIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodologyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  methodologyText: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 17,
  },

  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    backgroundColor: Colors.dangerLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  dangerBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.danger,
  },

  providerRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  providerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  providerBtnActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  providerBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  providerBtnTextActive: {
    color: '#fff',
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
    padding: 12,
    backgroundColor: '#F0FDF4',
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: Colors.success,
    lineHeight: 17,
    fontWeight: '500',
  },
  getKeyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  getKeyLinkText: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: '600',
  },

  navbar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 2 : 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    gap: 3,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
