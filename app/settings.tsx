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
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../src/constants/colors';
import { useSettings } from '../src/hooks/useSettings';
import type { AppSettings } from '../src/types';

function SettingRow({ label, subtitle, children }: { label: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingLabelBlock}>
        <Text style={styles.settingLabel}>{label}</Text>
        {subtitle ? <Text style={styles.settingSubtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.settingControl}>{children}</View>
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title.toUpperCase()}</Text>;
}

export default function SettingsScreen() {
  const { settings, saveSettings, clearSettings } = useSettings();
  const [apiKey, setApiKey] = useState(settings.claudeApiKey);
  const [showApiKey, setShowApiKey] = useState(false);
  const [unpaywallEmail, setUnpaywallEmail] = useState(settings.unpaywallEmail);
  const [sciHubMirror, setSciHubMirror] = useState(settings.sciHubMirror);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await saveSettings({
      claudeApiKey: apiKey.trim(),
      unpaywallEmail: unpaywallEmail.trim(),
      sciHubMirror: sciHubMirror.trim(),
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
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn} disabled={saving}>
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Claude AI */}
        <SectionHeader title="Claude AI" />
        <View style={styles.card}>
          <SettingRow label="API Key" subtitle="Get yours at console.anthropic.com">
            <View style={styles.apiKeyRow}>
              <TextInput
                style={styles.apiKeyInput}
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="sk-ant-..."
                placeholderTextColor={Colors.textTertiary}
                secureTextEntry={!showApiKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowApiKey((v) => !v)}>
                <Ionicons
                  name={showApiKey ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </SettingRow>

          <View style={styles.divider} />

          <SettingRow label="Model" subtitle="Opus is more thorough; Sonnet is faster">
            <View style={styles.modelToggle}>
              {(['claude-sonnet-4-6', 'claude-opus-4-6'] as AppSettings['claudeModel'][]).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[
                    styles.modelOption,
                    settings.claudeModel === m && styles.modelOptionActive,
                  ]}
                  onPress={() => saveSettings({ claudeModel: m })}
                >
                  <Text
                    style={[
                      styles.modelOptionText,
                      settings.claudeModel === m && styles.modelOptionTextActive,
                    ]}
                  >
                    {m.includes('sonnet') ? 'Sonnet' : 'Opus'}
                  </Text>
                </TouchableOpacity>
              ))}
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
        <View style={styles.methodologyNote}>
          <Ionicons name="document-text-outline" size={16} color={Colors.textSecondary} />
          <Text style={styles.methodologyText}>
            Analysis uses Cochrane RoB 2, STROBE, CONSORT, PRISMA 2020, and Oxford CEBM
            frameworks. See METHODOLOGY.md for full details.
          </Text>
        </View>

        {/* Danger zone */}
        <SectionHeader title="Danger Zone" />
        <TouchableOpacity style={styles.dangerBtn} onPress={handleClearHistory}>
          <Ionicons name="trash-outline" size={16} color={Colors.danger} />
          <Text style={styles.dangerBtnText}>Clear all history</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  closeBtn: { padding: 6 },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 0 },

  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  cardWarning: {
    borderColor: Colors.warning,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginHorizontal: 14,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  settingLabelBlock: {
    flex: 1,
    gap: 2,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  settingSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  settingControl: {
    alignItems: 'flex-end',
  },

  apiKeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    gap: 8,
    width: 180,
  },
  apiKeyInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    paddingVertical: 8,
  },

  textInput: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.textPrimary,
    width: 160,
  },

  modelToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  modelOption: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: Colors.background,
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
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 20,
    padding: 14,
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  methodologyText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
  },

  dangerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    backgroundColor: Colors.dangerLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  dangerBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.danger,
  },
});
