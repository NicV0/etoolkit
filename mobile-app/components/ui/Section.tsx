import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../../lib/theme/tokens';

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="mb-6">
      <Text
        style={{ color: colors.text, fontFamily: 'Inter_700Bold', fontSize: 16 }}
        className="mb-2 tracking-wide"
      >
        {title}
      </Text>
      {children}
    </View>
  );
}