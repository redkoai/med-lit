import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WorkspaceIcon as Ionicons } from "../src/components/WorkspaceIcon";
import { Colors as C } from "../src/constants/colors";
import { PROVIDERS, providerKey } from "../src/constants/providers";
import { useAuth } from "../src/hooks/useAuth";
import { useSettings } from "../src/hooks/useSettings";
import { useHistory } from "../src/hooks/useHistory";
import { useAnalyzeArticle } from "../src/hooks/useAnalyzeArticle";
import { ConnectionSheet } from "../src/components/ConnectionSheet";
import { TerminalWorkspace } from "../src/components/TerminalWorkspace";
import { ResearchPreview } from "../src/components/ResearchPreview";
import { MotionPress as Pressable } from "../src/components/WorkspaceMotion";
import { WorkspaceHeader } from "../src/components/WorkspaceHeader";
import { LoadingState } from "../src/components/LoadingState";
import { PageMeta } from "../src/components/PageMeta";
import { isFirebaseConfigured } from "../src/services/firebase";

export default function HomeScreen() {
  const params = useLocalSearchParams<{ url?: string; connected?: string }>();
  const { user } = useAuth();
  const { settings, saveSettings, loaded } = useSettings(user?.uid);
  const { history, saveToHistory } = useHistory(user?.uid);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [clientReady, setClientReady] = useState(Platform.OS !== "web");
  useEffect(() => {
    setClientReady(true);
  }, []);
  // Static HTML and the first browser render must agree before measuring layout.
  const wide = clientReady && width >= 900;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [sheet, setSheet] = useState(false);
  const [accountPrompt, setAccountPrompt] = useState(false);
  const [guestChosen, setGuestChosen] = useState(false);
  const pending = useRef(false);
  const connected = Boolean(providerKey(settings));
  useEffect(() => {
    if (typeof params.url === "string") setUrl(params.url);
  }, [params.url]);
  const missing = useCallback(() => {
    pending.current = true;
    setSheet(true);
  }, []);
  const { handleAnalyze, fetchState, isLoading } = useAnalyzeArticle({
    url,
    settings,
    saveToHistory,
    onApiKeyMissing: missing,
  });
  const start = useCallback(() => {
    if (
      url.trim() &&
      connected &&
      !user &&
      !guestChosen &&
      isFirebaseConfigured()
    ) {
      setAccountPrompt(true);
      return;
    }
    void handleAnalyze();
  }, [url, connected, user, guestChosen, handleAnalyze]);
  // Connecting never starts a chargeable appraisal; the user presses Appraise after returning.
  const handoff = () => {
    pending.current = false;
    router.push({ pathname: "/chatgpt" as never, params: { url } });
  };
  const signup = () => {
    setAccountPrompt(false);
    router.push({ pathname: "/auth", params: { url, mode: "sign_up" } });
  };
  return (
    <>
      <PageMeta
        title="MedLit | Critical appraisal for journal club and research"
        description="Read beyond the abstract. Appraise a PubMed paper, inspect methods and bias, and prepare for journal club with source-linked AI analysis and your own model."
        path="/"
      />
      <ScrollView
        style={s.page}
        stickyHeaderIndices={Platform.OS === "web" ? undefined : [0]}
        contentContainerStyle={{ paddingBottom: Math.max(36, insets.bottom + 16) }}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
      >
        <WorkspaceHeader />
        {Platform.OS === "web" ? <TerminalWorkspace
          url={url} setUrl={setUrl} start={start} busy={isLoading} ready={loaded}
          connected={connected} provider={PROVIDERS[settings.aiProvider].name}
          connect={() => { pending.current = false; setSheet(true); }} handoff={handoff}
          error={fetchState.status === "error" ? fetchState.error : undefined}
          loading={<LoadingState state={fetchState} />} history={history}
        /> : <View style={s.content} role={"main" as never}>
          <View style={s.hero} dataSet={{ layout: "reading-hero" }}>
            <View style={s.heroLinks}>
              <Ionicons name="library-outline" size={19} color={C.accent} />
              <Text style={s.eyebrow}>Your research workspace</Text>
            </View>
            <Text
              role="heading"
              aria-level={1}
              style={[s.heading, !wide && { fontSize: 34, lineHeight: 40 }]}
            >
              Better questions. Clearer evidence.
            </Text>
            <Text style={s.description}>
              Look past the abstract. Explore a paper’s methods, spot unanswered
              questions, and see the passages behind each judgment.
            </Text>
          </View>
          <View
            style={[
              s.desk,
              wide && { flexDirection: "row", alignItems: "flex-start" },
            ]}
          >
            <View
              style={[s.left, { flex: wide ? 1.1 : undefined }]}
              dataSet={{ layout: "research-intake" }}
            >
              <View style={s.workbench} dataSet={{ motion: "paper" }}>
                <View style={s.panelTop}>
                  <View style={s.step}>
                    <Ionicons
                      name="document-text-outline"
                      size={24}
                      color={C.accent}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.panelTitle}>What are you reading?</Text>
                    <Text style={s.quiet}>
                      Start with a paper. Keep your judgment.
                    </Text>
                  </View>
                </View>
                <Text style={s.label}>Article link or DOI</Text>
                <View style={s.inputRow}>
                  <Ionicons
                    name="link-outline"
                    size={21}
                    color={C.textSecondary}
                  />
                  <TextInput
                    accessibilityLabel="Article URL or DOI"
                    value={url}
                    onChangeText={setUrl}
                    placeholder="10.1056/NEJMoa1511939"
                    placeholderTextColor={C.textTertiary}
                    style={s.input}
                    autoCapitalize="none"
                    autoCorrect={false}
                    maxLength={2048}
                    editable={!isLoading}
                    onSubmitEditing={start}
                    returnKeyType="go"
                  />
                </View>
                <Pressable
                  accessibilityRole="button"
                  disabled={isLoading || !loaded}
                  onPress={start}
                  style={[
                    s.primaryButton,
                    (isLoading || !loaded) && { opacity: 0.55 },
                  ]}
                  dataSet={{ motion: "press" }}
                >
                  <Text style={s.primaryText}>
                    {isLoading
                      ? "Reading the evidence…"
                      : "Appraise this paper"}
                  </Text>
                  <Ionicons name="arrow-forward" size={19} color="white" />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  disabled={isLoading}
                  onPress={() =>
                    setUrl("https://pubmed.ncbi.nlm.nih.gov/26551272/")
                  }
                  style={s.sample}
                >
                  <Text style={s.sampleText}>
                    Try a real paper: the SPRINT trial
                  </Text>
                  <Ionicons
                    name="add-circle-outline"
                    size={17}
                    color={C.accent}
                  />
                </Pressable>
                <Text style={s.quiet}>
                  PubMed, PMC, DOI, arXiv and supported journal links. We use
                  lawful sources and show when only an abstract is available.
                </Text>
                {fetchState.status === "error" && (
                  <Text accessibilityRole="alert" style={s.error}>
                    {fetchState.error}
                  </Text>
                )}
                {isLoading && <LoadingState state={fetchState} />}
                <View style={s.connection}>
                  <Ionicons
                    name={
                      connected ? "checkmark-circle" : "finger-print-outline"
                    }
                    size={23}
                    color={C.accent}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={s.connectionTitle}>
                      {connected
                        ? PROVIDERS[settings.aiProvider].name + " connected"
                        : "Connect your own AI"}
                    </Text>
                    <Text style={s.quiet}>
                      {connected
                        ? "Your provider’s billing applies. Ready when you are."
                        : "Your provider key stays in this device’s secure storage."}
                    </Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      connected ? "Change AI connection" : "Connect AI provider"
                    }
                    onPress={() => {
                      pending.current = false;
                      setSheet(true);
                    }}
                    style={s.link}
                  >
                    <Text style={s.linkText}>
                      {connected ? "Change" : "Connect"}
                    </Text>
                  </Pressable>
                </View>
                <Pressable
                  accessibilityRole="button"
                  onPress={handoff}
                  style={s.handoff}
                >
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={19}
                    color={C.primary}
                  />
                  <Text style={s.handoffText}>
                    Prefer an external chat? Review a source packet.
                  </Text>
                  <Ionicons name="arrow-forward" size={17} color={C.primary} />
                </Pressable>
              </View>
              <View style={s.truthNote}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={C.textSecondary}
                />
                <Text style={s.quiet}>
                  A reading aid, not a clinical verdict. MedLit cannot prove a
                  study is accurate or replace expert review.
                </Text>
              </View>
            </View>
            <View
              style={[s.right, { flex: wide ? 1 : undefined }]}
              dataSet={{ layout: "research-preview" }}
            >
              {!wide && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="See what you’ll get"
                  accessibilityState={{ expanded: previewOpen }}
                  onPress={() => setPreviewOpen((v) => !v)}
                  style={s.previewToggle}
                >
                  <View style={{ flex: 1, gap: 5 }}>
                    <Text style={s.panelTitle}>See what you’ll get</Text>
                    <Text style={s.quiet}>
                      Explore a fictional example. No account or credits.
                    </Text>
                  </View>
                  <Ionicons
                    name={previewOpen ? "chevron-up" : "chevron-down"}
                    size={22}
                    color={C.accent}
                  />
                </Pressable>
              )}
              {(wide || previewOpen) && <ResearchPreview />}
            </View>
          </View>
          <View style={s.section}>
            <View style={s.sectionHeading}>
              <View style={{ flexShrink: 1, maxWidth: "100%" }}>
                <Text role="heading" aria-level={2} style={s.sectionTitle}>
                  A little guidance goes a long way.
                </Text>
              </View>
              <Pressable
                accessibilityRole="link"
                onPress={() => router.push("/learn" as never)}
                style={s.link}
              >
                <Text style={s.linkText}>All tutorials</Text>
              </Pressable>
            </View>
            <View style={s.lessons}>
              {[
                {
                  n: "01",
                  title: "Connect your AI",
                  body: "A guided path, with or without an API key.",
                  icon: "finger-print-outline",
                  step: "0",
                },
                {
                  n: "02",
                  title: "Read the score",
                  body: "Understand what the number can—and can’t—say.",
                  icon: "analytics-outline",
                  step: "1",
                },
                {
                  n: "03",
                  title: "Build a library",
                  body: "Keep, compare, and revisit your research.",
                  icon: "library-outline",
                  step: "2",
                },
              ].map((item) => (
                <Pressable
                  key={item.n}
                  accessibilityRole="link"
                  onPress={() =>
                    router.push({
                      pathname: "/learn" as never,
                      params: { step: item.step },
                    })
                  }
                  style={s.lesson}
                  dataSet={{ motion: "press" }}
                >
                  <View style={s.lessonTop}>
                    <Ionicons
                      name={item.icon as never}
                      color={C.accent}
                      size={25}
                    />
                    <Text style={s.lessonNumber}>{item.n}</Text>
                  </View>
                  <Text style={s.lessonTitle}>{item.title}</Text>
                  <Text style={s.lessonBody}>{item.body}</Text>
                  <Text style={s.lessonAction}>Walk me through it ↗</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={s.section}>
            <View style={s.sectionHeading}>
              <Text role="heading" aria-level={2} style={s.sectionTitle}>
                {history.length
                  ? "Pick up where you left off."
                  : "A home for what you learn."}
              </Text>
              <Pressable
                accessibilityRole="link"
                onPress={() => router.push("/history")}
                style={s.link}
              >
                <Text style={s.linkText}>Open your library →</Text>
              </Pressable>
            </View>
            {history.length ? (
              history.slice(0, 3).map((item) => (
                <Pressable
                  accessibilityRole="link"
                  key={item.id}
                  onPress={() =>
                    router.push({
                      pathname: "/analysis",
                      params: { id: item.id },
                    })
                  }
                  style={s.recent}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={22}
                    color={C.accent}
                  />
                  <Text style={s.recentTitle}>{item.title}</Text>
                  <Text style={s.smallLabel}>Reopen ↗</Text>
                </Pressable>
              ))
            ) : (
              <Text style={s.description}>
                Completed appraisals are saved on this device when history is
                enabled. Reopen a report without paying for another AI response.
                Export a backup to keep a separate copy.
              </Text>
            )}
          </View>
          <View style={s.mission}>
            <Ionicons name="compass-outline" size={28} color={C.accent} />
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={s.panelTitle}>
                Research literacy, not outsourced judgment.
              </Text>
              <Text style={s.description}>
                Our mission is to help more people read research critically—with
                sources they can inspect and uncertainty they can see.
              </Text>
              <Pressable
                accessibilityRole="link"
                onPress={() => router.push("/about" as never)}
                style={s.link}
              >
                <Text style={s.linkText}>Why we’re building MedLit</Text>
              </Pressable>
            </View>
          </View>
          <View style={s.footer}>
            <Text style={s.quiet}>
              medlit. · Scientific judgment stays with you.
            </Text>
            <View style={s.heroLinks}>
              {[
                { text: "Research guides", path: "/guides" },
                { text: "Our mission", path: "/about" },
                { text: "Privacy", path: "/privacy" },
                { text: "Terms", path: "/terms" },
                { text: "FAQ", path: "/faq" },
              ].map((item) => (
                <Pressable
                  key={item.path}
                  accessibilityRole="link"
                  onPress={() => router.push(item.path as never)}
                  style={s.link}
                >
                  <Text style={s.quiet}>{item.text}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>}
      </ScrollView>
      <ConnectionSheet
        visible={sheet}
        article={url}
        settings={settings}
        saveSettings={saveSettings}
        onClose={() => setSheet(false)}
        onHandoff={handoff}
      />
      <Modal
        visible={accountPrompt}
        transparent
        animationType="fade"
        onRequestClose={() => setAccountPrompt(false)}
      >
        <View style={s.scrim}>
          <View style={s.prompt} role="dialog" aria-label="Save your research">
            <Text style={s.panelTitle}>Give your research a home.</Text>
            <Text style={s.description}>
              Create a free MedLit account to sync your saved appraisals. Your
              AI connection and billing stay separate. No appraisal has been
              generated yet.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={signup}
              style={s.primaryButton}
            >
              <Text style={s.primaryText}>Create an account</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setGuestChosen(true);
                setAccountPrompt(false);
                void handleAnalyze();
              }}
              style={s.link}
            >
              <Text style={s.linkText}>Continue as guest on this device</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setAccountPrompt(false)}
              style={s.link}
            >
              <Text style={s.quiet}>Back to paper</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: C.background },
  content: { width: "100%", maxWidth: 1180, padding: 24, alignSelf: "center" },
  hero: { paddingTop: 26, paddingBottom: 30, gap: 14 },
  eyebrow: { fontSize: 14, fontWeight: "600", color: C.accent },
  heading: {
    color: C.primary,
    fontSize: 42,
    lineHeight: 51,
    fontWeight: "600",
    letterSpacing: -1.5,
  },
  description: {
    color: C.textSecondary,
    fontSize: 16,
    lineHeight: 27,
    maxWidth: 640,
  },
  heroLinks: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    flexWrap: "wrap",
  },
  link: { minHeight: 44, justifyContent: "center" },
  linkText: { color: C.accent, fontWeight: "600", fontSize: 14 },
  quiet: {
    color: C.textSecondary,
    fontSize: 14,
    lineHeight: 23,
    flexShrink: 1,
  },
  desk: { gap: 26 },
  left: { flex: 1.1, minWidth: 0 },
  right: { flex: 1, minWidth: 0, gap: 15 },
  workbench: {
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: "#D2E0E6",
    borderRadius: 20,
    padding: 26,
    shadowColor: "#12384A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.045,
    shadowRadius: 20,
  },
  panelTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 27,
  },
  step: {
    backgroundColor: C.accentLight,
    width: 48,
    height: 48,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  panelTitle: {
    color: C.primary,
    fontSize: 21,
    fontWeight: "600",
    lineHeight: 29,
  },
  label: {
    color: C.primary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  previewToggle: {
    padding: 18,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: C.surface,
  },
  mission: {
    flexDirection: "row",
    gap: 20,
    paddingVertical: 32,
    marginTop: 38,
    borderTopWidth: 1,
    borderColor: C.border,
  },
  inputRow: {
    minHeight: 60,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#ACC4CE",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    backgroundColor: "#FAFCFD",
  },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 58,
    color: C.primary,
    fontSize: 15,
  },
  primaryButton: {
    minHeight: 54,
    backgroundColor: C.accent,
    borderRadius: 11,
    marginTop: 13,
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  primaryText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  sample: { minHeight: 50, flexDirection: "row", alignItems: "center", gap: 8 },
  sampleText: { color: C.accent, fontSize: 14, flex: 1, lineHeight: 23 },
  connection: {
    borderTopWidth: 1,
    borderColor: C.border,
    marginTop: 12,
    paddingTop: 20,
    flexDirection: "row",
    gap: 11,
    alignItems: "center",
  },
  connectionTitle: {
    color: C.primary,
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 22,
  },
  handoff: {
    minHeight: 54,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: C.border,
  },
  handoffText: {
    color: C.textSecondary,
    fontSize: 14,
    lineHeight: 23,
    flex: 1,
  },
  truthNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 15,
  },
  previewTop: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
    alignItems: "center",
  },
  smallLabel: { fontSize: 11, color: C.textSecondary },
  quote: {
    padding: 22,
    gap: 12,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D8E4E9",
    borderRadius: 15,
  },
  quoteHeader: { flexDirection: "row", gap: 8, alignItems: "center" },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#A66310" },
  quoteLabel: {
    color: "#8A570F",
    fontSize: 10,
    letterSpacing: 1,
    fontWeight: "700",
  },
  quoteText: {
    color: C.primary,
    fontFamily: "Georgia",
    fontSize: 20,
    lineHeight: 30,
  },
  section: {
    marginTop: 38,
    paddingTop: 28,
    borderTopWidth: 1,
    borderColor: "#D5E1E7",
    gap: 20,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
  },
  sectionTitle: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600",
    color: C.primary,
    letterSpacing: -0.5,
    marginTop: 7,
  },
  lessons: { flexDirection: "row", gap: 18, flexWrap: "wrap" },
  lesson: {
    flex: 1,
    minWidth: 235,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: "#D8E4E9",
    borderRadius: 15,
    padding: 22,
    gap: 13,
  },
  lessonTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lessonNumber: { color: "#547887", fontSize: 11 },
  lessonTitle: { fontSize: 18, fontWeight: "600", color: C.primary },
  lessonBody: { color: C.textSecondary, fontSize: 15, lineHeight: 25 },
  lessonAction: {
    color: C.accent,
    fontSize: 14,
    marginTop: 8,
    fontWeight: "600",
  },
  recent: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: C.border,
  },
  recentTitle: { flex: 1, color: C.primary, fontSize: 14, lineHeight: 23 },
  footer: {
    borderTopWidth: 1,
    borderColor: "#D5E1E7",
    marginTop: 44,
    paddingTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  error: {
    color: C.danger,
    backgroundColor: C.dangerLight,
    padding: 13,
    borderRadius: 9,
    fontSize: 13,
    lineHeight: 21,
  },
  scrim: {
    flex: 1,
    backgroundColor: "rgba(10,35,48,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  prompt: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: C.surface,
    borderRadius: 20,
    padding: 28,
    gap: 14,
  },
});
