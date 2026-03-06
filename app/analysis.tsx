import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share, Modal, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../src/constants/colors';
import { AnalysisResult } from '../src/components/AnalysisResult';
import type { ArticleAnalysis } from '../src/types';
import { generateTextReport, generateMarkdownReport, generateBibTeX } from '../src/utils/exportAnalysis';

export default function AnalysisScreen() {
  const [exportMenuVisible, setExportMenuVisible] = useState(false);

  const analysis: ArticleAnalysis | undefined =
    (global as { __medlit_analysis?: ArticleAnalysis }).__medlit_analysis;

  if (!analysis) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <View style={styles.errorIcon}>
          <Ionicons name="alert-circle-outline" size={48} color={Colors.textTertiary} />
        </View>
        <Text style={styles.errorTitle}>No analysis found</Text>
        <Text style={styles.errorBody}>
          Please go back and analyze an article first.
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={16} color="#fff" />
          <Text style={styles.backBtnText}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleQuickShare = async () => {
    const text = [
      `MedLit Analysis: ${analysis.article.title}`,
      `Journal: ${analysis.article.journal} (${analysis.article.year})`,
      ``,
      `Accuracy Score: ${analysis.accuracyScore.score}/10 (${analysis.accuracyScore.grade})`,
      `Bias-Free Score: ${analysis.biasScore.score}/10`,
      `Methods Score: ${analysis.methodsScore.score}/10`,
      ``,
      `Verdict: ${analysis.verdict.trustworthy ? 'Trustworthy' : 'Not trustworthy'}`,
      ``,
      `Key Takeaway: ${analysis.verdict.keyTakeaway}`,
      ``,
      `Analyzed with MedLit`,
    ].join('\n');

    await Share.share({ message: text });
  };

  const handleExportText = async () => {
    setExportMenuVisible(false);
    const report = generateTextReport(analysis);
    await Share.share({ message: report });
  };

  const handleExportMarkdown = async () => {
    setExportMenuVisible(false);
    const report = generateMarkdownReport(analysis);
    await Share.share({ message: report });
  };

  const handleExportBibTeX = async () => {
    setExportMenuVisible(false);
    const bibtex = generateBibTeX(analysis);
    await Share.share({ message: bibtex });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Analysis Results
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn} onPress={handleQuickShare}>
            <Ionicons name="share-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setExportMenuVisible(true)}>
            <Ionicons name="download-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <AnalysisResult analysis={analysis} />

      {/* Export Menu Modal */}
      <Modal
        visible={exportMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setExportMenuVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setExportMenuVisible(false)}>
          <View style={styles.exportMenu}>
            <View style={styles.exportMenuHeader}>
              <Ionicons name="download-outline" size={20} color={Colors.primary} />
              <Text style={styles.exportMenuTitle}>Export Analysis</Text>
            </View>

            <TouchableOpacity style={styles.exportOption} onPress={handleExportText} activeOpacity={0.6}>
              <View style={styles.exportOptionIcon}>
                <Ionicons name="document-text-outline" size={20} color={Colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.exportOptionTitle}>Full Text Report</Text>
                <Text style={styles.exportOptionDesc}>Comprehensive plain text report</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportOption} onPress={handleExportMarkdown} activeOpacity={0.6}>
              <View style={styles.exportOptionIcon}>
                <Ionicons name="logo-markdown" size={20} color={Colors.science} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.exportOptionTitle}>Markdown Report</Text>
                <Text style={styles.exportOptionDesc}>Formatted for GitHub, Notion, etc.</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.exportOption} onPress={handleExportBibTeX} activeOpacity={0.6}>
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
    </SafeAreaView>
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
