import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { theme } from '../../lib/theme/tokens';
import { Button } from '../../components/ui';
import { etoolkit } from '../../lib/supabase';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await etoolkit.signInWithEmail(email);
      alert('Check your email for the magic link.');
    } catch (e) {
      alert('Failed to send sign-in link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: theme.spacing.lg, backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text.primary, fontSize: theme.typography.fontSize.h2, marginBottom: theme.spacing.lg }}>Sign In</Text>
      <TextInput
        style={{
          backgroundColor: theme.semantic.colors.input.background,
          color: theme.semantic.colors.text.primary,
          paddingVertical: theme.semantic.spacing.sm,
          paddingHorizontal: theme.semantic.spacing.md,
          borderRadius: theme.semantic.radii.md,
          borderWidth: 1,
          borderColor: theme.semantic.colors.border.subtle,
          marginBottom: theme.semantic.spacing.md,
        }}
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        placeholderTextColor={theme.semantic.colors.text.muted}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="send"
        onSubmitEditing={handleSignIn}
        accessibilityLabel="Email"
      />
      <Button title="Send magic link" onPress={handleSignIn} loading={loading} />
    </View>
  );
}
