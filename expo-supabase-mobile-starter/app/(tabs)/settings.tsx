import { useEffect } from 'react';
import { router } from 'expo-router';

export default function SettingsTab() {
  useEffect(() => {
    // Redirect to the main settings screen
    router.replace('/settings');
  }, []);

  return null;
}
