import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
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
import type { ArticleAnalysis } from '../types';

interface Props {
  analysis: ArticleAnalysis;
}

export function AnalysisResult({ analysis }: Props) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Article header with gradient */}
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

        {/* Overall verdict */}
        <OverallVerdict verdict={analysis.verdict} />

        {/* Summary */}
        <SummarySection summary={analysis.summary} />

        {/* Accuracy */}
        <AccuracySection accuracyScore={analysis.accuracyScore} />

        {/* Bias */}
        <BiasSection biasScore={analysis.biasScore} />

        {/* Methods */}
        <MethodsSection methodsScore={analysis.methodsScore} />

        {/* References */}
        <ReferencesSection referenceCheck={analysis.referenceCheck} />

        {/* COI + Limitations */}
        <COISection coi={analysis.conflictOfInterest} limitations={analysis.limitations} />

        <View style={styles.footer}>
        </View>
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
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  footer: {
    height: 40,
  },
});
