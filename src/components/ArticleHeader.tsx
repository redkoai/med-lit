import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, getCEBMColor } from '../constants/colors';
import type { ArticleAnalysis } from '../types';

interface Props {
  analysis: ArticleAnalysis;
}

export function ArticleHeader({ analysis }: Props) {
  const { article, studyDesign, identifier } = analysis;
  const cebmColor = getCEBMColor(studyDesign.cebtLevel);

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryLight]}
      style={styles.gradient}
    >
      {/* Preprint warning */}
      {article.isPreprint ? (
        <View style={styles.preprintBanner}>
          <Ionicons name="warning" size={14} color="#FFF" />
          <Text style={styles.preprintText}>PREPRINT — Not peer-reviewed</Text>
        </View>
      ) : null}

      {/* Title */}
      <Text style={styles.title} numberOfLines={4}>{article.title}</Text>

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
        <View style={[styles.badge, { backgroundColor: cebmColor }]}>
          <Text style={styles.badgeText}>{studyDesign.type}</Text>
        </View>

        {/* CEBM Level */}
        <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
          <Text style={styles.badgeText}>CEBM Level {studyDesign.cebtLevel}</Text>
        </View>

        {/* Pre-registered */}
        {studyDesign.isPreregistered ? (
          <View style={[styles.badge, { backgroundColor: Colors.success }]}>
            <Ionicons name="checkmark-circle" size={10} color="#fff" />
            <Text style={styles.badgeText}> Pre-registered</Text>
          </View>
        ) : null}

        {/* Data source */}
        <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
          <Ionicons
            name={article.fetchSource === 'full_text' ? 'document-text' : 'document'}
            size={10}
            color="rgba(255,255,255,0.8)"
          />
          <Text style={styles.badgeTextMuted}>
            {' '}{article.fetchSource === 'full_text' ? 'Full text' : 'Abstract only'}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    padding: 20,
    paddingTop: 16,
    gap: 8,
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
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 24,
  },
  authors: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 18,
  },
  meta: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
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
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '500',
  },
});
