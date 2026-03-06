import React from 'react';
import { ScrollView, View, Text, TouchableOpacity, Share, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { ArticleHeader } from './ArticleHeader';
import { OverallVerdict } from './OverallVerdict';
import { SummarySection } from './SummarySection';
import { AccuracySection } from './AccuracySection';
import { BiasSection } from './BiasSection';
import { MethodsSection } from './MethodsSection';
import { ReferencesSection } from './ReferencesSection';
import { COISection } from './COISection';
import { ScoreCircle } from './ScoreCircle';
import { generateTextReport, generateMarkdownReport } from '../utils/exportAnalysis';
import type { ArticleAnalysis } from '../types';

interface Props {
  analysis: ArticleAnalysis;
}

export function AnalysisResult({ analysis }: Props) {
  const handleShareSummary = async () => {
    const text = [
      `MedLit Analysis: ${analysis.article.title}`,
      `Journal: ${analysis.article.journal} (${analysis.article.year})`,
      ``,
      `Accuracy: ${analysis.accuracyScore.score}/10 (${analysis.accuracyScore.grade})`,
      `Bias-Free: ${analysis.biasScore.score}/10`,
      `Methods: ${analysis.methodsScore.score}/10`,
      ``,
      `Verdict: ${analysis.verdict.trustworthy ? 'Trustworthy' : 'Not trustworthy'}`,
      `Key Takeaway: ${analysis.verdict.keyTakeaway}`,
      ``,
      `Analyzed with MedLit`,
    ].join('\n');
    await Share.share({ message: text });
  };

  const handleShareFull = async () => {
    const report = generateTextReport(analysis);
    await Share.share({ message: report });
  };

  const handleShareMarkdown = async () => {
    const report = generateMarkdownReport(analysis);
    await Share.share({ message: report });
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ArticleHeader analysis={analysis} />

      <View style={styles.body}>
        {/* Top scores row */}
        <View style={styles.scoresRow}>
          <ScoreCircle
            score={analysis.accuracyScore.score}
            label="Accuracy"
            subtitle={analysis.accuracyScore.grade}
            size="large"
          />
          <ScoreCircle
            score={analysis.biasScore.score}
            label="Bias-Free"
            subtitle={analysis.biasScore.overallRisk + ' risk'}
            size="large"
          />
          <ScoreCircle
            score={analysis.methodsScore.score}
            label="Methods"
            size="large"
          />
        </View>

        <OverallVerdict verdict={analysis.verdict} />
        <SummarySection summary={analysis.summary} />
        <AccuracySection accuracyScore={analysis.accuracyScore} />
        <BiasSection biasScore={analysis.biasScore} />
        <MethodsSection methodsScore={analysis.methodsScore} />
        <ReferencesSection referenceCheck={analysis.referenceCheck} />
        <COISection coi={analysis.conflictOfInterest} limitations={analysis.limitations} />

        {/* Share & Export Section */}
        <View style={styles.shareCard}>
          <View style={styles.shareHeader}>
            <Ionicons name="share-social" size={20} color={Colors.accent} />
            <Text style={styles.shareTitle}>Share Results</Text>
          </View>
          <Text style={styles.shareSubtitle}>
            Share this analysis with colleagues or save for later
          </Text>
          <View style={styles.shareButtons}>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShareSummary} activeOpacity={0.7}>
              <Ionicons name="chatbubble-outline" size={18} color={Colors.accent} />
              <Text style={styles.shareBtnText}>Quick Summary</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShareFull} activeOpacity={0.7}>
              <Ionicons name="document-text-outline" size={18} color={Colors.science} />
              <Text style={[styles.shareBtnText, { color: Colors.science }]}>Full Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareBtn} onPress={handleShareMarkdown} activeOpacity={0.7}>
              <Ionicons name="logo-markdown" size={18} color={Colors.success} />
              <Text style={[styles.shareBtnText, { color: Colors.success }]}>Markdown</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flexGrow: 1,
  },
  body: {
    padding: 16,
    gap: 0,
  },
  scoresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  shareCard: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  shareHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  shareTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  shareSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  shareButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    backgroundColor: Colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  shareBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.accent,
  },
  footer: {
    height: 40,
  },
});
