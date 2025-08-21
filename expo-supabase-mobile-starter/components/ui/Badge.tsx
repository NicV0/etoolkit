import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  style,
}) => {
  const { isDark } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary-100 text-primary-800 border-primary-200';
      case 'secondary':
        return `bg-gray-100 ${isDark ? 'text-gray-300 border-gray-600' : 'text-gray-700 border-gray-300'}`;
      case 'success':
        return 'bg-success-100 text-success-800 border-success-200';
      case 'warning':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'error':
        return 'bg-error-100 text-error-800 border-error-200';
      case 'outline':
        return `bg-transparent ${isDark ? 'text-gray-300 border-gray-600' : 'text-gray-700 border-gray-300'}`;
      default:
        return `bg-gray-100 ${isDark ? 'text-gray-300 border-gray-600' : 'text-gray-700 border-gray-300'}`;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'md':
        return 'px-3 py-1 text-sm';
      case 'lg':
        return 'px-4 py-2 text-base';
      default:
        return 'px-3 py-1 text-sm';
    }
  };

  return (
    <View
      className={`
        inline-flex items-center justify-center
        border rounded-full font-medium
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${className}
      `}
      style={style}
    >
      <Text className="font-medium">
        {children}
      </Text>
    </View>
  );
};
