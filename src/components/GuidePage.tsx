import { ScrollView, StyleSheet, Text, View, Platform } from "react-native";
import type { ReactNode } from "react";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { PageMeta } from "./PageMeta";
import { Colors as C } from "../constants/colors";
import { PUBLIC_SITE_URL } from "../constants/site";
import { WorkspaceFooter } from "./WorkspaceFooter";
export function GuidePage({
  title,
  description,
  path,
  active,
  children,
}: {
  title: string;
  description: string;
  path: string;
  active?: string;
  children: ReactNode;
}) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.background }}
      contentContainerStyle={{ paddingBottom: 64 }}
    >
      <PageMeta
        title={`${title} — MedLit`}
        description={description}
        path={path}
        structuredData={path.startsWith('/guides') ? {'@context':'https://schema.org','@type':path==='/guides'?'CollectionPage':'Article',headline:title,description,url:PUBLIC_SITE_URL+path,dateModified:'2026-10-13',author:{'@type':'Organization',name:'MedLit'},publisher:{'@type':'Organization',name:'MedLit'}} : undefined}
      />
      <WorkspaceHeader active={active} />
      <View nativeID="main-content" style={guide.content} role={"main" as never}>
        <Text role="heading" aria-level={1} style={guide.title}>
          {title}
        </Text>
        <Text style={guide.intro}>{description}</Text>
        {children}
      </View>
      <WorkspaceFooter />
    </ScrollView>
  );
}
export const guide = StyleSheet.create({
  content: {
    width: "100%",
    maxWidth: 940,
    padding: 24,
    paddingTop: 44,
    alignSelf: "center",
    gap: 22,
  },
  eyebrow: { color: C.accent, fontFamily: Platform.OS === "web" ? "IBM Plex Sans" : undefined, fontSize: 14, fontWeight: "600", marginTop: 22 },
  title: {
    color: C.primary,
    fontWeight: "600",
    fontFamily: Platform.OS === "web" ? "IBM Plex Sans" : undefined, fontSize: 36,
    lineHeight: 44,
    letterSpacing: -1,
  },
  intro: {
    fontFamily: Platform.OS === "web" ? "IBM Plex Sans" : undefined, fontSize: 17,
    lineHeight: 28,
    color: C.textSecondary,
    maxWidth: 700,
    marginBottom: 12,
  },
  card: {
    backgroundColor: C.surface,
    padding: 24,
    borderWidth: 1,
    borderColor: "#DCE0EC",
    borderRadius: 5,
    gap: 16,
  },
  heading: {
    fontFamily: Platform.OS === "web" ? "IBM Plex Sans" : undefined, fontSize: 22,
    lineHeight: 29,
    fontWeight: "600",
    color: C.primary,
  },
  body: { fontFamily: Platform.OS === "web" ? "IBM Plex Sans" : undefined, fontSize: 16, lineHeight: 27, color: C.textSecondary },
  link: { minHeight: 46, justifyContent: "center" },
  linkText: { color: C.accent, fontFamily: Platform.OS === "web" ? "IBM Plex Sans" : undefined, fontSize: 15, fontWeight: "600" },
  button: {
    backgroundColor: C.accent,
    borderRadius: 10,
    minHeight: 54,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontFamily: Platform.OS === "web" ? "IBM Plex Sans" : undefined, fontSize: 16 },
});
