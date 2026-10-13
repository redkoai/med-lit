import { StyleSheet, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { WorkspaceIcon as Ionicons } from "../src/components/WorkspaceIcon";
import { GuidePage, guide as g } from "../src/components/GuidePage";
import { MotionPress } from "../src/components/WorkspaceMotion";
import { Colors as C } from "../src/constants/colors";

import { REDKO_NETWORK, redkoDirectorySchema } from "../src/constants/redkoNetwork";

export default function AboutScreen() {
  return (
    <GuidePage
      title="Research literacy, for more of us."
      description="Our mission is to help people understand how research earns its conclusions—and where the evidence leaves room for doubt."
      path="/about"
      active="about"
      structuredData={{"@context":"https://schema.org","@graph":[{"@context":"https://schema.org","@type":"AboutPage",name:"About MedLit and Redko",url:"https://medlit-evidence-appraisal.vercel.app/about"},redkoDirectorySchema("https://medlit-evidence-appraisal.vercel.app/about#redko")]}}
    >
      <View style={s.statement}>
        <Ionicons name="compass-outline" size={38} color={C.accent} />
        <Text style={s.statementText}>
          A better relationship with research starts with being able to question
          it.
        </Text>
        <Text style={g.body}>
          A headline, a journal name, or a confident AI answer is not enough.
          MedLit gives curious readers, students, and researchers a structured
          place to examine a paper’s methods, source passages, missing
          information, and limitations.
        </Text>
      </View>
      <Text role="heading" aria-level={2} style={g.heading}>
        What we’re building toward
      </Text>
      {[
        [
          "Evidence you can inspect",
          "Each assessable judgment should lead back to the text that supports it. A matched quotation helps you check an interpretation; it does not prove the interpretation is correct.",
        ],
        [
          "Uncertainty you can see",
          "Missing methods, abstract-only coverage, and unsupported claims should remain visible. “Unknown” is a useful answer, not a product failure to disguise.",
        ],
        [
          "A reader who stays in control",
          "Choose your own AI provider, review its costs and privacy settings, and decide what to save or share. An account is optional. Your provider keys stay out of cloud library sync.",
        ],
        [
          "Learning that lasts beyond one paper",
          "Understand the questions behind an appraisal, annotate what matters to you, and return to a saved report without paying for another AI response.",
        ],
      ].map(([title, body]) => (
        <View key={title} style={s.principle}>
          <Text role="heading" aria-level={3} style={g.heading}>
            {title}
          </Text>
          <Text style={g.body}>{body}</Text>
        </View>
      ))}
      <View style={g.card}>
        <Text role="heading" aria-level={2} style={g.heading}>
          What we do not promise
        </Text>
        <Text style={g.body}>
          MedLit cannot certify that a paper is true, unbiased, reproducible, or
          appropriate for a patient. It does not replace peer review,
          systematic-review teams, domain expertise, or medical care. Our
          appraisal confidence score describes source coverage and
          assessability—not scientific truth.
        </Text>
        <MotionPress
          accessibilityRole="link"
          onPress={() => router.push("/methodology" as never)}
          style={g.link}
        >
          <Text style={g.linkText}>Read the methodology</Text>
        </MotionPress>
      </View>
      <View nativeID="redko" style={s.principle}>
        <Text role="heading" aria-level={2} style={g.heading}>About Redko</Text>
        <Text style={g.body}>MedLit is part of the products and initiatives built by Redko and founder Anya Ozmen. Explore the work that fits what you want to do next.</Text>
        {REDKO_NETWORK.filter(project => project.id !== 'medlit').map(project => <View key={project.id} style={{gap:6}}>
          <Link href={project.url} style={g.linkText}>{project.name}</Link>
          <Text style={g.body}>{project.description}</Text>
        </View>)}
        <Text style={g.body}>Each product has its own account and privacy choices. Following a link does not share your MedLit library or API keys.</Text>
      </View>
      <View style={s.actions}>
        <MotionPress
          accessibilityRole="link"
          onPress={() => router.push("/example" as never)}
          style={g.button}
        >
          <Text style={g.buttonText}>Explore an example</Text>
        </MotionPress>
        <MotionPress
          accessibilityRole="link"
          onPress={() => router.push("/")}
          style={g.link}
        >
          <Text style={g.linkText}>Bring your own paper</Text>
        </MotionPress>
      </View>
    </GuidePage>
  );
}
const s = StyleSheet.create({
  statement: { gap: 22, paddingVertical: 24 },
  statementText: {
    fontSize: 28,
    lineHeight: 38,
    fontWeight: "500",
    color: C.primary,
    maxWidth: 700,
  },
  principle: {
    borderTopWidth: 1,
    borderColor: C.border,
    paddingVertical: 22,
    gap: 12,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    flexWrap: "wrap",
  },
});
