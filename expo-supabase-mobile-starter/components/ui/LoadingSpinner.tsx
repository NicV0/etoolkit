import React from 'react';
import { View, ActivityIndicator, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  className?: string;
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color,
  text,
  className = '',
  style,
}) => {
  const { theme, isDark } = useTheme();

  const getSpinnerColor = () => {
    if (color) return color;
    return theme.colors.primary[500];
  };

  const getTextColor = () => {
    return isDark ? 'text-gray-300' : 'text-gray-600';
  };

  return (
    <View className={`items-center justify-center ${className}`} style={style}>
      <ActivityIndicator
        size={size}
        color={getSpinnerColor()}
      />
      {text && (
        <Text className={`mt-3 text-sm ${getTextColor()}`}>
          {text}
        </Text>
      )}
    </View>
  );
};
