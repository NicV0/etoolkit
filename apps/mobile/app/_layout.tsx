import React from 'react';
import { Stack } from 'expo-router';
import { StripeProvider } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';

export default function RootLayout() {
  const pk = Constants.expoConfig?.extra?.STRIPE_PUBLISHABLE_KEY as string | undefined;
  return (
    <StripeProvider publishableKey={pk || ''} merchantIdentifier="merchant.com.etoolkit">
      <Stack screenOptions={{ headerShown: false }} />
    </StripeProvider>
  );
}
