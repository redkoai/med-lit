import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../src/constants/colors';
import { AnalysisResult } from '../src/components/AnalysisResult';
import type { ArticleAnalysis } from '../src/types';
import { generateTextReport, generateMarkdownReport, generateBibTeX } from '../src/utils/exportAnalysis';
import { useAuth } from '../src/hooks/useAuth';
import { useHistory } from '../src/hooks/useHistory';
import { captureEvent } from '../src/services/productAnalytics';
import { loadCurrentAnalysis } from '../src/services/currentAnalysis';
import { shareText } from '../src/utils/shareText';
import { PageMeta } from '../src/components/PageMeta';

export default function AnalysisScreen() {
  const params = useLocalSearchParams<{ id?: string; saveWarning?: string }>();
  const { user } = useAuth();
  const { getAnalysis, updateAnalysisMetadata, addJudgmentFeedback } = useHistory(user?.uid ?? null);
  const [analysis, setAnalysis] = useState<ArticleAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportMenuVisible, setExportMenuVisible] = useState(false);
  const [libraryMenuVisible, setLibraryMenuVisible] = useState(false);
  const [collectionName, setCollectionName] = useState('');
  const [tagText, setTagText] = useState('');
  const [notes, setNotes] = useState('');
  const [exportStatus, setExportStatus] = useState('');
  const deliverText = async (message: string, filename?: string) => {
    try { setExportStatus(await shareText(message, filename)); }
    catch { setExportStatus('Export failed. Try the report controls at the bottom of the appraisal.'); }
  };

  useEffect(() => {
    let cancelled = false;
    setAnalysis(null); setLoading(true);
    (async () => {
      const id = typeof params.id === 'string' ? params.id : '';
      const found = id ? await getAnalysis(id).catch(() => null) ?? await loadCurrentAnalysis(id) : null;
      if (!cancelled) {
        setAnalysis(found);
        if (found) void captureEvent('report_opened');
        setCollectionName(found?.collection ?? '');
        setTagText(found?.tags?.join(', ') ?? '');
        setNotes(found?.notes ?? '');
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [params.id, getAnalysis]);

  if (loading) {
    return (
      <>
      <PageMeta title="Appraisal — MedLit" description="A private saved MedLit appraisal." path="/analysis" noIndex />
      <SafeAreaView style={styles.errorContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.errorBody}>Loading saved appraisal…</Text>
      </SafeAreaView>
      </>
    );
  }

  if (!analysis) {
    return (
      <>
      <PageMeta title="Appraisal not found — MedLit" description="A private saved MedLit appraisal." path="/analysis" noIndex />
      <SafeAreaView style={styles.errorContainer}>
        <View style={styles.errorIcon}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.textTertiary} />
        </View>
        <Text style={styles.errorTitle}>No analysis found</Text>
        <Text style={styles.errorBody}>
          Please go back and analyze an article first.
        </Text>
        <TouchableOpacity accessibilityRole="button" style={styles.backBtn} onPress={() => router.replace('/history')} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={16} color="#fff" />
          <Text style={styles.backBtnText}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
      </>
    );
  }

  const handleQuickShare = async () => {
    const text = [
      `MedLit Analysis: ${analysis.article.title}`,
      `Journal: ${analysis.article.journal}${analysis.article.year ? ` (${analysis.article.year})` : ''}`,
      ``,
      `Appraisal confidence: ${analysis.verdict.confidence}`,
      `Risk-of-bias concerns: ${analysis.riskOfBias.overallRisk.replace('_', ' ')}`,
      `Source coverage: ${analysis.appraisal.sourceCoverage.level.replace('_', ' ')}`,
      ``,
      `Key Takeaway: ${analysis.verdict.keyTakeaway}`,
      ``,
      `Analyzed with MedLit`,
    ].join('\n');

    await deliverText(text, 'medlit-summary.txt');
  };

  const handleExportText = async () => {
    setExportMenuVisible(false);
    const report = generateTextReport(analysis);
    await deliverText(report);
  };

  const handleExportMarkdown = async () => {
    setExportMenuVisible(false);
    const report = generateMarkdownReport(analysis);
    await deliverText(report);
  };

  const handleExportBibTeX = async () => {
    setExportMenuVisible(false);
    const bibtex = generateBibTeX(analysis);
    await deliverText(bibtex, 'medlit-citation.bib');
  };

  return (
    <>
    <PageMeta title={`${analysis.article.title} — MedLit appraisal`} description="A private evidence-linked MedLit appraisal." path="/analysis" noIndex />
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Go back" style={styles.headerBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Analysis Results
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Export appraisal summary" style={styles.headerBtn} onPress={handleQuickShare}>
            <Ionicons name="share-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Edit library details" style={styles.headerBtn} onPress={() => setLibraryMenuVisible(true)}>
            <Ionicons name="folder-open-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Export appraisal" style={styles.headerBtn} onPress={() => setExportMenuVisible(true)}>
            <Ionicons name="download-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {params.saveWarning ? <Text accessibilityRole="alert" style={{ padding: 14, color: Colors.warning, backgroundColor: Colors.warningLight }}>History could not be saved. Export this report before leaving or refreshing.</Text> : null}
      {exportStatus ? <Text accessibilityLiveRegion="polite" style={{ padding: 12, backgroundColor: Colors.accentLight, color: Colors.primary }}>{exportStatus}</Text> : null}
      <AnalysisResult
        analysis={analysis}
        onAddFeedback={async (input) => {
          const updated = await addJudgmentFeedback(analysis.id, input);
          if (updated) setAnalysis(updated);
        }}
      />

      {/* Export Menu Modal */}
      <Modal
        visible={exportMenuVisible}
        transparent
        animationType="none"
        onRequestClose={() => setExportMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setExportMenuVisible(false)}>
          <View style={styles.exportMenu}>
            <View style={styles.exportMenuHeader}>
              <Ionicons name="download-outline" size={20} color={Colors.primary} />
              <Text style={styles.exportMenuTitle}>Export Analysis</Text>
            </View>

            <TouchableOpacity accessibilityRole="button" style={styles.exportOption} onPress={handleExportText} activeOpacity={0.6}>
              <View style={styles.exportOptionIcon}>
                <Ionicons name="document-text-outline" size={20} color={Colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.exportOptionTitle}>Full Text Report</Text>
                <Text style={styles.exportOptionDesc}>Comprehensive plain text report</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity accessibilityRole="button" style={styles.exportOption} onPress={handleExportMarkdown} activeOpacity={0.6}>
              <View style={styles.exportOptionIcon}>
                <Ionicons name="logo-markdown" size={20} color={Colors.science} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.exportOptionTitle}>Markdown Report</Text>
                <Text style={styles.exportOptionDesc}>Formatted for GitHub, Notion, etc.</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity accessibilityRole="button" style={styles.exportOption} onPress={handleExportBibTeX} activeOpacity={0.6}>
              <View style={styles.exportOptionIcon}>
                <Ionicons name="bookmark-outline" size={20} color={Colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.exportOptionTitle}>BibTeX Citation</Text>
                <Text style={styles.exportOptionDesc}>For LaTeX, Zotero, Mendeley</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setExportMenuVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      <Modal
        visible={libraryMenuVisible}
        transparent
        animationType="none"
        onRequestClose={() => setLibraryMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setLibraryMenuVisible(false)}>
          <Pressable style={styles.libraryEditor} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.exportMenuTitle}>Library details</Text>
            <Text style={styles.editorLabel}>Collection</Text>
            <TextInput
              style={styles.editorInput}
              value={collectionName}
              onChangeText={setCollectionName}
              placeholder="e.g. Cardiology review"
              placeholderTextColor={Colors.textTertiary}
            />
            <Text style={styles.editorLabel}>Tags</Text>
            <TextInput
              style={styles.editorInput}
              value={tagText}
              onChangeText={setTagText}
              placeholder="RCT, hypertension, screening"
              placeholderTextColor={Colors.textTertiary}
            />
            <Text style={styles.editorLabel}>Notes</Text>
            <TextInput
              style={[styles.editorInput, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Your notes about this paper"
              placeholderTextColor={Colors.textTertiary}
              multiline
            />
            <TouchableOpacity
              accessibilityRole="button"
              style={styles.editorSaveBtn}
              onPress={async () => {
                const updated = await updateAnalysisMetadata(analysis.id, {
                  collection: collectionName.trim() || undefined,
                  tags: tagText.split(',').map((tag) => tag.trim()).filter(Boolean).slice(0, 20),
                  notes: notes.trim() || undefined,
                });
                if (updated) setAnalysis(updated);
                setLibraryMenuVisible(false);
              }}
            >
              <Text style={styles.backBtnText}>Save to library</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 14,
    gap: 8,
  },
  headerBtn: {
    padding: 8,
    borderRadius: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
    backgroundColor: Colors.background,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  errorBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  backBtn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 12,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  exportMenu: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  libraryEditor: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    gap: 8,
  },
  editorLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginTop: 5,
  },
  editorInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  notesInput: { minHeight: 82, textAlignVertical: 'top' },
  editorSaveBtn: {
    marginTop: 8,
    backgroundColor: Colors.accent,
    padding: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  exportMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  exportMenuTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  exportOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  exportOptionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportOptionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  exportOptionDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cancelBtn: {
    padding: 16,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.danger,
  },
});
