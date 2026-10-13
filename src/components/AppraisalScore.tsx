import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors as C } from "../constants/colors";
import { appraisalScore } from "../services/appraisalScore";
import type { ArticleAnalysis } from "../types";
export function AppraisalScore({
  analysis,
  expanded = false,
}: {
  analysis: ArticleAnalysis;
  expanded?: boolean;
}) {
  const [open, setOpen] = useState(expanded);
  const a = analysis.appraisal;
  const parts = appraisalScore(a.sourceCoverage.level, a.evidence, a.judgments);
  return (
    <View style={s.card} dataSet={{ motion: "finding" }}>
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <Text style={s.eyebrow}>Appraisal confidence</Text>
          <Text role="heading" aria-level={2} style={s.title}>
            A score you can look inside.
          </Text>
        </View>
        <View style={s.number}>
          <Text style={s.score}>{analysis.evidenceScore.score}</Text>
          <Text style={s.outOf}>/ 10</Text>
        </View>
      </View>
      <View
        style={s.segments}
        accessibilityRole="image"
        accessibilityLabel={`Appraisal confidence ${analysis.evidenceScore.score} out of 10`}
      >
        {Array.from({ length: 10 }, (_, i) => (
          <View
            key={i}
            style={[
              s.segment,
              i < analysis.evidenceScore.score && { backgroundColor: C.accent },
            ]}
          />
        ))}
      </View>
      <Text style={s.body}>
        Source coverage, matched quotations, and assessable questions. Not a
        measure of a paper’s truth, accuracy, or clinical usefulness.
      </Text>
      <Pressable
        accessibilityRole="button"
        aria-expanded={open}
        onPress={() => setOpen((v) => !v)}
        style={s.expand}
      >
        <Text style={s.link}>
          {open ? "Hide score breakdown −" : "How is this score calculated? +"}
        </Text>
      </Pressable>
      {open && (
        <View style={{ gap: 14 }}>
          {[
            {
              name: "Source coverage",
              value: parts.coverage,
              max: 4,
              detail: a.sourceCoverage.level.replaceAll("_", " "),
            },
            {
              name: "Quotation matching",
              value: parts.quotation,
              max: 3,
              detail: `${parts.matched} of ${a.evidence.length} passages matched`,
            },
            {
              name: "Assessable questions",
              value: parts.assessment,
              max: 2,
              detail: `${parts.assessable} of ${a.judgments.length} questions`,
            },
          ].map((row) => (
            <View key={row.name}>
              <View style={s.row}>
                <Text style={s.metric}>{row.name}</Text>
                <Text style={s.metric}>
                  {(row.value * row.max).toFixed(1)} / {row.max}
                </Text>
              </View>
              <View style={s.track}>
                <View style={[s.fill, { width: `${row.value * 100}%` }]} />
              </View>
              <Text style={s.detail}>{row.detail}</Text>
            </View>
          ))}
          <Text style={s.detail}>
            Formula: round(1 + 4 × coverage + 3 × match ratio + 2 × assessable
            ratio), bounded to 1–10. Without matched evidence or assessable
            questions, the score is capped at 3.
          </Text>
          <Text style={s.detail}>
            Full text gives 1.0 coverage; an abstract gives 0.45. Abstract-only
            reports retain a “lower” confidence label even if the numeric
            heuristic is higher.{" "}
            {parts.capped
              ? "The insufficient-evidence cap applies here."
              : "A matched quotation does not prove the interpretation is correct."}
          </Text>
          {parts.score !== analysis.evidenceScore.score && (
            <Text style={s.detail}>
              This saved report uses an earlier calculation. Its original score
              is preserved; the breakdown above uses the current v4.1 formula.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#DCE0EC",
    borderRadius: 18,
    padding: 24,
    backgroundColor: "#F8F8FD",
    gap: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  eyebrow: {
    color: C.accent,
    fontSize: 13,
    fontWeight: "700",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: C.primary,
    lineHeight: 27,
    marginTop: 8,
  },
  number: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  score: {
    color: C.accent,
    fontSize: 52,
    fontWeight: "600",
    letterSpacing: -2,
  },
  outOf: { color: C.textSecondary, fontSize: 14 },
  segments: { flexDirection: "row", gap: 5 },
  segment: { flex: 1, height: 8, borderRadius: 3, backgroundColor: "#DDDEEC" },
  body: { fontSize: 14, lineHeight: 23, color: C.textSecondary },
  expand: { minHeight: 44, justifyContent: "center" },
  link: { color: C.accent, fontSize: 14, fontWeight: "600" },
  metric: { color: C.primary, fontSize: 14, fontWeight: "600" },
  track: {
    height: 5,
    backgroundColor: "#D6E7EB",
    borderRadius: 3,
    marginVertical: 8,
    overflow: "hidden",
  },
  fill: { height: 5, backgroundColor: C.accent },
  detail: { fontSize: 14, lineHeight: 23, color: C.textSecondary },
});
