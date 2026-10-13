import { ProductLoopObserver } from '../src/components/FirstPartyAnalytics';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../src/constants/colors';
import { AuthProvider } from '../src/hooks/useAuth';
import { purgeLegacyAnalysisCache } from '../src/services/currentAnalysis';

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error(JSON.stringify({
      level: 'error',
      event: 'client_route_failed',
      message: 'Route rendering failed',
      timestamp: new Date().toISOString(),
    }));
  }, [error]);
  return (
    <View style={errorStyles.container} accessibilityRole="alert">
      <Text style={errorStyles.title}>This screen could not load</Text>
      <Text style={errorStyles.body}>Your provider key was not included in this report. Try the screen again; if it keeps failing, return home and report the time of the error.</Text>
      <TouchableOpacity accessibilityRole="button" onPress={retry} style={errorStyles.button}><Text style={errorStyles.buttonText}>Try again</Text></TouchableOpacity>
    </View>
  );
}

export default function RootLayout() {
  useEffect(() => { void purgeLegacyAnalysisCache().catch(() => {}); }, []);
  return (
    <AuthProvider>
      <ProductLoopObserver />
      <StatusBar style="dark" />
      <Stack
        initialRouteName="index"
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
        <Stack.Screen name="guides/index" options={{ title: 'Research guides', headerShown: false }} />
        <Stack.Screen name="guides/[slug]" options={{ title: 'Research guide', headerShown: false }} />
        <Stack.Screen name="learn" options={{ title: 'Learn', headerShown: false }} />
        <Stack.Screen name="about" options={{ title: 'Our mission', headerShown: false }} />
        <Stack.Screen name="connect" options={{ title: 'Connect AI', headerShown: false }} />
        <Stack.Screen
          name="index"
          options={{ title: 'MedLit', headerShown: false }}
        />
        <Stack.Screen
          name="auth"
          options={{
            title: 'Sign In',
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="analysis"
          options={{
            title: 'Analysis',
            presentation: 'card',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Settings',
            presentation: 'modal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="history"
          options={{ title: 'History', headerShown: false }}
        />
        <Stack.Screen name="import" options={{ title: 'Batch import', headerShown: false }} />
        <Stack.Screen name="chatgpt" options={{ title: 'Use your own ChatGPT', headerShown: false }} />
        <Stack.Screen name="compare" options={{ title: 'Compare appraisals', headerShown: false }} />
        <Stack.Screen name="shared" options={{ title: 'Shared appraisal', headerShown: false }} />
        <Stack.Screen name="example" options={{ title: 'Fictional appraisal example', headerShown: false }} />
        <Stack.Screen name="alerts" options={{ title: 'Evidence alerts', headerShown: false }} />
        <Stack.Screen
          name="profile"
          options={{
            title: 'Profile',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="methodology"
          options={{
            title: 'Methodology',
            headerShown: false,
            presentation: 'modal',
            headerStyle: { backgroundColor: Colors.primary },
          }}
        />
        <Stack.Screen
          name="faq"
          options={{
            title: 'FAQ',
            headerShown: false,
            presentation: 'modal',
            headerStyle: { backgroundColor: Colors.primary },
          }}
        />
        <Stack.Screen name="privacy" options={{ title: 'Privacy', presentation: 'modal', headerShown: false }} />
        <Stack.Screen name="terms" options={{ title: 'Terms', presentation: 'modal', headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}

const errorStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 28, backgroundColor: Colors.background },
  title: { color: Colors.textPrimary, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  body: { color: Colors.textSecondary, fontSize: 14, lineHeight: 21, textAlign: 'center', maxWidth: 540 },
  button: { minHeight: 46, justifyContent: 'center', paddingHorizontal: 20, borderRadius: 11, backgroundColor: Colors.accent },
  buttonText: { color: '#fff', fontWeight: '800' },
});
