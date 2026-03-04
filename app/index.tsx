import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../src/constants/colors';
import { useSettings } from '../src/hooks/useSettings';
import { useHistory } from '../src/hooks/useHistory';
import { parseArticleUrl, hasValidIdentifier, formatIdentifierLabel } from '../src/services/urlParser';
import { fetchArticle } from '../src/services/articleFetcher';
import { analyzeArticle } from '../src/services/claudeAnalyzer';
import { LoadingState } from '../src/components/LoadingState';
import type { FetchState, ArticleAnalysis } from '../src/types';

const EXAMPLE_URLS = [
  'https://pubmed.ncbi.nlm.nih.gov/38514723/',
  'https://doi.org/10.1038/s41586-023-06374-2',
  'https://www.nejm.org/doi/full/10.1056/NEJMoa2300057',
];

export default function HomeScreen() {
  const { settings, loaded } = useSettings();
  const { history, saveToHistory } = useHistory();
  const [url, setUrl] = useState('');
  const [fetchState, setFetchState] = useState<FetchState>({
    status: 'idle',
    message: '',
    progress: 0,
  });
  const [currentAnalysis, setCurrentAnalysis] = useState<ArticleAnalysis | null>(null);
  const analysisRef = useRef<ArticleAnalysis | null>(null);

  const updateState = useCallback((status: FetchState['status'], message: string, progress: number) => {
    setFetchState({ status, message, progress });
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!url.trim()) {
      Alert.alert('No URL', 'Please paste an article URL.');
      return;
    }

    if (!settings.claudeApiKey) {
      Alert.alert(
        'API Key Required',
        'Please add your Claude API key in Settings before analyzing articles.',
        [
          { text: 'Go to Settings', onPress: () => router.push('/settings') },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    setCurrentAnalysis(null);

    try {
      // Step 1: Parse URL
      updateState('parsing_url', 'Parsing article URL...', 10);
      const identifier = parseArticleUrl(url.trim());

      if (!hasValidIdentifier(identifier)) {
        // Try anyway with the raw URL
        if (!url.startsWith('http')) {
          Alert.alert(
            'Could not parse URL',
            'Could not extract a PubMed ID, DOI, or recognizable identifier from this URL. Please check the link.'
          );
          setFetchState({ status: 'idle', message: '', progress: 0 });
          return;
        }
      }

      // Step 2: Fetch article
      updateState('fetching_article', `Fetching article data (${formatIdentifierLabel(identifier)})...`, 30);

      const article = await fetchArticle(identifier, {
        unpaywallEmail: settings.unpaywallEmail,
        sciHubEnabled: settings.sciHubEnabled,
        sciHubMirror: settings.sciHubMirror,
        onProgress: (msg) => updateState('fetching_article', msg, 50),
      });

      // Step 3: Analyze
      updateState('analyzing', 'Analyzing with Claude AI...', 65);

      const analysis = await analyzeArticle(
        article,
        identifier,
        settings.claudeApiKey,
        settings.claudeModel,
        (msg) => updateState('analyzing', msg, 80)
      );

      // Done
      updateState('done', 'Analysis complete!', 100);
      analysisRef.current = analysis;
      setCurrentAnalysis(analysis);

      // Save to history
      if (settings.saveHistory) {
        await saveToHistory(analysis);
      }

      // Navigate to results
      setTimeout(() => {
        router.push({
          pathname: '/analysis',
          params: { id: analysis.id },
        });
        setFetchState({ status: 'idle', message: '', progress: 0 });
      }, 600);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Unknown error';
      setFetchState({
        status: 'error',
        message: msg,
        progress: 0,
        error: msg,
      });
    }
  }, [url, settings, saveToHistory, updateState]);

  const isLoading = fetchState.status !== 'idle' && fetchState.status !== 'error';

  // Store analysis globally for the analysis screen
  if (currentAnalysis) {
    (global as { __medlit_analysis?: ArticleAnalysis }).__medlit_analysis = currentAnalysis;
  }

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
          {/* Hero header */}
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

          {/* Input card */}
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
                <TouchableOpacity
                  onPress={() => setUrl('')}
                  style={styles.clearBtn}
                >
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

            {/* Loading state */}
            {isLoading ? <LoadingState state={fetchState} /> : null}

            {/* Error */}
            {fetchState.status === 'error' ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={18} color={Colors.danger} />
                <Text style={styles.errorText}>{fetchState.error}</Text>
              </View>
            ) : null}
          </View>

          {/* Example URLs */}
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

          {/* Quick feature pills */}
          {!isLoading ? (
            <View style={styles.features}>
              {[
                { icon: 'analytics-outline', label: 'Accuracy Score' },
                { icon: 'eye-outline', label: 'Bias Detection' },
                { icon: 'flask-outline', label: 'Methods Review' },
                { icon: 'library-outline', label: 'Reference Check' },
                { icon: 'ribbon-outline', label: 'COI Flagging' },
                { icon: 'reader-outline', label: 'Plain Summary' },
              ].map((f) => (
                <View key={f.label} style={styles.featurePill}>
                  <Ionicons name={f.icon as keyof typeof Ionicons.glyphMap} size={13} color={Colors.science} />
                  <Text style={styles.featureLabel}>{f.label}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {/* Recent history preview */}
          {history.length > 0 && !isLoading ? (
            <View style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyTitle}>Recent Analyses</Text>
                <TouchableOpacity onPress={() => router.push('/history')}>
                  <Text style={styles.historyViewAll}>View all →</Text>
                </TouchableOpacity>
              </View>
              {history.slice(0, 3).map((entry) => (
                <View key={entry.id} style={styles.historyItem}>
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
                </View>
              ))}
            </View>
          ) : null}

          {/* Settings shortcut */}
          {!settings.claudeApiKey && !isLoading ? (
            <TouchableOpacity
              style={styles.apiKeyPrompt}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="key-outline" size={18} color={Colors.warning} />
              <Text style={styles.apiKeyPromptText}>
                Add your Claude API key to start analyzing
              </Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.warning} />
            </TouchableOpacity>
          ) : null}
        </ScrollView>

        {/* Nav bar */}
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
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scroll: { paddingBottom: 20 },

  hero: {
    padding: 20,
    paddingTop: 28,
    paddingBottom: 28,
    gap: 12,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  logoSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
  },
  heroTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },

  inputCard: {
    margin: 16,
    backgroundColor: Colors.surface,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  clearBtn: {
    padding: 4,
  },
  analyzeBtn: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  analyzeBtnDisabled: {
    opacity: 0.7,
  },
  analyzeBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  analyzeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.dangerLight,
    padding: 12,
    borderRadius: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: Colors.danger,
    lineHeight: 18,
  },

  examplesCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  examplesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  exampleUrl: {
    flex: 1,
    fontSize: 12,
    color: Colors.accent,
    textDecorationLine: 'underline',
  },

  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginTop: 14,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.scienceLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  featureLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.science,
  },

  historyCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  historyViewAll: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '600',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  historyItemLeft: {
    flex: 1,
    gap: 2,
  },
  historyItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  historyItemMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  historyItemScores: {
    alignItems: 'center',
  },
  historyScore: {
    fontSize: 15,
    fontWeight: '700',
  },
  historyScoreLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
  },

  apiKeyPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: Colors.warningLight,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  apiKeyPromptText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.warning,
  },

  navbar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? 0 : 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    gap: 2,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
