import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter, useURL } from 'expo-router';
import { supabase } from '../lib/supabase';

export default function AuthCallback() {
  const router = useRouter();
  const url = useURL();

  useEffect(() => {
    if (!url) return;
    supabase.auth.exchangeCodeForSession(url).then(({ error }) => {
      if (!error) {
        router.replace('/(tabs)');
      }
    });
  }, [url]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}
