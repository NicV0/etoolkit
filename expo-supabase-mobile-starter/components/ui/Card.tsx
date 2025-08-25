import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  AccessibilityRole,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { theme } from '../../lib/theme/tokens';
import { commonStyles } from '../../lib/theme/utils';

// Card variants
export type CardVariant = 'default' | 'elevated' | 'outlined' | 'interactive';

// Card props interface
export interface CardProps {
  // Content
  children: React.ReactNode;
  
  // Variants
  variant?: CardVariant;
  
  // Interactive
  onPress?: () => void;
  disabled?: boolean;
  
  // Styling
  style?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  
  // Other
  fullWidth?: boolean;
}

// Card component
export const Card: React.FC<CardProps> = React.memo(({
  children,
  variant = 'default',
  onPress,
  disabled = false,
  style,
  padding = 'md',
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
    if (onPress && !disabled) {
      scale.value = withTiming(0.98, { duration: theme.animation.duration.fast });
      opacity.value = withTiming(0.9, { duration: theme.animation.duration.fast });
    }
  };

  // Handle press out
  const handlePressOut = () => {
    if (onPress && !disabled) {
      scale.value = withTiming(1, { duration: theme.animation.duration.fast });
      opacity.value = withTiming(1, { duration: theme.animation.duration.fast });
    }
  };

  // Get card styles based on variant
  const getCardStyle = (): ViewStyle => {
    const baseStyle = commonStyles.card;
    const variantStyle = getVariantStyle(variant as CardVariant);
    const paddingStyle = getPaddingStyle(padding);
    const widthStyle = fullWidth ? { width: '100%' as const } : {};

    return {
      ...baseStyle,
      ...variantStyle,
      ...paddingStyle,
      ...widthStyle,
    };
  };

  // Get variant-specific styles
  const getVariantStyle = (cardVariant: CardVariant): ViewStyle => {
    switch (cardVariant) {
      case 'elevated':
        return {
          ...theme.shadows.md,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.border,
          ...theme.shadows.none,
        };
      case 'interactive':
        return {
          ...theme.shadows.sm,
        };
      default:
        return {
          ...theme.shadows.sm,
        };
    }
  };

  // Get padding styles
  const getPaddingStyle = (paddingSize: string): ViewStyle => {
    switch (paddingSize) {
      case 'none':
        return { padding: 0 };
      case 'sm':
        return { padding: theme.spacing.md };
      case 'lg':
        return { padding: theme.spacing.xl };
      default: // md
        return { padding: theme.spacing.component.padding };
    }
  };

  // Determine accessibility role
  const getAccessibilityRole = (): AccessibilityRole => {
    return onPress ? 'button' : 'none';
  };

  // Render interactive card
  if (onPress) {
    return (
      <Animated.View style={[animatedStyle, fullWidth && { width: '100%' }]}>
        <TouchableOpacity
          style={[getCardStyle(), style]}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          activeOpacity={1}
          accessibilityRole={getAccessibilityRole()}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled }}
        >
          {children}
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // Render static card
  return (
    <View
      style={[getCardStyle(), style]}
      accessibilityRole={getAccessibilityRole()}
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </View>
  );
});

// Card header component
export const CardHeader: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
}> = ({ children, style }) => {
  return (
    <View style={[styles.header, style]}>
      {children}
    </View>
  );
};

// Card content component
export const CardContent: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
}> = ({ children, style }) => {
  return (
    <View style={[styles.content, style]}>
      {children}
    </View>
  );
};

// Card footer component
export const CardFooter: React.FC<{
  children: React.ReactNode;
  style?: ViewStyle;
}> = ({ children, style }) => {
  return (
    <View style={[styles.footer, style]}>
      {children}
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  header: {
    marginBottom: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  footer: {
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
});

// Export card variants as separate components for convenience
export const ElevatedCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="elevated" />
);

export const OutlinedCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="outlined" />
);

export const InteractiveCard: React.FC<Omit<CardProps, 'variant'>> = (props) => (
  <Card {...props} variant="interactive" />
);
