import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../src/constants/colors';
import { AnalysisResult } from '../src/components/AnalysisResult';
import type { ArticleAnalysis } from '../src/types';

export default function AnalysisScreen() {
  // Analysis is passed via global from index screen
  const analysis: ArticleAnalysis | undefined =
    (global as { __medlit_analysis?: ArticleAnalysis }).__medlit_analysis;

  if (!analysis) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.textTertiary} />
        <Text style={styles.errorTitle}>No analysis found</Text>
        <Text style={styles.errorBody}>
          Please go back and analyze an article first.
        </Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    const text = [
      `MedLit Analysis: ${analysis.article.title}`,
      `Journal: ${analysis.article.journal} (${analysis.article.year})`,
      ``,
      `Accuracy Score: ${analysis.accuracyScore.score}/10 (${analysis.accuracyScore.grade})`,
      `Bias-Free Score: ${analysis.biasScore.score}/10`,
      `Methods Score: ${analysis.methodsScore.score}/10`,
      ``,
      `Verdict: ${analysis.verdict.trustworthy ? '✅ Trustworthy' : '⚠️ Not trustworthy'}`,
      ``,
      `Key Takeaway: ${analysis.verdict.keyTakeaway}`,
      ``,
      `Analyzed with MedLit`,
    ].join('\n');

    await Share.share({ message: text });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Custom header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Analysis Results
        </Text>
        <TouchableOpacity style={styles.headerBtn} onPress={handleShare}>
          <Ionicons name="share-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <AnalysisResult analysis={analysis} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 12,
    gap: 8,
  },
  headerBtn: {
    padding: 6,
    borderRadius: 8,
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
    backgroundColor: Colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
