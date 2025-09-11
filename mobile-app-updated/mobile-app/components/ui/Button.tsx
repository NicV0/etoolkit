import React from 'react';
import { Text, TouchableOpacity, ViewStyle } from 'react-native';
import { semantic, theme } from '../../lib/theme/tokens';

export type ButtonProps = {
  /**
   * The text displayed on the button.
   */
  title: string;
  /**
   * Called when the user taps the button. If undefined the button will be
   * disabled.
   */
  onPress?: () => void;
  /**
   * Selects the button styling. Primary buttons use the accent colour
   * whereas secondary buttons are more subdued.
   */
  variant?: 'primary' | 'secondary';
  /**
   * Disables the button when true. Disabled buttons have reduced opacity
   * and ignore presses.
   */
  disabled?: boolean;
  /**
   * Optional accessibility label. If omitted the title is used.
   */
  accessibilityLabel?: string;
  /**
   * Optionally supply an icon to render before the title. Use a small
   * lucide-react-native icon for best results.
   */
  icon?: React.ReactNode;
  /**
   * Style overrides if you need to adjust spacing. Avoid overriding
   * structural properties like padding outside this component.
   */
  style?: ViewStyle;
};

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  accessibilityLabel,
  icon,
  style,
}: ButtonProps) {
  const backgroundColor =
    variant === 'primary' ? semantic.colors.accent.primary : semantic.colors.background.surface;
  const textColor =
    variant === 'primary' ? semantic.colors.text.inverse : semantic.colors.text.primary;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || !onPress}
      style={[
        {
          backgroundColor,
          paddingVertical: semantic.spacing.md,
          paddingHorizontal: semantic.spacing.lg,
          borderRadius: semantic.radii.md,
          opacity: disabled ? 0.6 : 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
    >
      {icon}
      <Text
        style={{
          color: textColor,
          fontSize: theme.typography.fontSize.body,
          fontWeight: '600',
          marginLeft: icon ? semantic.spacing.sm : 0,
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}