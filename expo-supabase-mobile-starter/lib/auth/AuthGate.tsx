import { useSegments, useRouter } from 'expo-router';

import React, { useEffect } from 'react';
import { useAuth } from './AuthProvider';

export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const isAuthGroup = segments[0] === '(auth)';

  useEffect(() => {
    if (!loading) {
      if (!session && !isAuthGroup) {
        router.replace('/(auth)/sign-in');
      }
      if (session && isAuthGroup) {
        router.replace('/(tabs)/dashboard');
      }
    }
  }, [loading, session, isAuthGroup]);

  if (loading) return null;
  return <>{children}</>;
};
