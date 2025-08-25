import React from 'react';
import { Text, View } from 'react-native';
import { radii, colors } from '../../lib/theme/tokens';

export function Badge({
  text,
  color = 'gray',
}: {
  text: string;
  color?: 'gray' | 'green' | 'yellow' | 'red' | 'blue';
}) {
  const map: Record<string, { bg: string; fg: string }> = {
    gray: { bg: colors.card, fg: colors.textMuted },
    green: { bg: colors.card, fg: colors.success },
    yellow: { bg: colors.card, fg: colors.warning },
    red: { bg: colors.card, fg: colors.danger },
    blue: { bg: colors.card, fg: colors.primary },
  };
  const { bg, fg } = map[color];
  return (
    <View
      style={{
        backgroundColor: bg,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Text style={{ color: fg, fontFamily: 'Inter_600SemiBold', fontSize: 12 }}>{text}</Text>
    </View>
  );
}
