import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../src/constants/colors';
import { AuthProvider } from '../src/hooks/useAuth';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: Colors.background },
        }}
      >
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
            headerBackTitle: 'Back',
            presentation: 'card',
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
        <Stack.Screen
          name="methodology"
          options={{
            title: 'Methodology',
            presentation: 'modal',
            headerStyle: { backgroundColor: Colors.primary },
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
