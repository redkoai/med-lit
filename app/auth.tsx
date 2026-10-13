import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { MotionPress as Pressable } from "../src/components/WorkspaceMotion";
import { configuredAccountProviders } from "../src/services/accountProviderAvailability";
import { router, useLocalSearchParams } from "expo-router";
import { GuidePage, guide as g } from "../src/components/GuidePage";
import { useAuth } from "../src/hooks/useAuth";
import { isFirebaseConfigured } from "../src/services/firebase";
import SocialButtons from "../src/components/SocialButtons";
import { Colors as C } from "../src/constants/colors";

export default function AuthScreen() {
  const params = useLocalSearchParams<{ url?: string; mode?: string }>();
  const {
    user,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithApple,
    resetPassword,
  } = useAuth();
  const [mode, setMode] = useState(
    params.mode === "sign_up" ? "sign_up" : "sign_in",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const configured = isFirebaseConfigured();
  const available = configuredAccountProviders(configured, Platform.OS);
  const back = () =>
    router.replace({
      pathname: "/",
      params: {
        url: typeof params.url === "string" ? params.url.slice(0, 2048) : "",
      },
    });
  const submit = async (social?: "google" | "apple") => {
    if (busy || !configured) return;
    setError("");
    setMessage("");
    if (!social && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }
    if (
      !social &&
      mode !== "reset" &&
      (!password || (mode === "sign_up" && password.length < 12))
    ) {
      setError(
        mode === "sign_up"
          ? "Use at least 12 characters for your password."
          : "Enter your password.",
      );
      return;
    }
    setBusy(true);
    try {
      if (social === "google") await signInWithGoogle();
      else if (social === "apple") await signInWithApple();
      else if (mode === "reset") {
        await resetPassword(email.trim());
        setMessage(
          "If this email has an account, a reset link will arrive shortly. Check your inbox and spam folder.",
        );
        return;
      } else if (mode === "sign_up") await signUp(email.trim(), password);
      else await signIn(email.trim(), password);
      setPassword("");
      back();
    } catch (err) {
      const code =
        typeof err === "object" && err && "code" in err ? String(err.code) : "";
      setError(
        code.includes("popup-closed") || code.includes("canceled")
          ? "Sign-in was cancelled. Your paper has not been appraised. Try again when you’re ready."
          : code.includes("popup-blocked")
            ? "Your browser blocked the sign-in window. Allow pop-ups for MedLit, or continue with email."
            : code.includes("account-exists-with-different-credential")
              ? "Use the sign-in method you originally chose for this email. MedLit will not merge accounts without verification."
              : code.includes("operation-not-allowed") ||
                  code.includes("unauthorized-domain")
                ? "This sign-in connection is not available on this deployment. Continue as a guest while the operator finishes setup."
                : code.includes("too-many-requests")
                  ? "Too many attempts. Please wait before trying again."
                  : "Sign-in could not be completed. Check your details and connection, or reset your password.",
      );
    } finally {
      setBusy(false);
    }
  };
  const title = user
    ? "Your research, together."
    : mode === "sign_up"
      ? "Make room for your research."
      : mode === "reset"
        ? "Let’s get you back in."
        : "Welcome back to your reading.";
  return (
    <GuidePage
      title={title}
      description="An optional MedLit account keeps your saved appraisals together across devices. It is separate from your AI provider and never stores provider keys."
      path="/auth"
    >
      <View style={s.columns}>
        <View style={[g.card, { flex: 1, minWidth: 260 }]}>
          {!configured ? (
            <>
              <Text role="heading" aria-level={2} style={g.heading}>
                Your account options
              </Text>
              <SocialButtons
                busy={busy}
                googleReady={false}
                appleReady={false}
                onGoogle={() => {}}
                onApple={() => {}}
              />
              <Text style={g.body}>
                Device-only mode is available now. Cloud accounts are not
                enabled on this deployment yet. Connect your AI, appraise
                papers, save them on this device, and export backups without
                signing up.
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={back}
                style={g.button}
              >
                <Text style={g.buttonText}>Continue on this device</Text>
              </Pressable>
            </>
          ) : user ? (
            <>
              <Text style={g.heading}>You’re signed in.</Text>
              <Pressable
                accessibilityRole="link"
                onPress={() => router.push("/history")}
                style={g.button}
              >
                <Text style={g.buttonText}>Open your library</Text>
              </Pressable>
              <Pressable
                accessibilityRole="link"
                onPress={() => router.push("/profile")}
                style={g.link}
              >
                <Text style={g.linkText}>Account and data controls</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={g.heading}>
                {mode === "sign_up"
                  ? "Create a free account"
                  : mode === "reset"
                    ? "Reset your password"
                    : "Sign in to MedLit"}
              </Text>
              {mode !== "reset" && (
                <SocialButtons
                  busy={busy}
                  googleReady={available.google}
                  appleReady={available.apple}
                  onGoogle={() => void submit("google")}
                  onApple={() => void submit("apple")}
                />
              )}
              {mode !== "reset" && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: showEmail }}
                  disabled={busy}
                  onPress={() => setShowEmail((v) => !v)}
                  style={s.emailToggle}
                >
                  <Text style={g.linkText}>
                    {showEmail ? "Hide email form" : "Continue with email"}
                  </Text>
                </Pressable>
              )}
              {(showEmail || mode === "reset") && (
                <>
                  <Text style={s.label}>Email</Text>
                  <TextInput
                    accessibilityLabel="Email"
                    autoComplete="email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                    style={s.input}
                    placeholder="you@example.com"
                    editable={!busy}
                  />
                  {mode !== "reset" && (
                    <>
                      <Text style={s.label}>Password</Text>
                      <TextInput
                        accessibilityLabel="Password"
                        secureTextEntry={!showPassword}
                        autoComplete={
                          mode === "sign_up"
                            ? "new-password"
                            : "current-password"
                        }
                        value={password}
                        onChangeText={setPassword}
                        style={s.input}
                        placeholder={
                          mode === "sign_up"
                            ? "At least 12 characters"
                            : "Your password"
                        }
                        editable={!busy}
                        onSubmitEditing={() => submit()}
                      />
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => setShowPassword((v) => !v)}
                        style={g.link}
                      >
                        <Text style={g.linkText}>
                          {showPassword ? "Hide password" : "Show password"}
                        </Text>
                      </Pressable>
                    </>
                  )}
                  <Pressable
                    accessibilityRole="button"
                    disabled={busy}
                    onPress={() => submit()}
                    style={g.button}
                  >
                    {busy ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={g.buttonText}>
                        {mode === "sign_up"
                          ? "Create account"
                          : mode === "reset"
                            ? "Send reset link"
                            : "Sign in"}
                      </Text>
                    )}
                  </Pressable>
                </>
              )}
              {mode !== "reset" && (
                <View style={s.legal}>
                  <Text style={s.legalText}>
                    By continuing, you agree to the Terms of use and acknowledge
                    the Privacy notice. Your AI subscription, credits and
                    provider key are separate from this account.
                  </Text>
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 24 }}
                  >
                    <Pressable
                      accessibilityRole="link"
                      onPress={() => router.push("/terms" as never)}
                      style={g.link}
                    >
                      <Text style={g.linkText}>Terms of use</Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="link"
                      onPress={() => router.push("/privacy" as never)}
                      style={g.link}
                    >
                      <Text style={g.linkText}>Privacy notice</Text>
                    </Pressable>
                  </View>
                </View>
              )}
              {error ? (
                <Text
                  accessibilityRole="alert"
                  style={{ color: C.danger, lineHeight: 23 }}
                >
                  {error}
                </Text>
              ) : null}
              {message ? (
                <Text accessibilityLiveRegion="polite" style={g.body}>
                  {message}
                </Text>
              ) : null}
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setMode(mode === "sign_in" ? "sign_up" : "sign_in");
                  setError("");
                  setMessage("");
                }}
                style={g.link}
              >
                <Text style={g.linkText}>
                  {mode === "sign_in"
                    ? "New here? Create an account"
                    : "Already have an account? Sign in"}
                </Text>
              </Pressable>
              {mode === "sign_in" && (
                <Pressable
                  accessibilityRole="button"
                  disabled={busy}
                  onPress={() => setMode("reset")}
                  style={g.link}
                >
                  <Text style={g.linkText}>Forgot your password?</Text>
                </Pressable>
              )}
              <Pressable
                accessibilityRole="button"
                onPress={back}
                style={g.link}
              >
                <Text style={g.linkText}>Continue as guest</Text>
              </Pressable>
            </>
          )}
        </View>
        <View style={s.benefits}>
          <Text style={g.heading}>Your work stays yours.</Text>
          {[
            "Reopen full reports without another AI charge.",
            "Keep private notes, collections, and versioned appraisals.",
            "Guest work is never uploaded automatically. Choose what to import.",
            "Export your library or delete your account. No lock-in.",
          ].map((text) => (
            <Text key={text} style={g.body}>
              ✓ {text}
            </Text>
          ))}
          <Pressable
            accessibilityRole="link"
            onPress={() => router.push("/privacy" as never)}
            style={g.link}
          >
            <Text style={g.linkText}>How we handle your data →</Text>
          </Pressable>
        </View>
      </View>
    </GuidePage>
  );
}
const s = StyleSheet.create({
  columns: { flexDirection: "row", flexWrap: "wrap", gap: 30 },
  benefits: { flex: 0.8, minWidth: 240, gap: 22, paddingVertical: 22 },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: "#CFD4E1",
    borderRadius: 10,
    paddingHorizontal: 13,
    color: C.primary,
    fontSize: 16,
  },
  label: { fontSize: 14, color: C.primary, fontWeight: "600" },
  emailToggle: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
  },
  legal: { paddingTop: 16, borderTopWidth: 1, borderColor: C.border, gap: 4 },
  legalText: { fontSize: 13, lineHeight: 21, color: C.textSecondary },
});
