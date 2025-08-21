import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface EmptyStateProps {
  title: string;
  description?: string;
  subtitle?: string; // Alias for description
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  subtitle,
  icon,
  action,
  className = '',
  style,
}) => {
  const { isDark } = useTheme();

  // Use subtitle as description if provided
  const finalDescription = description || subtitle;

  const getTextColor = () => {
    return isDark ? 'text-gray-300' : 'text-gray-600';
  };

  const getIconColor = () => {
    return isDark ? 'text-gray-400' : 'text-gray-300';
  };

  return (
    <View className={`flex-1 items-center justify-center px-8 py-12 ${className}`} style={style}>
      {icon && (
        <View className={`mb-4 ${getIconColor()}`}>
          {icon}
        </View>
      )}
      
      <Text className={`text-lg font-semibold text-center mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {title}
      </Text>
      
      {finalDescription && (
        <Text className={`text-base text-center mb-6 ${getTextColor()}`}>
          {finalDescription}
        </Text>
      )}
      
      {action && (
        <View className="w-full max-w-xs">
          {action}
        </View>
      )}
    </View>
  );
};
