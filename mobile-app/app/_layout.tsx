import React from 'react';
import { Slot } from 'expo-router';
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { View } from 'react-native';
import { SettingsProvider } from '../lib/state/settings';
import { colors } from '../lib/theme/tokens';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }
  return (
    <SettingsProvider>
      <Slot />
    </SettingsProvider>
  );
}