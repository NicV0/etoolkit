import React from 'react';
import { View, Text } from 'react-native';
import { theme } from '../../lib/theme/tokens';

export function Section({ title, children } : { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: theme.semantic.spacing.lg }}>
      <Text style={{ color: theme.semantic.colors.text.primary, fontFamily: theme.semantic.type.family.primary, fontWeight: theme.semantic.type.weight.semibold, fontSize: theme.semantic.type.section, marginBottom: theme.semantic.spacing.sm, letterSpacing: 0.5 }}>
        {title}
      </Text>
      {children}
    </View>
  );
}
