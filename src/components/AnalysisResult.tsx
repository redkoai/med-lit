import React, { useRef, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput, StyleSheet, Pressable, Platform } from 'react-native';
import { shareText } from '../utils/shareText';
import * as Linking from 'expo-linking';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { AppraisalScore } from './AppraisalScore';
import { ArticleHeader } from './ArticleHeader';
import { OverallVerdict } from './OverallVerdict';
import { SummarySection } from './SummarySection';
import { AccuracySection } from './AccuracySection';
import { BiasSection } from './BiasSection';
import { MethodsSection } from './MethodsSection';
import { ReferencesSection } from './ReferencesSection';
import { COISection } from './COISection';
import { EvidenceAppraisalSection } from './EvidenceAppraisalSection';
import { PicoSection } from './PicoSection';
import { SectionCard } from './SectionCard';
import { generateTextReport, generateMarkdownReport } from '../utils/exportAnalysis';
import { encodeSharedSnapshot } from '../services/shareSnapshot';
import { PUBLIC_SITE_URL } from '../constants/site';
import type { ArticleAnalysis, JudgmentFeedback } from '../types';

interface Props {
  analysis: ArticleAnalysis;
  onAddFeedback?: (input: Omit<JudgmentFeedback, 'id' | 'createdAt' | 'analysisVersion'>) => Promise<void>;
}

const TABS = [{ id: 'overview', label: 'Overview' }, { id: 'evidence', label: 'Bias & evidence' }, { id: 'methods', label: 'Methods' }, { id: 'citations', label: 'Citations & export' }];

export function AnalysisResult({ analysis, onAddFeedback }: Props) {
  const [tab, setTab] = useState('overview');
  const tabRefs = useRef<Array<View | null>>([]);
  const navigateTab = (event: { key: string; preventDefault: () => void }, index: number) => {
    const next = event.key === 'ArrowRight' ? (index + 1) % TABS.length
      : event.key === 'ArrowLeft' ? (index + TABS.length - 1) % TABS.length
      : event.key === 'Home' ? 0 : event.key === 'End' ? TABS.length - 1 : -1;
    if (next === -1) return;
    event.preventDefault();
    setTab(TABS[next].id);
    tabRefs.current[next]?.focus();
  };
  const matched = analysis.appraisal.evidence.filter(e => e.verified).length;
  const unclear = analysis.appraisal.judgments.filter(j => j.judgment === 'unclear').length;
  const example = analysis.analysisModel === 'example/hand-authored';
  const [exportStatus, setExportStatus] = useState('');
  const [shareLink, setShareLink] = useState('');
  const deliverText = async (message: string, filename?: string) => {
    try { setExportStatus(await shareText(message, filename)); }
    catch { setExportStatus('Export could not be opened. Try copying the summary or using a different browser.'); }
  };
  const handleShareSummary = async () => {
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

  const handleShareFull = async () => {
    const report = generateTextReport(analysis);
    await deliverText(report);
  };

  const handleShareMarkdown = async () => {
    const report = generateMarkdownReport(analysis);
    await deliverText(report);
  };

  const buildSummaryText = () => [
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

  const handleEmailShare = async () => {
    const subject = encodeURIComponent(`MedLit Analysis: ${analysis.article.title}`);
    const body = encodeURIComponent(generateTextReport(analysis));
    const mailto = `mailto:?subject=${subject}&body=${body}`;
    try {
      const supported = await Linking.canOpenURL(mailto);
      if (supported) {
        await Linking.openURL(mailto);
      } else {
        await deliverText(generateTextReport(analysis));
      }
    } catch {
      await deliverText(generateTextReport(analysis));
    }
  };

  const handleCopyToClipboard = async () => {
    try { const copied = await Clipboard.setStringAsync(buildSummaryText()); setExportStatus(copied ? 'Summary copied.' : 'Clipboard unavailable. Use Full Report to download it.'); }
    catch { setExportStatus('Clipboard unavailable. Use Full Report to download it.'); }
  };

  const handleTwitterShare = async () => {
    const text = encodeURIComponent(
      `Just analyzed "${analysis.article.title}" with MedLit:\n` +
      `Appraisal confidence: ${analysis.verdict.confidence} | Risk-of-bias concerns: ${analysis.riskOfBias.overallRisk.replace('_', ' ')}\n` +
      `Source coverage: ${analysis.appraisal.sourceCoverage.level.replace('_', ' ')}`
    );
    const url = `https://twitter.com/intent/tweet?text=${text}`;
    try {
      await Linking.openURL(url);
    } catch {
      await deliverText(buildSummaryText(), 'medlit-summary.txt');
    }
  };

  const handleReadOnlyLink = async () => {
    try {
      const data = encodeSharedSnapshot(analysis);
      setShareLink(`${PUBLIC_SITE_URL}/shared#data=${data}`);
      setExportStatus('Link prepared. Anyone with this link can read the included appraisal. Private notes and feedback are excluded.');
    } catch { setExportStatus('This appraisal is too large for a portable link. Export a report instead.'); }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <ArticleHeader analysis={analysis} />
      <AppraisalScore analysis={analysis} />

      <View style={styles.body}>
        {analysis.analysisModel.startsWith('manual/') && <View style={styles.importNotice}><Text style={styles.importNoticeText}>Imported from your external chat. The model is unverified. Quoted passages are matched to the source; scientific correctness still needs your review.</Text></View>}
        <View style={styles.readingMap}>
          {[{ label: 'SOURCE AVAILABLE', value: example ? 'Teaching excerpt' : analysis.appraisal.sourceCoverage.level.replace(/_/g, ' '), note: analysis.appraisal.sourceCoverage.wasTruncated ? 'Text was truncated' : 'Review source limitations' }, { label: 'QUOTATIONS MATCHED', value: `${matched} of ${analysis.appraisal.evidence.length}`, note: 'Text match ≠ scientific validation' }, { label: 'DOMAINS UNCLEAR', value: `${unclear} of ${analysis.appraisal.judgments.length}`, note: 'Missing information stays visible' }].map(item => <View key={item.label} style={styles.mapItem}><Text style={styles.mapLabel}>{item.label}</Text><Text style={styles.mapValue}>{item.value}</Text><Text style={styles.mapNote}>{item.note}</Text></View>)}
        </View>
        <View style={styles.tabs} accessibilityRole="tablist" accessibilityLabel="Appraisal sections">
          {TABS.map((item, index) => <Pressable key={item.id} ref={element => { tabRefs.current[index] = element; }} nativeID={`tab-${item.id}`} accessibilityRole="tab" accessibilityState={{ selected: tab === item.id }} aria-selected={tab === item.id} aria-controls="appraisal-panel" tabIndex={tab === item.id ? 0 : -1} {...(Platform.OS === 'web' ? { onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => navigateTab(event, index) } : {})} onPress={() => setTab(item.id)} style={[styles.tab, tab === item.id && styles.activeTab]} dataSet={{ motion: 'press' }}><Text style={[styles.tabLabel, tab === item.id && { color: Colors.accent }]}>{item.label}</Text></Pressable>)}
        </View>
        <View key={tab} nativeID="appraisal-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} dataSet={{ motion: 'finding' }}>
          <Text style={[styles.importNoticeText, { marginBottom: 16 }]}>{example ? 'This hand-authored example uses the real quotation validator. Neither its narrative nor a matched quote establishes scientific accuracy.' : 'AI narrative and descriptive fields are not independently verified. Only linked quotations are checked for presence in the supplied text.'}</Text>
          {tab === 'overview' && <><OverallVerdict verdict={analysis.verdict} /><SummarySection summary={analysis.summary} /><PicoSection pico={analysis.pico} /><AccuracySection evidenceScore={analysis.evidenceScore} /></>}
          {tab === 'evidence' && <>{example && <SectionCard title="Read the fictional source excerpt" icon="document-text-outline" defaultExpanded={false}><Text selectable style={{ fontSize: 14, lineHeight: 23, color: Colors.primary, paddingVertical: 14 }}>{analysis.article.fullText}</Text></SectionCard>}<EvidenceAppraisalSection appraisal={analysis.appraisal} feedback={analysis.feedback} onAddFeedback={onAddFeedback} /><BiasSection riskOfBias={analysis.riskOfBias} /></>}
          {tab === 'methods' && <><MethodsSection methodsScore={analysis.methodsScore} /><COISection coi={analysis.conflictOfInterest} limitations={analysis.limitations} /></>}
          {tab === 'citations' && <ReferencesSection referenceCheck={analysis.referenceCheck} />}
        </View>

        {/* Share & Export Section */}
        {tab === 'citations' && <View style={styles.shareCard}>
          <View style={styles.shareHeader}>
            <Ionicons name="share-social" size={20} color={Colors.accent} />
            <Text style={styles.shareTitle}>Share Results</Text>
          </View>
          <Text style={styles.shareSubtitle}>
            Share this analysis with colleagues or save for later
          </Text>

          {/* Quick share row */}
          <View style={styles.quickShareRow}>
            <TouchableOpacity accessibilityRole="button" style={styles.quickShareBtn} onPress={handleEmailShare} activeOpacity={0.7}>
              <View style={[styles.quickShareIcon, { backgroundColor: Colors.accentLight }]}>
                <Ionicons name="mail-outline" size={20} color={Colors.accent} />
              </View>
              <Text style={styles.quickShareLabel}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" style={styles.quickShareBtn} onPress={handleTwitterShare} activeOpacity={0.7}>
              <View style={[styles.quickShareIcon, { backgroundColor: '#E8F5FD' }]}>
                <Ionicons name="logo-twitter" size={20} color="#1DA1F2" />
              </View>
              <Text style={styles.quickShareLabel}>Twitter</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" style={styles.quickShareBtn} onPress={handleCopyToClipboard} activeOpacity={0.7}>
              <View style={[styles.quickShareIcon, { backgroundColor: Colors.scienceLight }]}>
                <Ionicons name="copy-outline" size={20} color={Colors.science} />
              </View>
              <Text style={styles.quickShareLabel}>Copy</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" style={styles.quickShareBtn} onPress={handleShareSummary} activeOpacity={0.7}>
              <View style={[styles.quickShareIcon, { backgroundColor: Colors.successLight }]}>
                <Ionicons name="share-outline" size={20} color={Colors.success} />
              </View>
              <Text style={styles.quickShareLabel}>More</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Create read-only share link" style={styles.linkShareButton} onPress={handleReadOnlyLink}>
            <Ionicons name="link-outline" size={18} color={Colors.accent} />
            <Text style={styles.linkShareText}>Create portable read-only link</Text>
          </TouchableOpacity>

          {shareLink ? <View style={{ gap: 8 }}>
            <TextInput accessibilityLabel="Read-only appraisal link" value={shareLink} editable={false} selectTextOnFocus style={{ padding: 12, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, color: Colors.textPrimary }} />
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Copy read-only link" style={styles.linkShareButton} onPress={async () => {
              try { const copied = await Clipboard.setStringAsync(shareLink); setExportStatus(copied ? 'Read-only link copied.' : 'Select the link above and copy it manually.'); }
              catch { setExportStatus('Select the link above and copy it manually.'); }
            }}><Text style={styles.linkShareText}>Copy read-only link</Text></TouchableOpacity>
          </View> : null}
          {exportStatus ? <Text accessibilityLiveRegion="polite" style={[styles.importNoticeText, { paddingVertical: 12 }]}>{exportStatus}</Text> : null}
          {/* Export formats */}
          <View style={styles.exportDivider} />
          <Text style={styles.exportLabel}>Export as</Text>
          <View style={styles.shareButtons}>
            <TouchableOpacity accessibilityRole="button" style={styles.shareBtn} onPress={handleShareFull} activeOpacity={0.7}>
              <Ionicons name="document-text-outline" size={18} color={Colors.science} />
              <Text style={[styles.shareBtnText, { color: Colors.science }]}>Full Report</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" style={styles.shareBtn} onPress={handleShareMarkdown} activeOpacity={0.7}>
              <Ionicons name="logo-markdown" size={18} color={Colors.success} />
              <Text style={[styles.shareBtnText, { color: Colors.success }]}>Markdown</Text>
            </TouchableOpacity>
          </View>
        </View>}

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
    width: '100%',
    maxWidth: 1020,
    alignSelf: 'center',
  },
  importNotice: { borderRadius: 12, padding: 16, marginBottom: 16, backgroundColor: Colors.accentLight },
  importNoticeText: { color: Colors.primary, fontSize: 13, lineHeight: 21 },
  readingMap: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, paddingVertical: 18, paddingHorizontal: 20, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 12 },
  mapItem: { flex: 1, minWidth: 170, gap: 7 }, mapLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.7, color: Colors.textSecondary }, mapValue: { fontSize: 23, fontWeight: '600', color: Colors.primary }, mapNote: { fontSize: 11, lineHeight: 17, color: Colors.textSecondary },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', borderBottomWidth: 1, borderColor: Colors.border, gap: 6, marginVertical: 18 }, tab: { minHeight: 48, paddingHorizontal: 15, justifyContent: 'center', borderBottomWidth: 2, borderColor: 'transparent' }, activeTab: { borderColor: Colors.accent }, tabLabel: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' },
  scoresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 16,
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
  quickShareRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  quickShareBtn: {
    alignItems: 'center',
    gap: 6,
  },
  linkShareButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 11, backgroundColor: Colors.accentLight, marginBottom: 14 },
  linkShareText: { color: Colors.accent, fontSize: 12, fontWeight: '800' },
  quickShareIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickShareLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  exportDivider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginBottom: 14,
  },
  exportLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
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
