import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { colors } from '../../lib/theme/tokens';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  title,
  onPress,
  variant = 'primary',
  className,
}: {
  title: string;
  onPress: () => void;
  variant?: Variant;
  className?: string;
}) {
  const bg =
    variant === 'primary'
      ? colors.primary
      : variant === 'secondary'
      ? '#FFFFFF18'
      : variant === 'danger'
      ? colors.danger
      : 'transparent';
  const color = variant === 'ghost' ? colors.text : '#FFFFFF';
  const border = variant === 'ghost' ? colors.border : 'transparent';

  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={title} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      activeOpacity={0.9}
      onPress={onPress}
      className={`px-4 py-3 rounded-2xl ${className ?? ''}`}
      style={{ backgroundColor: bg, borderColor: border, borderWidth: border === 'transparent' ? 0 : 1 }}
    >
      <Text style={{ color, fontFamily: 'Inter_600SemiBold', fontSize: 14 }}>{title}</Text>
    </TouchableOpacity>
  );
}