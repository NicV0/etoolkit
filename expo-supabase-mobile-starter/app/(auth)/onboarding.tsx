import React, { useEffect, useState } from 'react';
import { View, Text, Switch } from 'react-native';
import { theme } from '../../lib/theme/tokens';
import { Button, Input } from '../../components/ui';
import { router } from 'expo-router';
import { getOnboardingComplete, setOnboardingComplete, setTradeType, setPrivacyAccepted, setDisclaimerAccepted } from '../../lib/auth/onboarding';

export default function OnboardingScreen() {
  const [trade, setTrade] = useState('');
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptDisclaimer, setAcceptDisclaimer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const done = await getOnboardingComplete();
      if (done) router.replace('/(tabs)/dashboard');
      setLoading(false);
    })();
  }, []);

  const handleContinue = async () => {
    await setTradeType(trade);
    await setPrivacyAccepted(acceptPrivacy);
    await setDisclaimerAccepted(acceptDisclaimer);
    await setOnboardingComplete(true);
    router.replace('/(tabs)/dashboard');
  };

  if (loading) return null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.semantic.colors.background.base, padding: theme.semantic.spacing.lg }}>
      <Text style={{ color: theme.semantic.colors.text.primary, fontSize: theme.semantic.type.section, marginBottom: theme.semantic.spacing.md }}>Welcome</Text>
      <Input label="Your trade" value={trade} onChangeText={setTrade} placeholder="e.g., Electrician" style={{ marginBottom: theme.semantic.spacing.md }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.semantic.spacing.sm }}>
        <Switch value={acceptPrivacy} onValueChange={setAcceptPrivacy} />
        <Text style={{ color: theme.semantic.colors.text.secondary, marginLeft: theme.semantic.spacing.sm }}>I agree to the Privacy Policy</Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: theme.semantic.spacing.lg }}>
        <Switch value={acceptDisclaimer} onValueChange={setAcceptDisclaimer} />
        <Text style={{ color: theme.semantic.colors.text.secondary, marginLeft: theme.semantic.spacing.sm }}>I understand the disclaimers</Text>
      </View>
      <Button title="Continue" onPress={handleContinue} disabled={!trade || !acceptPrivacy || !acceptDisclaimer} />
    </View>
  );
}
