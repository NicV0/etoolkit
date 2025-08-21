import React, { useState } from 'react';
import { Animated, Pressable, View, ViewStyle } from 'react-native';
import { useCardAnimation, useListItemAnimation } from '../../lib/animations';
import { designSystem } from '../../theme/design-system';

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onPress,
  style,
  disabled = false,
  variant = 'default',
  padding = 'md',
}) => {
  const [pressed, setPressed] = useState(false);
  const { scaleAnim, shadowAnim, animateCard } = useCardAnimation();

  const handlePressIn = () => {
    if (disabled || !onPress) return;
    setPressed(true);
    animateCard(true);
  };

  const handlePressOut = () => {
    if (disabled || !onPress) return;
    setPressed(false);
    animateCard(false);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'default':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderColor: 'rgba(255, 255, 255, 0.6)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        };
      case 'elevated':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderColor: 'rgba(255, 255, 255, 0.8)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.15,
          shadowRadius: 16,
          elevation: 8,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 1,
        };
      default:
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderColor: 'rgba(255, 255, 255, 0.6)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        };
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'sm':
        return designSystem.spacing.sm;
      case 'md':
        return designSystem.spacing.md;
      case 'lg':
        return designSystem.spacing.lg;
      case 'xl':
        return designSystem.spacing.xl;
      default:
        return designSystem.spacing.md;
    }
  };

  const variantStyles = getVariantStyles();
  const paddingValue = getPaddingStyles();

  const cardStyle: ViewStyle = {
    backgroundColor: variantStyles.backgroundColor,
    borderRadius: designSystem.borderRadius.xl,
    borderWidth: 1,
    borderColor: variantStyles.borderColor,
    padding: paddingValue,
    shadowColor: variantStyles.shadowColor,
    shadowOffset: variantStyles.shadowOffset,
    shadowOpacity: variantStyles.shadowOpacity,
    shadowRadius: variantStyles.shadowRadius,
    elevation: variantStyles.elevation,
    opacity: disabled ? 0.6 : 1,
    ...style,
  };

  const animatedShadowOpacity = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [variantStyles.shadowOpacity, variantStyles.shadowOpacity * 2],
  });

  const animatedElevation = shadowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [variantStyles.elevation, variantStyles.elevation * 1.5],
  });

  const CardContent = () => (
    <Animated.View
      style={[
        cardStyle,
        {
          transform: [{ scale: scaleAnim }],
          shadowOpacity: animatedShadowOpacity,
          elevation: animatedElevation,
        },
      ]}
    >
      {children}
    </Animated.View>
  );

  if (onPress && !disabled) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ opacity: 1 }}
      >
        <CardContent />
      </Pressable>
    );
  }

  return <CardContent />;
};

// Specialized card variants for common use cases
export const ElevatedCard: React.FC<Omit<AnimatedCardProps, 'variant'>> = (props) => (
  <AnimatedCard {...props} variant="elevated" />
);

export const OutlinedCard: React.FC<Omit<AnimatedCardProps, 'variant'>> = (props) => (
  <AnimatedCard {...props} variant="outlined" />
);

// Card with list item animation
interface AnimatedListItemProps extends AnimatedCardProps {
  index: number;
}

export const AnimatedListItem: React.FC<AnimatedListItemProps> = ({ 
  index, 
  children, 
  ...props 
}) => {
  const { translateY, opacity } = useListItemAnimation(index);

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        opacity,
      }}
    >
      <AnimatedCard {...props}>
        {children}
      </AnimatedCard>
    </Animated.View>
  );
};
