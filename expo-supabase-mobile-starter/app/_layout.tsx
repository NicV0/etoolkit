import React from 'react';
import { Slot } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { View } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/query/queryClient';
import { ThemeProvider } from '../lib/theme/ThemeProvider';
import { theme } from '../lib/theme/tokens';
import { AppErrorBoundary } from '../components/system/AppErrorBoundary';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../lib/auth/AuthProvider';
import MaybeLock from './MaybeLock';
import { AuthGate } from '../lib/auth/AuthGate';
import { useAppOpenAnalytics } from '../lib/monitoring/hooks';
import { LockProvider, useLock } from '../lib/auth/LockProvider';
import LockScreen from '../components/ui/LockScreen';

export default function RootLayout() {
  const [loaded] = useFonts({ Inter_400Regular, Inter_600SemiBold, Inter_700Bold });
  useAppOpenAnalytics();
  
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
            <ThemeProvider>
              <AuthProvider>
                <LockProvider>
                  <AuthGate>
                    <MaybeLock>
                      <Slot />
                    </MaybeLock>
                  </AuthGate>
                </LockProvider>
              </AuthProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </AppErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

