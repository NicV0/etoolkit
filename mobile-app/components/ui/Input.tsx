import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { colors, radii } from '../../lib/theme/tokens';

export function Input({ label, ...rest }: any) {
  return (
    <View className="mb-3">
      {label ? (
        <Text
          style={{ color: colors.textMuted, fontFamily: 'Inter_400Regular', fontSize: 12 }}
          className="mb-1"
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={{
          backgroundColor: 'colors.card',
          color: colors.text,
          paddingHorizontal: 12,
          paddingVertical: 10,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: colors.border,
          fontFamily: 'Inter_400Regular',
        }}
        {...rest}
      />
    </View>
  );
}