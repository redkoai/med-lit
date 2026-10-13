import { Text, View } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { GuidePage, guide as g } from "../../src/components/GuidePage";
import { GUIDES } from "../../src/content/guides";
export function generateStaticParams() {
  return GUIDES.map((item) => ({ slug: item.slug }));
}
export default function Guide() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const item = GUIDES.find((item) => item.slug === slug);
  if (!item)
    return (
      <GuidePage
        title="Guide not found"
        description="Choose a guide from the collection."
        path="/guides"
      >
        <Link href="/guides">All guides</Link>
      </GuidePage>
    );
  return (
    <GuidePage
      title={item.title}
      description={item.description}
      path={`/guides/${item.slug}`}
      active="guides"
    >
      <Text style={g.body}>By the MedLit team · Updated October 13, 2026</Text>
      {item.sections.map((section) => (
        <View key={section.heading} style={g.card}>
          <Text role="heading" aria-level={2} style={g.heading}>
            {section.heading}
          </Text>
          <Text style={g.body}>{section.text}</Text>
        </View>
      ))}
      <View style={g.card}>
        <Text role="heading" aria-level={2} style={g.heading}>
          Sources and next steps
        </Text>
        {item.sources.map((source) => (
          <Link key={source.url} href={source.url as never} style={g.linkText}>
            {source.label} ↗
          </Link>
        ))}
      </View>
      <View style={g.card}>
        <Text role="heading" aria-level={2} style={g.heading}>
          Try it with a paper
        </Text>
        <Text style={g.body}>
          Explore the teaching example without an account, or bring a paper and
          connect your own AI provider.
        </Text>
        <Link href="/example" style={g.linkText}>
          Explore the example appraisal
        </Link>
        <Link href="/" style={g.linkText}>
          Appraise a paper in MedLit
        </Link>
      </View>
      <Link href="/guides" style={g.linkText}>
        All guides
      </Link>
    </GuidePage>
  );
}
