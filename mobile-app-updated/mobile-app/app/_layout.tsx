import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../lib/state/store';

/**
 * Root layout wraps the entire app in providers for safe area support,
 * global state and consistent status bar styling. It also disables all
 * headers on stack screens to let individual pages handle their own
 * headers.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
      </AppProvider>
    </SafeAreaProvider>
  );
}