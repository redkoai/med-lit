import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../src/constants/colors';

export default function RootLayout() {
  return (
    <>
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
          options={{ title: 'MedLit', headerLargeTitle: false }}
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
            headerStyle: { backgroundColor: Colors.primary },
          }}
        />
        <Stack.Screen
          name="history"
          options={{ title: 'History' }}
        />
      </Stack>
    </>
  );
}
