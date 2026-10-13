import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import type { ArticleAnalysis } from '../types';

interface Props {
  analysis: ArticleAnalysis;
}

export function ArticleHeader({ analysis }: Props) {
  const { article, studyDesign } = analysis;

  return (
    <View style={styles.gradient}>
      {/* Preprint warning */}
      {article.isPreprint ? (
        <View style={styles.preprintBanner}>
          <Ionicons name="warning" size={14} color="#FFF" />
          <Text style={styles.preprintText}>PREPRINT — Not peer-reviewed</Text>
        </View>
      ) : null}

      {/* Title */}
      <Text role="heading" aria-level={1} style={styles.title}>{article.title}</Text>

      {/* Authors */}
      {article.authors.length > 0 ? (
        <Text style={styles.authors} numberOfLines={2}>
          {article.authors.slice(0, 5).join(', ')}
          {article.authors.length > 5 ? ` +${article.authors.length - 5} more` : ''}
        </Text>
      ) : null}

      {/* Journal + Year */}
      <Text style={styles.meta}>
        {article.journal}
        {article.year ? ` · ${article.year}` : ''}
        {article.doi ? ` · DOI: ${article.doi}` : ''}
      </Text>

      {/* Badges row */}
      <View style={styles.badgeRow}>
        {/* Study design */}
        <View style={[styles.badge, { backgroundColor: Colors.accent }]}>
          <Text style={styles.badgeText}>{studyDesign.type}</Text>
        </View>

        {/* Appraisal framework */}
        <View style={[styles.badge, { backgroundColor: Colors.primaryMuted }]}>
          <Text style={[styles.badgeText, { color: Colors.primary }]}>{studyDesign.appraisalFramework}</Text>
        </View>

        {/* Pre-registered */}
        {studyDesign.isPreregistered === 'yes' ? (
          <View style={[styles.badge, { backgroundColor: Colors.success }]}>
            <Ionicons name="checkmark-circle" size={10} color="#fff" />
            <Text style={styles.badgeText}> Registration reported · verify</Text>
          </View>
        ) : null}

        {/* Data source */}
        <View style={[styles.badge, { backgroundColor: Colors.primaryMuted }]}>
          <Ionicons
            name={article.fetchSource === 'full_text' ? 'document-text' : 'document'}
            size={10}
            color={Colors.textSecondary}
          />
          <Text style={styles.badgeTextMuted}>
            {' '}{analysis.analysisModel === 'example/hand-authored' ? 'Fictional excerpt' : article.fetchSource === 'full_text' ? 'Full text' : article.fetchSource === 'abstract_only' ? 'Abstract only' : 'Metadata only'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    padding: 24,
    paddingTop: 28,
    gap: 12,
    width: '100%',
    maxWidth: 1020,
    alignSelf: 'center',
  },
  preprintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.warning,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
    alignSelf: 'flex-start',
  },
  preprintText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: Colors.primary,
    lineHeight: 35,
  },
  authors: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  meta: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  badgeTextMuted: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
});
