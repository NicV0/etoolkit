import React from 'react';
import { View, ViewStyle } from 'react-native';
import { theme } from '../../lib/theme/tokens';

export type CardProps = {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  variant?: 'flat' | 'outlined' | 'elevated';
};

export function Card({ children, className, style, variant = 'flat' }: CardProps) {
  const base: ViewStyle = {
    backgroundColor: theme.semantic.colors.background.surface,
    borderRadius: theme.semantic.radii.xl,
    paddingHorizontal: theme.semantic.spacing.md,
    paddingVertical: theme.semantic.spacing.sm,
  };

  const outlined: ViewStyle = {
    borderWidth: 1,
    borderColor: theme.semantic.colors.border.subtle,
  };

  const elevated: ViewStyle = {
    ...theme.semantic.shadows.card,
  } as any;

  return (
    <View
      style={[
        base,
        variant === 'outlined' && outlined,
        variant === 'elevated' && elevated,
        style,
      ]}
    >
      {children}
    </View>
  );
}
export default Card;
