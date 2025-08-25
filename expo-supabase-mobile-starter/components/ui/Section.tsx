import React from 'react';
import { View, Text } from 'react-native';
import { theme } from '../../lib/theme/tokens';

export function Section({ title, children } : { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ color: theme.colors.text.primary, fontFamily: 'Inter_700Bold', fontSize: 16, marginBottom: 8, letterSpacing: 0.5 }}>
        {title}
      </Text>
      {children}
    </View>
  );
}
