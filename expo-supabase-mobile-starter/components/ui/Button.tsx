import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
  AccessibilityRole,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '../../lib/theme/tokens';
import { buttonStyles } from '../../lib/theme/utils';
import { hitSlop4 } from '../../lib/a11y';

// Button variants
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

// Button sizes
export type ButtonSize = 'sm' | 'md' | 'lg';

// Button props interface
export interface ButtonProps {
  // Content
  title: string;
  onPress: () => void;
  
  // Variants
  variant?: ButtonVariant;
  size?: ButtonSize;
  
  // States
  disabled?: boolean;
  loading?: boolean;
  
  // Styling
  style?: ViewStyle;
  textStyle?: TextStyle;
  
  // Icons
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  
  // Other
  fullWidth?: boolean;
}

// Button component
export const Button: React.FC<ButtonProps> = React.memo(({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  accessibilityLabel,
  accessibilityHint,
  fullWidth = false,
}) => {
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  // Handle press in
  const handlePressIn = () => {
    try {
      if (!disabled && !loading) {
        scale.value = withTiming(0.98, { duration: theme.animation.duration.fast });
        opacity.value = withTiming(0.9, { duration: theme.animation.duration.fast });
      }
    } catch (error) {
      console.error('Button press in error:', error);
    }
  };

  // Handle press out
  const handlePressOut = () => {
    try {
      if (!disabled && !loading) {
        scale.value = withTiming(1, { duration: theme.animation.duration.fast });
        opacity.value = withTiming(1, { duration: theme.animation.duration.fast });
      }
    } catch (error) {
      console.error('Button press out error:', error);
    }
  };

  // Get button styles based on variant and size
  const getButtonStyle = (): ViewStyle => {
    const baseStyle = buttonStyles.base;
    const variantStyle = buttonStyles[variant as ButtonVariant];
    const sizeStyle = getSizeStyle(size as ButtonSize);
    const stateStyle = disabled ? buttonStyles.disabled : {};
    const widthStyle = fullWidth ? { width: '100%' as const } : {};

    return {
      ...baseStyle,
      ...variantStyle,
      ...sizeStyle,
      ...stateStyle,
      ...widthStyle,
    };
  };

  // Get text styles based on variant and size
  const getTextStyle = (): TextStyle => {
    const baseTextStyle = getBaseTextStyle(variant as ButtonVariant);
    const sizeTextStyle = getSizeTextStyle(size as ButtonSize);
    const stateTextStyle = disabled ? { opacity: 0.5 } : {};

    return {
      ...baseTextStyle,
      ...sizeTextStyle,
      ...stateTextStyle,
    };
  };

  // Get size-specific styles
  const getSizeStyle = (buttonSize: ButtonSize): ViewStyle => {
    switch (buttonSize) {
      case 'sm':
        return {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          minHeight: 36,
        };
      case 'lg':
        return {
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.lg,
          minHeight: 56,
        };
      default: // md
        return {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.md,
          minHeight: 44,
        };
    }
  };

  // Get size-specific text styles
  const getSizeTextStyle = (buttonSize: ButtonSize): TextStyle => {
    switch (buttonSize) {
      case 'sm':
        return {
          fontSize: theme.typography.fontSize.body,
        };
      case 'lg':
        return {
          fontSize: theme.typography.fontSize.bodyStrong,
        };
      default: // md
        return {
          fontSize: theme.typography.fontSize.body,
        };
    }
  };

  // Get base text style based on variant
  const getBaseTextStyle = (buttonVariant: ButtonVariant): TextStyle => {
    switch (buttonVariant) {
      case 'primary':
        return {
          color: theme.colors.text.inverse,
          fontWeight: theme.typography.fontWeight.semibold,
        };
      case 'secondary':
        return {
          color: theme.colors.text.primary,
          fontWeight: theme.typography.fontWeight.semibold,
        };
      case 'outline':
        return {
          color: theme.colors.primary,
          fontWeight: theme.typography.fontWeight.semibold,
        };
      case 'ghost':
        return {
          color: theme.colors.primary,
          fontWeight: theme.typography.fontWeight.semibold,
        };
      default:
        return {
          color: theme.colors.text.primary,
          fontWeight: theme.typography.fontWeight.semibold,
        };
    }
  };

  // Determine accessibility role
  const getAccessibilityRole = (): AccessibilityRole => {
    return 'button';
  };

  return (
    <Animated.View style={[animatedStyle, fullWidth && { width: '100%' }]}>
      <TouchableOpacity
        style={[getButtonStyle(), style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        hitSlop={hitSlop4}
        accessibilityRole={getAccessibilityRole()}
        accessibilityLabel={accessibilityLabel || title}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: disabled || loading }}
        accessibilityLiveRegion="polite"
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? theme.colors.text.inverse : theme.colors.primary}
          />
        ) : (
          <>
            {leftIcon && (
              <Animated.View style={styles.leftIcon}>
                {leftIcon}
              </Animated.View>
            )}
            <Text style={[getTextStyle(), textStyle]}>{title}</Text>
            {rightIcon && (
              <Animated.View style={styles.rightIcon}>
                {rightIcon}
              </Animated.View>
            )}
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

// Styles
const styles = StyleSheet.create({
  leftIcon: {
    marginRight: theme.spacing.sm,
  },
  rightIcon: {
    marginLeft: theme.spacing.sm,
  },
});

// Export button variants as separate components for convenience
export const PrimaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="primary" />
);

export const SecondaryButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="secondary" />
);

export const OutlineButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="outline" />
);

export const GhostButton: React.FC<Omit<ButtonProps, 'variant'>> = (props) => (
  <Button {...props} variant="ghost" />
);

// Add display names for debugging
Button.displayName = 'Button';
PrimaryButton.displayName = 'PrimaryButton';
SecondaryButton.displayName = 'SecondaryButton';
OutlineButton.displayName = 'OutlineButton';
GhostButton.displayName = 'GhostButton';
