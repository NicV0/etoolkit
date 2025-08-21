import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Providers } from '../lib/providers';
import { deepLinks } from '../lib/deepLinks';
import 'react-native-url-polyfill/auto';
import '../global.css';

export default function RootLayout() {
  useEffect(() => {
    // Initialize deep link handling
    deepLinks.init();
  }, []);

  return (
    <Providers>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
      </Stack>
    </Providers>
  );
}
