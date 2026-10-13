import { Text, View } from "react-native";
import { Link } from "expo-router";
import { GuidePage, guide as g } from "../../src/components/GuidePage";
import { GUIDES } from "../../src/content/guides";
export default function Guides() {
  return (
    <GuidePage
      title="A field guide to reading research"
      description="Prepare for journal club, appraise a trial, and check what an AI paper review can actually tell you. Start with the question you have."
      path="/guides"
      active="guides"
    >
      {GUIDES.map((item) => (
        <View key={item.slug} style={g.card}>
          <Link href={`/guides/${item.slug}` as never} style={g.heading}>
            {item.title}
          </Link>
          <Text style={g.body}>{item.description}</Text>
        </View>
      ))}
    </GuidePage>
  );
}
