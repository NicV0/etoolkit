import React from 'react';
import { Slot } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { View } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/query/queryClient';
import { theme } from '../lib/theme/tokens';
import { AppErrorBoundary } from '../components/system/AppErrorBoundary';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  const [loaded] = useFonts({ Inter_400Regular, Inter_600SemiBold, Inter_700Bold });
  
  if (!loaded) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <View style={{ 
            flex: 1, 
            backgroundColor: theme.colors.background,
            justifyContent: 'center',
            alignItems: 'center'
          }} />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AppErrorBoundary onReset={() => queryClient.invalidateQueries()}>
          <QueryClientProvider client={queryClient}>
            <Slot />
          </QueryClientProvider>
        </AppErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
