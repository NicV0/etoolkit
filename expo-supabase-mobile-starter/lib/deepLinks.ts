import { Linking } from 'react-native';
import * as ExpoLinking from 'expo-linking';
import { router } from 'expo-router';
import { supabase } from './supabase';

export const deepLinks = {
  // Initialize deep link handling
  init: () => {
    // Handle deep links when app is already running
    const handleDeepLink = (url: string) => {
      deepLinks.handleUrl(url);
    };

    // Handle deep links when app is opened from a link
    const handleInitialURL = async () => {
      const initialUrl = await ExpoLinking.getInitialURL();
      if (initialUrl) {
        deepLinks.handleUrl(initialUrl);
      }
    };

    // Set up listeners
    Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
    handleInitialURL();
  },

  // Handle incoming URLs
  handleUrl: async (url: string) => {
    const parsed = ExpoLinking.parse(url);
    
    // Handle magic link authentication
    if (parsed.scheme === 'etoolkit' && parsed.hostname === 'auth') {
      try {
        // Let Supabase handle the auth response
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth error:', error);
          // Navigate to sign-in on error
          router.replace('/(auth)/sign-in');
          return;
        }
        
        if (data.session) {
          console.log('Authentication successful');
          // Navigate to main app after successful auth
          router.replace('/(tabs)');
        } else {
          console.log('No session found');
          // Navigate to sign-in if no session
          router.replace('/(auth)/sign-in');
        }
      } catch (error) {
        console.error('Deep link handling error:', error);
        router.replace('/(auth)/sign-in');
      }
    }
  },

  // Generate magic link URL
  getMagicLinkUrl: (email: string, token: string) => {
    return `etoolkit://auth?type=magiclink&access_token=${token}&email=${encodeURIComponent(email)}`;
  },

  // Generate onboarding URL
  getOnboardingUrl: () => {
    return 'etoolkit://onboarding';
  },
};
