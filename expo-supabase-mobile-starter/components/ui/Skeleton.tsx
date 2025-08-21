import React from 'react';
import { View, Animated } from 'react-native';
import { designSystem } from '../../theme/design-system';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = designSystem.borderRadius.md,
  style 
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: false,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: designSystem.colors.gray[200],
          opacity,
        },
        style,
      ]}
    />
  );
};

interface SkeletonCardProps {
  lines?: number;
  lineHeight?: number;
  spacing?: number;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ 
  lines = 3, 
  lineHeight = 16, 
  spacing = 8 
}) => {
  return (
    <View style={{
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: designSystem.borderRadius.xl,
      padding: designSystem.spacing.lg,
      marginBottom: designSystem.spacing.sm,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.6)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height={lineHeight}
          style={{
            marginBottom: index === lines - 1 ? 0 : spacing,
            width: index === 0 ? '80%' : index === 1 ? '60%' : '40%',
          }}
        />
      ))}
    </View>
  );
};

interface SkeletonListProps {
  count?: number;
  cardLines?: number;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({ 
  count = 5, 
  cardLines = 3 
}) => {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} lines={cardLines} />
      ))}
    </View>
  );
};
