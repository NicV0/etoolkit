import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { theme } from '../../../../lib/theme/tokens';
import { useAuth } from '../../../../lib/auth/AuthProvider';

export const SignOutRow: React.FC = () => {
  const { signOut } = useAuth();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Sign out"
      onPress={signOut}
      style={({ pressed }) => ([
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: theme.semantic.spacing.sm,
          borderTopWidth: 1,
          borderTopColor: theme.semantic.colors.border.subtle,
        },
        pressed && { opacity: 0.9 },
      ])}
      testID="settings.signout"
    >
      <Text style={{ color: theme.semantic.colors.text.primary }}>Sign Out</Text>
      <Text style={{ color: theme.semantic.colors.state.danger }}>→</Text>
    </Pressable>
  );
};

export default SignOutRow;
