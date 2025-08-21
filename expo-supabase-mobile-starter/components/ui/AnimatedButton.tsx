import React, { useState } from 'react';
import { Animated, Pressable, Text, ViewStyle, TextStyle } from 'react-native';
import { usePressAnimation } from '../../lib/animations';
import { designSystem } from '../../theme/design-system';

interface AnimatedButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const [pressed, setPressed] = useState(false);
  const { scaleAnim, opacityAnim, animatePress } = usePressAnimation(disabled || loading);

  const handlePressIn = () => {
    setPressed(true);
    animatePress(true);
  };

  const handlePressOut = () => {
    setPressed(false);
    animatePress(false);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: designSystem.colors.primary[500],
          borderColor: designSystem.colors.primary[500],
          textColor: '#ffffff',
        };
      case 'secondary':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderColor: 'rgba(255, 255, 255, 0.6)',
          textColor: designSystem.colors.text.primary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: designSystem.colors.primary[500],
        };
      case 'danger':
        return {
          backgroundColor: designSystem.colors.error[500],
          borderColor: designSystem.colors.error[500],
          textColor: '#ffffff',
        };
      default:
        return {
          backgroundColor: designSystem.colors.primary[500],
          borderColor: designSystem.colors.primary[500],
          textColor: '#ffffff',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: designSystem.spacing.sm,
          paddingHorizontal: designSystem.spacing.md,
          fontSize: designSystem.typography.fontSize.sm,
          borderRadius: designSystem.borderRadius.md,
        };
      case 'md':
        return {
          paddingVertical: designSystem.spacing.md,
          paddingHorizontal: designSystem.spacing.lg,
          fontSize: designSystem.typography.fontSize.base,
          borderRadius: designSystem.borderRadius.lg,
        };
      case 'lg':
        return {
          paddingVertical: designSystem.spacing.lg,
          paddingHorizontal: designSystem.spacing.xl,
          fontSize: designSystem.typography.fontSize.lg,
          borderRadius: designSystem.borderRadius.xl,
        };
      default:
        return {
          paddingVertical: designSystem.spacing.md,
          paddingHorizontal: designSystem.spacing.lg,
          fontSize: designSystem.typography.fontSize.base,
          borderRadius: designSystem.borderRadius.lg,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const buttonStyle: ViewStyle = {
    backgroundColor: variantStyles.backgroundColor,
    borderWidth: 1,
    borderColor: variantStyles.borderColor,
    borderRadius: sizeStyles.borderRadius,
    paddingVertical: sizeStyles.paddingVertical,
    paddingHorizontal: sizeStyles.paddingHorizontal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: variant === 'primary' ? designSystem.colors.primary[500] : '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: variant === 'primary' ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: variant === 'primary' ? 4 : 2,
    width: fullWidth ? '100%' : undefined,
    opacity: disabled ? 0.5 : 1,
    ...style,
  };

  const textStyleCombined: TextStyle = {
    fontSize: sizeStyles.fontSize,
    fontWeight: designSystem.typography.fontWeight.semibold,
    color: variantStyles.textColor,
    textAlign: 'center',
    ...textStyle,
  };

  return (
    <Animated.View
      style={[
        buttonStyle,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={{ flexDirection: 'row', alignItems: 'center' }}
      >
        {icon && (
          <Animated.View style={{ marginRight: designSystem.spacing.sm }}>
            {icon}
          </Animated.View>
        )}
        <Text style={textStyleCombined}>
          {loading ? 'Loading...' : title}
        </Text>
      </Pressable>
    </Animated.View>
  );
};

// Specialized button variants for common use cases
export const PrimaryButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (props) => (
  <AnimatedButton {...props} variant="primary" />
);

export const SecondaryButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (props) => (
  <AnimatedButton {...props} variant="secondary" />
);

export const GhostButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (props) => (
  <AnimatedButton {...props} variant="ghost" />
);

export const DangerButton: React.FC<Omit<AnimatedButtonProps, 'variant'>> = (props) => (
  <AnimatedButton {...props} variant="danger" />
);
