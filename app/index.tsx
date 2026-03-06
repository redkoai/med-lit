import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Share,
  Modal,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../src/constants/colors';
import { useAuth } from '../src/hooks/useAuth';
import { useSettings } from '../src/hooks/useSettings';
import type { AIProvider } from '../src/types';
import { useHistory } from '../src/hooks/useHistory';
import { useAnalyzeArticle } from '../src/hooks/useAnalyzeArticle';
import { LoadingState } from '../src/components/LoadingState';
import { homeScreenStyles as styles } from '../src/styles/homeScreenStyles';

const EXAMPLE_URLS = [
  'https://pubmed.ncbi.nlm.nih.gov/38514723/',
  'https://doi.org/10.1038/s41586-023-06374-2',
  'https://www.nejm.org/doi/full/10.1056/NEJMoa2300057',
];

const PROVIDER_INFO: Record<AIProvider, { label: string; placeholder: string; hint: string; settingsKey: 'claudeApiKey' | 'openAiApiKey' | 'geminiApiKey' }> = {
  claude: { label: 'Claude (Anthropic)', placeholder: 'sk-ant-...', hint: 'Get yours at console.anthropic.com', settingsKey: 'claudeApiKey' },
  openai: { label: 'ChatGPT (OpenAI)', placeholder: 'sk-...', hint: 'Get yours at platform.openai.com/api-keys', settingsKey: 'openAiApiKey' },
  gemini: { label: 'Gemini (Google)', placeholder: 'AIza...', hint: 'Get yours at aistudio.google.com/app/apikey', settingsKey: 'geminiApiKey' },
};

function getActiveApiKey(settings: { aiProvider: AIProvider; claudeApiKey: string; openAiApiKey: string; geminiApiKey: string }): string {
  return settings[PROVIDER_INFO[settings.aiProvider].settingsKey];
}

const FEATURE_PILLS = [
  { icon: 'analytics-outline', label: 'Accuracy Score' },
  { icon: 'eye-outline', label: 'Bias Detection' },
  { icon: 'flask-outline', label: 'Methods Review' },
  { icon: 'library-outline', label: 'Reference Check' },
  { icon: 'ribbon-outline', label: 'COI Flagging' },
  { icon: 'reader-outline', label: 'Plain Summary' },
];

export default function HomeScreen() {
  const params = useLocalSearchParams<{ url?: string }>();
  const { user } = useAuth();
  const uid = user?.uid ?? null;
  const { settings, saveSettings } = useSettings(uid);
  const { history, saveToHistory } = useHistory(uid);
  const [url, setUrl] = useState('');
  const [apiKeyModalVisible, setApiKeyModalVisible] = useState(false);

  useEffect(() => {
    if (params.url) setUrl(params.url);
  }, [params.url]);
  const [tempApiKey, setTempApiKey] = useState('');
  const [showTempKey, setShowTempKey] = useState(false);

  const onApiKeyMissing = useCallback(() => {
    setTempApiKey('');
    setShowTempKey(false);
    setApiKeyModalVisible(true);
  }, []);

  const { handleAnalyze, fetchState, isLoading } = useAnalyzeArticle({
    url,
    settings,
    saveToHistory,
    onApiKeyMissing,
  });

  const handleSaveApiKey = useCallback(async () => {
    const key = tempApiKey.trim();
    if (!key) {
      Alert.alert('No Key', `Please enter your ${PROVIDER_INFO[settings.aiProvider].label} API key.`);
      return;
    }
    const { settingsKey } = PROVIDER_INFO[settings.aiProvider];
    await saveSettings({ [settingsKey]: key });
    setApiKeyModalVisible(false);
    // Auto-trigger analysis after saving key
    setTimeout(() => handleAnalyze(), 300);
  }, [tempApiKey, saveSettings, handleAnalyze, settings.aiProvider]);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <LinearGradient colors={[Colors.primary, Colors.primaryLight]} style={styles.hero}>
            <View style={styles.logoRow}>
              <View style={styles.logoIcon}>
                <Ionicons name="flask" size={28} color="#fff" />
              </View>
              <View>
                <Text style={styles.logoTitle}>MedLit</Text>
                <Text style={styles.logoSubtitle}>Scientific Literature Analyzer</Text>
              </View>
            </View>
            <Text style={styles.heroTagline}>
              Paste any PubMed, Nature, NEJM, Lancet, bioRxiv, or DOI link.{'\n'}
              Get accuracy scores, bias detection, and plain-English summaries.
            </Text>
          </LinearGradient>

          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Article URL or DOI</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={url}
                onChangeText={setUrl}
                placeholder="https://pubmed.ncbi.nlm.nih.gov/..."
                placeholderTextColor={Colors.textTertiary}
                autoCapitalize="none"
                autoCorrect={false}
                multiline={false}
                returnKeyType="go"
                onSubmitEditing={handleAnalyze}
                editable={!isLoading}
              />
              {url.length > 0 ? (
                <TouchableOpacity onPress={() => setUrl('')} style={styles.clearBtn}>
                  <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity
              style={[styles.analyzeBtn, isLoading && styles.analyzeBtnDisabled]}
              onPress={handleAnalyze}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={isLoading ? [Colors.textTertiary, Colors.textTertiary] : [Colors.accent, Colors.science]}
                style={styles.analyzeBtnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons
                  name={isLoading ? 'hourglass-outline' : 'sparkles'}
                  size={18}
                  color="#fff"
                />
                <Text style={styles.analyzeBtnText}>
                  {isLoading ? 'Analyzing...' : 'Analyze Article'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {isLoading ? <LoadingState state={fetchState} /> : null}

            {fetchState.status === 'error' ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={Colors.danger} />
                <Text style={styles.errorText}>{fetchState.error}</Text>
              </View>
            ) : null}
          </View>

          {!getActiveApiKey(settings) && !isLoading ? (
            <TouchableOpacity
              style={styles.apiKeyPrompt}
              onPress={() => { setTempApiKey(''); setShowTempKey(false); setApiKeyModalVisible(true); }}
            >
              <View style={styles.apiKeyPromptIcon}>
                <Ionicons name="key" size={18} color={Colors.warning} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.apiKeyPromptTitle}>API Key Needed</Text>
                <Text style={styles.apiKeyPromptText}>
                  Tap here to add your {PROVIDER_INFO[settings.aiProvider].label} API key and start analyzing
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.warning} />
            </TouchableOpacity>
          ) : null}

          {!isLoading ? (
            <View style={styles.examplesCard}>
              <Text style={styles.examplesTitle}>Try an example</Text>
              {EXAMPLE_URLS.map((exUrl, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.exampleRow}
                  onPress={() => setUrl(exUrl)}
                >
                  <Ionicons name="link-outline" size={14} color={Colors.accent} />
                  <Text style={styles.exampleUrl} numberOfLines={1}>{exUrl}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {!isLoading ? (
            <View style={styles.features}>
              {FEATURE_PILLS.map((f) => (
                <View key={f.label} style={styles.featurePill}>
                  <Ionicons name={f.icon as keyof typeof Ionicons.glyphMap} size={13} color={Colors.science} />
                  <Text style={styles.featureLabel}>{f.label}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {history.length > 0 && !isLoading ? (
            <View style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>Recent Analyses</Text>
                <TouchableOpacity onPress={() => router.push('/history')}>
                  <Text style={styles.historyViewAll}>View all →</Text>
                </TouchableOpacity>
              </View>
              {history.slice(0, 3).map((entry) => (
                <TouchableOpacity
                  key={entry.id}
                  style={styles.historyItem}
                  onPress={() => setUrl(entry.url)}
                  activeOpacity={0.7}
                >
                  <View style={styles.historyItemLeft}>
                    <Text style={styles.historyItemTitle} numberOfLines={2}>
                      {entry.title}
                    </Text>
                    <Text style={styles.historyItemMeta}>
                      {entry.journal} · {entry.year}
                    </Text>
                  </View>
                  <View style={styles.historyItemScores}>
                    <Text style={[styles.historyScore, { color: Colors.accent }]}>
                      {entry.accuracyScore}/10
                    </Text>
                    <Text style={styles.historyScoreLabel}>accuracy</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          {!isLoading ? (
            <View style={styles.seoBlock}>
              <Text style={styles.seoTitle}>Free medical & scientific paper analyzer</Text>
              <Text style={styles.seoText}>
                MedLit is a critical appraisal tool for research papers. Paste a PubMed, DOI, Nature, NEJM, Lancet, or bioRxiv link and get an accuracy score (1–10), bias detection (Cochrane RoB 2, STROBE), methods review, conflict-of-interest flagging, and a plain-language summary. Built for evidence-based medicine (CEBM, PRISMA, CONSORT). No account required—add your API key in Settings to start.
              </Text>
              <View style={styles.seoActions}>
                <TouchableOpacity style={styles.seoLinkBtn} onPress={() => router.push('/methodology')}>
                  <Ionicons name="book-outline" size={16} color={Colors.accent} />
                  <Text style={styles.seoLinkText}>How it works</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.seoLinkBtn} onPress={() => router.push('/faq')}>
                  <Ionicons name="help-circle-outline" size={16} color={Colors.accent} />
                  <Text style={styles.seoLinkText}>FAQ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.shareMedlitBtn}
                  onPress={async () => {
                    const shareUrl = Linking.createURL('/');
                    await Share.share({
                      message: `Check out MedLit — free tool to analyze medical & scientific papers. Get accuracy scores, bias detection, and plain-English summaries. ${shareUrl}`,
                      title: 'MedLit — Scientific Literature Analyzer',
                    });
                  }}
                >
                  <Ionicons name="share-outline" size={16} color={Colors.science} />
                  <Text style={styles.shareMedlitText}>Share MedLit</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

        </ScrollView>

        {/* API Key Modal */}
        <Modal
          visible={apiKeyModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setApiKeyModalVisible(false)}
        >
          <Pressable style={modalStyles.overlay} onPress={() => setApiKeyModalVisible(false)}>
            <Pressable style={modalStyles.sheet} onPress={(e) => e.stopPropagation()}>
              <View style={modalStyles.handle} />
              <View style={modalStyles.header}>
                <View style={modalStyles.iconCircle}>
                  <Ionicons name="key" size={24} color={Colors.accent} />
                </View>
                <Text style={modalStyles.title}>API Key Required</Text>
                <Text style={modalStyles.subtitle}>
                  Enter your {PROVIDER_INFO[settings.aiProvider].label} API key to start analyzing articles. {PROVIDER_INFO[settings.aiProvider].hint}
                </Text>
              </View>

              <View style={modalStyles.inputRow}>
                <TextInput
                  style={modalStyles.input}
                  value={tempApiKey}
                  onChangeText={setTempApiKey}
                  placeholder={PROVIDER_INFO[settings.aiProvider].placeholder}
                  placeholderTextColor={Colors.textTertiary}
                  secureTextEntry={!showTempKey}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                />
                <TouchableOpacity onPress={() => setShowTempKey((v) => !v)} style={modalStyles.eyeBtn}>
                  <Ionicons
                    name={showTempKey ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={modalStyles.saveBtn} onPress={handleSaveApiKey} activeOpacity={0.8}>
                <LinearGradient
                  colors={[Colors.accent, Colors.science]}
                  style={modalStyles.saveBtnGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  <Text style={modalStyles.saveBtnText}>Save & Analyze</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={modalStyles.settingsLink}
                onPress={() => { setApiKeyModalVisible(false); router.push('/settings'); }}
              >
                <Ionicons name="settings-outline" size={14} color={Colors.textSecondary} />
                <Text style={modalStyles.settingsLinkText}>Or configure in Settings</Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

        <View style={styles.navbar}>
          <TouchableOpacity style={styles.navItem} onPress={() => {}}>
            <Ionicons name="home" size={22} color={Colors.accent} />
            <Text style={[styles.navLabel, { color: Colors.accent }]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/history')}>
            <Ionicons name="time-outline" size={22} color={Colors.textSecondary} />
            <Text style={styles.navLabel}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
            <Text style={styles.navLabel}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => router.push(user ? '/profile' : '/auth')}>
            <Ionicons name={user ? 'person' : 'person-outline'} size={22} color={user ? Colors.science : Colors.textSecondary} />
            <Text style={[styles.navLabel, user && { color: Colors.science }]}>{user ? 'Profile' : 'Sign in'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.borderLight,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  eyeBtn: {
    padding: 8,
  },
  saveBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  saveBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  settingsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  settingsLinkText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});
