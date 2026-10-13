import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { WorkspaceIcon as Ionicons } from "./WorkspaceIcon";
import { Colors as C } from "../constants/colors";
import {
  createExampleAppraisal,
  EXAMPLE_PASSAGES,
} from "../services/exampleAppraisal";
import { AppraisalScore } from "./AppraisalScore";
import { MotionPress, MotionReveal } from "./WorkspaceMotion";

const readings = [
  {
    label: "Reported strength",
    icon: "checkmark-circle-outline",
    color: "#047857",
    tint: "#EDF8F2",
    title: "Randomization is described",
    passage: EXAMPLE_PASSAGES.randomization,
    detail:
      "A generated sequence and central concealment are reported. This supports the description—not proof that the method was implemented correctly.",
  },
  {
    label: "Concern",
    icon: "alert-circle-outline",
    color: "#9A641B",
    tint: "#FFF7E8",
    title: "Missing outcomes need a closer look",
    passage: EXAMPLE_PASSAGES.missing,
    detail:
      "One in five outcomes is missing. Without reasons or group counts, we cannot determine the impact on the result.",
  },
  {
    label: "Unknown",
    icon: "help-circle-outline",
    color: C.textSecondary,
    tint: "#F0F2F7",
    title: "A protocol is not supplied",
    passage: null,
    detail:
      "No preregistration or analysis plan is supplied in this excerpt. “Not reported” is not the same as “not done.” This question remains unclear.",
  },
] as const;

export function ResearchPreview() {
  const [selected, setSelected] = useState(1);
  const analysis = useMemo(createExampleAppraisal, []);
  const item = readings[selected];
  return (
    <View style={s.preview}>
      <View style={s.top}>
        <View style={s.windowDots} accessible={false}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={s.dot} />
          ))}
        </View>
        <Text style={s.caption}>Inside an appraisal</Text>
        <Ionicons name="reader-outline" color={C.textSecondary} size={18} />
      </View>
      <View style={s.paper}>
        <Text style={s.example}>Fictional teaching example · no AI call</Text>
        <Text role="heading" aria-level={2} style={s.title}>
          A reading app and self-reported concentration
        </Text>
        <Text style={s.caption}>
          120 participants / 4 weeks / randomized design
        </Text>
        <View
          style={s.choices}
          accessibilityLabel="Explore the example findings"
        >
          {readings.map((reading, index) => (
            <MotionPress
              accessibilityRole="button"
              accessibilityLabel={reading.label}
              accessibilityState={{ selected: selected === index }}
              key={reading.label}
              onPress={() => setSelected(index)}
              style={[
                s.choice,
                selected === index && {
                  borderColor: reading.color,
                  backgroundColor: reading.tint,
                },
              ]}
            >
              <Ionicons name={reading.icon} size={17} color={reading.color} />
              <Text
                style={[
                  s.choiceText,
                  {
                    color: selected === index ? reading.color : C.textSecondary,
                  },
                ]}
              >
                {reading.label}
              </Text>
            </MotionPress>
          ))}
        </View>
        <MotionReveal
          key={selected}
          style={s.finding}
          accessibilityLiveRegion="polite"
        >
          <View style={s.findingHeading}>
            <Ionicons name={item.icon} size={22} color={item.color} />
            <Text style={s.findingTitle}>{item.title}</Text>
          </View>
          {item.passage && (
            <View
              style={[
                s.quote,
                { borderColor: item.color, backgroundColor: item.tint },
              ]}
            >
              <Text selectable style={s.quoteText}>
                “{item.passage}”
              </Text>
              <Text style={[s.match, { color: item.color }]}>
                Exact match in the fictional source
              </Text>
            </View>
          )}
          <Text style={s.body}>{item.detail}</Text>
        </MotionReveal>
        <MotionPress
          accessibilityRole="link"
          onPress={() => router.push("/example" as never)}
          style={s.open}
        >
          <Text style={s.openText}>Explore the complete example</Text>
          <Ionicons name="arrow-forward" size={18} color={C.accent} />
        </MotionPress>
      </View>
      <AppraisalScore analysis={analysis} />
    </View>
  );
}

const s = StyleSheet.create({
  preview: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DCE0EC",
    overflow: "hidden",
    backgroundColor: "#EEF0F7",
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    minHeight: 48,
    gap: 12,
  },
  windowDots: { flexDirection: "row", gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#A7AEC3" },
  caption: { color: C.textSecondary, fontSize: 13, lineHeight: 21 },
  paper: {
    margin: 10,
    marginTop: 0,
    padding: 22,
    borderRadius: 12,
    backgroundColor: "#fff",
    gap: 14,
  },
  example: { fontSize: 13, lineHeight: 21, color: C.accent, fontWeight: "600" },
  title: {
    color: C.primary,
    fontSize: 23,
    lineHeight: 31,
    fontWeight: "600",
    letterSpacing: -0.4,
  },
  choices: { flexDirection: "row", flexWrap: "wrap", gap: 7, paddingTop: 8 },
  choice: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 9,
    gap: 6,
  },
  choiceText: { fontSize: 13, fontWeight: "600" },
  finding: { gap: 14, minHeight: 235 },
  findingHeading: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginTop: 5,
  },
  findingTitle: {
    flex: 1,
    color: C.primary,
    fontSize: 17,
    lineHeight: 25,
    fontWeight: "600",
  },
  quote: { borderLeftWidth: 3, padding: 15, gap: 12, borderRadius: 3 },
  quoteText: { fontSize: 16, lineHeight: 26, color: C.primary },
  match: { fontSize: 12, fontWeight: "600", lineHeight: 20 },
  body: { color: C.textSecondary, fontSize: 15, lineHeight: 25 },
  open: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  openText: { color: C.accent, fontSize: 14, fontWeight: "600", flexShrink: 1 },
});
