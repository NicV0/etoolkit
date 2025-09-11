import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '../../lib/theme/tokens';

export type IconButtonProps = {
  icon: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'solid' | 'outline';
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
};

export const IconButton = React.forwardRef<any, IconButtonProps>(({
  icon,
  onPress,
  accessibilityLabel,
  size = 'md',
  variant = 'ghost',
  disabled = false,
  style,
  testID,
}, ref) => {
  const [focused, setFocused] = React.useState(false);
  const sizePx = size === 'sm' ? theme.iconSizes.sm : size === 'lg' ? theme.iconSizes.xl : theme.iconSizes.lg;
  const padding = size === 'sm' ? theme.semantic.spacing.xs : size === 'lg' ? theme.semantic.spacing.md : theme.semantic.spacing.sm;
  const bg = variant === 'solid' ? theme.semantic.colors.accent.primary : 'transparent';
  const baseBorderWidth = variant === 'outline' ? 1 : 0;
  const baseBorderColor = variant === 'outline' ? theme.semantic.colors.accent.primary : 'transparent';

  // Enforce minimum hit target
  const box = sizePx + padding * 2;
  const width = Math.max(box, theme.hitTargets.minimum);
  const height = Math.max(box, theme.hitTargets.minimum);

  return (
    <TouchableOpacity
      accessible
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      disabled={disabled || !onPress}
      style={[{
        width,
        height,
        borderRadius: theme.semantic.radii.full,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: disabled ? theme.semantic.colors.interactive.disabled : bg,
        borderWidth: focused ? Math.max(baseBorderWidth, 2) : baseBorderWidth,
        borderColor: focused ? theme.semantic.colors.focus.ring : baseBorderColor,
        opacity: disabled ? 0.6 : 1,
      }, style]}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      testID={testID}
      ref={ref as any}
    >
      {icon}
    </TouchableOpacity>
  );
});

IconButton.displayName = 'IconButton';

export default IconButton;
