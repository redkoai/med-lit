import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MotionPress } from "./WorkspaceMotion";
import { Colors as C } from "../constants/colors";
export type SocialButtonsProps = {
  busy: boolean;
  onGoogle: () => void;
  onApple: () => void;
  googleReady: boolean;
  appleReady: boolean;
};
export default function SocialButtons({
  busy,
  onGoogle,
  onApple,
  googleReady,
  appleReady,
}: SocialButtonsProps) {
  return (
    <View style={s.group}>
      <MotionPress
        accessibilityRole="button"
        accessibilityLabel="Continue with Google"
        disabled={busy || !googleReady}
        onPress={onGoogle}
        style={[s.button, (busy || !googleReady) && s.disabled]}
      >
        <Ionicons name="logo-google" size={20} color={C.primary} />
        <Text style={s.label}>Continue with Google</Text>
      </MotionPress>
      <MotionPress
        accessibilityRole="button"
        accessibilityLabel="Continue with Apple"
        disabled={busy || !appleReady}
        onPress={onApple}
        style={[s.button, s.apple, (busy || !appleReady) && s.disabled]}
      >
        <Ionicons name="logo-apple" size={23} color="#fff" />
        <Text style={[s.label, { color: "#fff" }]}>Continue with Apple</Text>
      </MotionPress>
      {(!googleReady || !appleReady) && (
        <Text style={s.note}>
          {!googleReady && !appleReady
            ? "Apple and Google sign-in are not enabled on this deployment yet."
            : `${!googleReady ? "Google" : "Apple"} sign-in is not enabled on this deployment yet.`}
        </Text>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  group: { gap: 12 },
  button: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: "#CFD4E1",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 14,
    backgroundColor: "#fff",
  },
  apple: { backgroundColor: "#000", borderColor: "#000" },
  disabled: { opacity: 0.5 },
  label: { color: C.primary, fontSize: 16, fontWeight: "600" },
  note: { color: C.textSecondary, fontSize: 13, lineHeight: 21 },
});
