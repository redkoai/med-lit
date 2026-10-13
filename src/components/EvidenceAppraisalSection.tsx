import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import type { AppraisalJudgmentValue, JudgmentFeedback, StructuredAppraisal } from '../types';
import { SectionCard } from './SectionCard';

interface Props {
  appraisal: StructuredAppraisal;
  feedback?: JudgmentFeedback[];
  onAddFeedback?: (input: Omit<JudgmentFeedback, 'id' | 'createdAt' | 'analysisVersion'>) => Promise<void>;
}

const JUDGMENT_COLORS = {
  low: Colors.success,
  some_concerns: Colors.warning,
  high: Colors.danger,
  unclear: Colors.textSecondary,
  not_applicable: Colors.textTertiary,
};

const SUGGESTED_VALUES: AppraisalJudgmentValue[] = ['low', 'some_concerns', 'high', 'unclear', 'not_applicable'];

export function EvidenceAppraisalSection({ appraisal, feedback = [], onAddFeedback }: Props) {
  const evidenceById = new Map(appraisal.evidence.map((item) => [item.id, item]));
  const coverage = appraisal.sourceCoverage;
  const [teachingMode, setTeachingMode] = useState(false);
  const [selectedJudgment, setSelectedJudgment] = useState<string | null>(null);
  const [rating, setRating] = useState<JudgmentFeedback['rating']>('agree');
  const [suggestedJudgment, setSuggestedJudgment] = useState<AppraisalJudgmentValue>('unclear');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const closeFeedback = () => {
    setSelectedJudgment(null);
    setRating('agree');
    setSuggestedJudgment('unclear');
    setNote('');
  };

  return (
    <>
    <SectionCard
      title="Evidence-linked appraisal"
      icon="layers-outline"
      iconColor={Colors.science}
      badge={`${coverage.level.replace(/_/g, ' ')}`}
      badgeColor={coverage.level === 'full_text' ? Colors.success : Colors.warning}
      defaultExpanded
    >
      <TouchableOpacity
        accessibilityRole="switch"
        accessibilityState={{ checked: teachingMode }}
        accessibilityLabel="Guided critical appraisal teaching mode"
        onPress={() => setTeachingMode((current) => !current)}
        style={[styles.teachingToggle, teachingMode && styles.teachingToggleActive]}
      >
        <Ionicons name="school-outline" size={18} color={teachingMode ? Colors.accent : Colors.textSecondary} />
        <View style={styles.teachingText}>
          <Text style={styles.teachingTitle}>Guided appraisal mode</Text>
          <Text style={styles.teachingBody}>{teachingMode ? 'On — review the evidence before the generated rationale.' : 'Reveal short prompts for independently checking each domain.'}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.coverageBox}>
        <Text style={styles.coverageTitle}>Source coverage</Text>
        <Text style={styles.coverageText}>
          {coverage.analyzedCharacters.toLocaleString()} of {coverage.availableCharacters.toLocaleString()} available characters analyzed
          {coverage.wasTruncated ? ' · truncated' : ''}
        </Text>
        <Text style={styles.coverageText}>
          Sections found: {coverage.availableSections.length ? coverage.availableSections.join(', ') : 'none detected'}
        </Text>
        <Text style={styles.coverageText}>
          References: {coverage.referenceCount} parsed · {coverage.referencesResolved} identifiers resolved
        </Text>
        {coverage.pdfPages ? <Text style={styles.coverageText}>PDF pages extracted: {coverage.pdfPages}</Text> : null}
        {typeof coverage.extractedTableCount === 'number' ? <Text style={styles.coverageText}>Table structures or PDF row candidates detected: {coverage.extractedTableCount} (verify against source)</Text> : null}
        {coverage.supplementLinks?.length ? <Text style={styles.coverageText}>Supplement links detected: {coverage.supplementLinks.length} (review separately)</Text> : null}
        {coverage.retrievalWarnings.map((warning) => (
          <View key={warning} style={styles.warningRow}>
            <Ionicons name="warning-outline" size={14} color={Colors.warning} />
            <Text style={styles.warningText}>{warning}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.rubricText}>
        Rubric: {appraisal.rubricId} v{appraisal.rubricVersion}. These are structured decision-support questions, not a substitute for the official instrument or expert review.
      </Text>

      {appraisal.judgments.map((judgment) => {
        const linkedEvidence = judgment.evidenceIds
          .map((id) => evidenceById.get(id))
          .filter((item) => item?.verified);
        const color = JUDGMENT_COLORS[judgment.judgment];
        return (
          <View key={judgment.id} style={styles.judgmentCard}>
            <View style={styles.judgmentHeader}>
              <Text style={styles.domain}>{judgment.domain}</Text>
              <View style={[styles.judgmentBadge, { backgroundColor: `${color}18` }]}>
                <Text style={[styles.judgmentBadgeText, { color }]}>
                  {judgment.judgment.replace(/_/g, ' ').toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.question}>{judgment.question}</Text>
            {teachingMode ? (
              <View style={styles.coachBox}>
                <Text style={styles.coachTitle}>Check it yourself</Text>
                <Text style={styles.coachText}>Read the linked passage in context. Ask whether it directly answers this question, what remains unreported, and whether the generated rationale adds anything the source does not say.</Text>
              </View>
            ) : null}
            <Text style={styles.rationale}>{judgment.rationale}</Text>
            {linkedEvidence.map((evidence) => evidence ? (
              <View key={evidence.id} style={styles.quoteBox}>
                <Text style={styles.quote}>“{evidence.quote}”</Text>
                <Text style={styles.quoteMeta}>
                  Verified in supplied text{evidence.location ? ` · ${evidence.location}` : evidence.section ? ` · ${evidence.section}` : ''}
                </Text>
              </View>
            ) : null)}
            {!linkedEvidence.length && judgment.judgment !== 'not_applicable' ? (
              <Text style={styles.noEvidence}>No verified supporting passage; judgment is treated as unclear.</Text>
            ) : null}
            {onAddFeedback ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Review generated judgment for ${judgment.domain}`}
                onPress={() => setSelectedJudgment(judgment.id)}
                style={styles.feedbackButton}
              >
                <Ionicons name="chatbox-ellipses-outline" size={15} color={Colors.accent} />
                <Text style={styles.feedbackButtonText}>Review this judgment</Text>
                {feedback.filter((item) => item.judgmentId === judgment.id).length ? (
                  <Text style={styles.feedbackCount}>{feedback.filter((item) => item.judgmentId === judgment.id).length} saved</Text>
                ) : null}
              </TouchableOpacity>
            ) : null}
          </View>
        );
      })}
    </SectionCard>
    <Modal visible={selectedJudgment !== null} transparent animationType="fade" onRequestClose={closeFeedback}>
      <Pressable style={styles.modalOverlay} onPress={closeFeedback}>
        <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.modalTitle}>Review generated judgment</Text>
          <Text style={styles.modalBody}>Your review is saved with this analysis version. It does not silently overwrite the model output.</Text>
          <View style={styles.ratingRow}>
            {(['agree', 'disagree', 'unsure'] as const).map((value) => (
              <TouchableOpacity key={value} accessibilityRole="radio" accessibilityState={{ selected: rating === value }} onPress={() => setRating(value)} style={[styles.ratingChip, rating === value && styles.ratingChipActive]}>
                <Text style={[styles.ratingText, rating === value && styles.ratingTextActive]}>{value}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {rating === 'disagree' ? (
            <View style={styles.suggestionWrap}>
              <Text style={styles.fieldLabel}>Suggested judgment</Text>
              <View style={styles.suggestionRow}>
                {SUGGESTED_VALUES.map((value) => (
                  <TouchableOpacity key={value} accessibilityRole="radio" accessibilityState={{ selected: suggestedJudgment === value }} onPress={() => setSuggestedJudgment(value)} style={[styles.suggestionChip, suggestedJudgment === value && styles.suggestionChipActive]}>
                    <Text style={[styles.suggestionText, suggestedJudgment === value && styles.suggestionTextActive]}>{value.replace(/_/g, ' ')}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}
          <Text style={styles.fieldLabel}>Review note</Text>
          <TextInput accessibilityLabel="Reviewer note" value={note} onChangeText={setNote} multiline placeholder="What evidence or interpretation should be reconsidered?" placeholderTextColor={Colors.textTertiary} style={styles.noteInput} />
          <View style={styles.modalActions}>
            <TouchableOpacity accessibilityRole="button" onPress={closeFeedback} style={styles.cancelButton}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              disabled={saving}
              onPress={async () => {
                if (!selectedJudgment || !onAddFeedback) return;
                setSaving(true);
                await onAddFeedback({
                  judgmentId: selectedJudgment,
                  rating,
                  suggestedJudgment: rating === 'disagree' ? suggestedJudgment : undefined,
                  note: note.trim() || undefined,
                });
                setSaving(false);
                closeFeedback();
              }}
              style={styles.saveButton}
            ><Text style={styles.saveText}>{saving ? 'Saving…' : 'Save review'}</Text></TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  coverageBox: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    gap: 5,
    marginTop: 6,
  },
  coverageTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary },
  coverageText: { fontSize: 12, lineHeight: 17, color: Colors.textSecondary },
  warningRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 3 },
  warningText: { flex: 1, fontSize: 12, lineHeight: 17, color: Colors.warning },
  rubricText: { fontSize: 12, lineHeight: 18, color: Colors.textSecondary, marginVertical: 10 },
  judgmentCard: {
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingVertical: 13,
    gap: 7,
  },
  judgmentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  domain: { flex: 1, fontSize: 14, fontWeight: '700', color: Colors.textPrimary },
  judgmentBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  judgmentBadgeText: { fontSize: 10, fontWeight: '800' },
  question: { fontSize: 13, lineHeight: 18, color: Colors.textSecondary },
  rationale: { fontSize: 13, lineHeight: 19, color: Colors.textPrimary },
  quoteBox: {
    backgroundColor: Colors.primaryMuted,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    borderRadius: 8,
    padding: 10,
    gap: 5,
  },
  quote: { fontSize: 12, lineHeight: 18, color: Colors.textPrimary },
  quoteMeta: { fontSize: 10, fontWeight: '600', color: Colors.success },
  noEvidence: { fontSize: 11, fontStyle: 'italic', color: Colors.textTertiary },
  teachingToggle: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, padding: 11, marginTop: 8 },
  teachingToggleActive: { borderColor: Colors.accent, backgroundColor: Colors.accentLight },
  teachingText: { flex: 1, gap: 2 },
  teachingTitle: { color: Colors.textPrimary, fontSize: 13, fontWeight: '800' },
  teachingBody: { color: Colors.textSecondary, fontSize: 11, lineHeight: 16 },
  coachBox: { backgroundColor: Colors.accentLight, borderRadius: 9, padding: 10, gap: 3 },
  coachTitle: { color: Colors.accent, fontSize: 11, fontWeight: '800' },
  coachText: { color: Colors.textSecondary, fontSize: 11, lineHeight: 16 },
  feedbackButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, borderRadius: 10, backgroundColor: Colors.accentLight },
  feedbackButtonText: { color: Colors.accent, fontSize: 11, fontWeight: '800' },
  feedbackCount: { color: Colors.textSecondary, fontSize: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.52)', alignItems: 'center', justifyContent: 'center', padding: 18 },
  modalCard: { width: '100%', maxWidth: 560, borderRadius: 18, backgroundColor: Colors.surface, padding: 18, gap: 12 },
  modalTitle: { color: Colors.textPrimary, fontSize: 19, fontWeight: '800' },
  modalBody: { color: Colors.textSecondary, fontSize: 12, lineHeight: 18 },
  ratingRow: { flexDirection: 'row', gap: 8 },
  ratingChip: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: 10 },
  ratingChipActive: { borderColor: Colors.accent, backgroundColor: Colors.accent },
  ratingText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  ratingTextActive: { color: '#fff' },
  fieldLabel: { color: Colors.textPrimary, fontSize: 12, fontWeight: '800' },
  suggestionWrap: { gap: 8 },
  suggestionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  suggestionChip: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 10, borderWidth: 1, borderColor: Colors.border, borderRadius: 9 },
  suggestionChipActive: { borderColor: Colors.science, backgroundColor: Colors.scienceLight },
  suggestionText: { color: Colors.textSecondary, fontSize: 11, fontWeight: '700' },
  suggestionTextActive: { color: Colors.science },
  noteInput: { minHeight: 90, borderWidth: 1, borderColor: Colors.border, borderRadius: 11, padding: 11, color: Colors.textPrimary, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 9 },
  cancelButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 15 },
  cancelText: { color: Colors.textSecondary, fontWeight: '700' },
  saveButton: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 10, backgroundColor: Colors.accent },
  saveText: { color: '#fff', fontWeight: '800' },
});
