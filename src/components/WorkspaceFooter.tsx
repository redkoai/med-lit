import { StyleSheet, Text, View, Platform } from "react-native";
import { Link, router } from "expo-router";
import { Colors as C } from "../constants/colors";
import { MotionPress } from "./WorkspaceMotion";
export function WorkspaceFooter() {
  return (
    <View style={s.footer}>
      <Text style={s.note}>MedLit · Scientific judgment stays with you.</Text>
      <View style={s.links}>
        {[
          ["Research guides", "/guides"],
          ["About Redko", "/about#redko"],
          ["FAQ", "/faq"],
          ["Privacy", "/privacy"],
          ["Terms", "/terms"],
        ].map(([label, path]) => (
          Platform.OS === "web" && path.includes("#") ? <Text key={path} style={s.note}><a href={path} style={{color:"inherit",textDecoration:"none"}}>{label}</a></Text> : <Link key={path} href={path as never} style={s.note}>{label}</Link>
        ))}
      </View>
    </View>
  );
}
const s = StyleSheet.create({
  footer: {
    width: "100%",
    maxWidth: 940,
    alignSelf: "center",
    padding: 24,
    marginTop: 24,
    gap: 12,
    borderTopWidth: 1,
    borderColor: C.border,
  },
  links: { flexDirection: "row", flexWrap: "wrap", gap: 24 },
  link: { minHeight: 44, justifyContent: "center" },
  note: { color: C.textSecondary, fontSize: 14, lineHeight: 23 },
});
