import React, { useRef } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors } from "../constants/colors";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { WorkspaceFooter } from "./WorkspaceFooter";
import { MotionPress } from "./WorkspaceMotion";
import { LEGAL_CONTACT, LEGAL_ENTITY, LEGAL_STATUS } from "../legal/config";

export interface PolicySection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export function PolicyScreen({
  title,
  effective,
  intro,
  sections,
}: {
  title: string;
  effective: string;
  intro: string;
  sections: PolicySection[];
}) {
  const scroll = useRef<ScrollView>(null);
  const positions = useRef<Record<string, number>>({});
  const top = useRef(0);
  return (
    <ScrollView
      ref={scroll}
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <WorkspaceHeader />
      <View
        style={styles.content}
        role={"main" as never}
        onLayout={(event) => {
          top.current = event.nativeEvent.layout.y;
        }}
      >
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        <Text style={styles.effective}>{LEGAL_STATUS} · Review version {effective}</Text>
        <View style={styles.contents}>
          <Text style={styles.body}>
            This is a review draft, not a finalized agreement. The contracting entity,
            monitored privacy contact, jurisdiction, rights-request operations and
            legal review remain pending. A draft label does not suspend existing
            privacy duties or your rights.
          </Text>
          <Text style={styles.body}>Operator: {LEGAL_ENTITY}</Text>
          <Text style={styles.body}>Privacy contact: {LEGAL_CONTACT || "Pending verification"}</Text>
        </View>
        <Text style={styles.intro}>{intro}</Text>
        <View style={styles.contents}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>
            In this notice
          </Text>
          {sections.map((section) => (
            <MotionPress
              key={section.title}
              accessibilityRole="button"
              accessibilityLabel={`Jump to ${section.title}`}
              onPress={() =>
                scroll.current?.scrollTo({
                  y: top.current + (positions.current[section.title] ?? 0) - 16,
                  animated: false,
                })
              }
              style={styles.contentsLink}
            >
              <Text style={styles.contentsText}>{section.title}</Text>
            </MotionPress>
          ))}
        </View>
        {sections.map((section) => (
          <View
            key={section.title}
            style={styles.section}
            onLayout={(event) => {
              positions.current[section.title] = event.nativeEvent.layout.y;
            }}
          >
            <Text accessibilityRole="header" style={styles.sectionTitle}>
              {section.title}
            </Text>
            {section.paragraphs.map((paragraph) => (
              <Text key={paragraph} style={styles.body}>
                {paragraph}
              </Text>
            ))}
            {section.bullets?.map((bullet) => (
              <View key={bullet} style={styles.bulletRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{bullet}</Text>
              </View>
            ))}
          </View>
        ))}
        <Text style={styles.contact}>
          {LEGAL_CONTACT ? `Questions and privacy requests: ${LEGAL_CONTACT}` :
            "A monitored privacy-request and appeal channel must be verified before this draft becomes effective. Existing in-app export, deletion and consent controls remain available; their scope does not limit statutory rights."}
        </Text>
      </View>
      <WorkspaceFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    padding: 24,
    paddingTop: 44,
    paddingBottom: 32,
    width: "100%",
    maxWidth: 820,
    alignSelf: "center",
  },
  title: {
    fontSize: 36,
    lineHeight: 44,
    fontWeight: "600",
    color: Colors.primary,
  },
  effective: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 5,
    marginBottom: 18,
  },
  intro: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.textPrimary,
    marginBottom: 24,
  },
  section: {
    marginBottom: 26,
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: Colors.border,
  },
  sectionTitle: {
    fontSize: 21,
    lineHeight: 29,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  body: {
    fontSize: 16,
    lineHeight: 28,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  contents: {
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    marginBottom: 32,
  },
  contentsLink: { minHeight: 44, justifyContent: "center" },
  contentsText: { fontSize: 15, lineHeight: 23, color: Colors.accent },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 7,
    paddingLeft: 4,
  },
  bullet: {
    color: Colors.primary,
    fontWeight: "800",
    marginRight: 9,
    lineHeight: 22,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 27,
    color: Colors.textSecondary,
  },
  contact: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 18,
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
