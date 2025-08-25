import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { theme } from '../../lib/theme/tokens';

// Skeleton types
export type SkeletonVariant = 'text' | 'title' | 'avatar' | 'card' | 'button';
export type SkeletonSize = 'sm' | 'md' | 'lg';

// Skeleton props interface
export interface SkeletonProps {
  // Variant
  variant?: SkeletonVariant;
  
  // Size
  size?: SkeletonSize;
  
  // Styling
  style?: ViewStyle;
  
  // Other
  width?: number | string;
  height?: number;
  lines?: number;
  spacing?: number;
}

// Skeleton component
export const Skeleton: React.FC<SkeletonProps> = React.memo(({
  variant = 'text',
  size = 'md',
  style,
  width,
  height,
  lines = 1,
  spacing = theme.spacing.sm,
}) => {
  // Animation values
  const opacity = useSharedValue(0.3);

  // Start shimmer animation
  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 750 }),
        withTiming(0.3, { duration: 750 })
      ),
      -1,
      true
    );
  }, []);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Get skeleton dimensions based on variant and size
  const getSkeletonDimensions = () => {
    const baseHeight = size === 'sm' ? 12 : size === 'lg' ? 20 : 16;
    
    switch (variant) {
      case 'title': {
        const titleHeight = size === 'sm' ? 18 : size === 'lg' ? 28 : 24;
        return {
          height: titleHeight,
          width: width || '80%',
        };
      }
      case 'avatar': {
        const avatarSize = size === 'sm' ? 32 : size === 'lg' ? 64 : 48;
        return {
          height: avatarSize,
          width: avatarSize,
          borderRadius: avatarSize / 2,
        };
      }
      case 'card':
        return {
          height: height || 120,
          width: width || '100%',
          borderRadius: theme.borderRadius.lg,
        };
      case 'button':
        return {
          height: size === 'sm' ? 32 : size === 'lg' ? 48 : 40,
          width: width || 120,
          borderRadius: theme.borderRadius.md,
        };
      default: // text
        return {
          height: baseHeight,
          width: width || '100%',
          borderRadius: theme.borderRadius.sm,
        };
    }
  };

  const dimensions = getSkeletonDimensions() as ViewStyle;

  // Render single skeleton line
  const renderSkeletonLine = () => (
    <Animated.View
      style={[
        styles.skeleton,
        dimensions,
        animatedStyle,
        style,
      ]}
    />
  );

  // Render multiple lines
  if (lines > 1) {
    return (
      <View style={styles.container}>
        {Array.from({ length: lines }).map((_, index) => (
          <View key={index} style={[styles.lineContainer, { marginBottom: spacing }]}>
            {renderSkeletonLine()}
          </View>
        ))}
      </View>
    );
  }

  return renderSkeletonLine();
});

// Skeleton text component
export const SkeletonText: React.FC<Omit<SkeletonProps, 'variant'> & { lines?: number }> = (props) => (
  <Skeleton variant="text" {...props} />
);

// Skeleton title component
export const SkeletonTitle: React.FC<Omit<SkeletonProps, 'variant'> & { lines?: number }> = (props) => (
  <Skeleton variant="title" {...props} />
);

// Skeleton avatar component
export const SkeletonAvatar: React.FC<Omit<SkeletonProps, 'variant' | 'lines'>> = (props) => (
  <Skeleton variant="avatar" {...props} />
);

// Skeleton card component
export const SkeletonCard: React.FC<Omit<SkeletonProps, 'variant' | 'lines'>> = (props) => (
  <Skeleton variant="card" {...props} />
);

// Skeleton button component
export const SkeletonButton: React.FC<Omit<SkeletonProps, 'variant' | 'lines'>> = (props) => (
  <Skeleton variant="button" {...props} />
);

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lineContainer: {
    flex: 1,
  },
  skeleton: {
    backgroundColor: theme.colors.surface,
  },
});

// Export with display name for debugging
Skeleton.displayName = 'Skeleton';
SkeletonText.displayName = 'SkeletonText';
SkeletonTitle.displayName = 'SkeletonTitle';
SkeletonAvatar.displayName = 'SkeletonAvatar';
SkeletonCard.displayName = 'SkeletonCard';
SkeletonButton.displayName = 'SkeletonButton';
