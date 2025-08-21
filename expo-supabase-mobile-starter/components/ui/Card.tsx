import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  style,
  padding = 'md',
  shadow = 'sm',
  border = true,
}) => {
  const { theme, isDark } = useTheme();

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return '';
      case 'sm':
        return 'p-3';
      case 'md':
        return 'p-4';
      case 'lg':
        return 'p-6';
      default:
        return 'p-4';
    }
  };

  const getShadowStyles = () => {
    if (shadow === 'none') return '';
    
    const shadowStyle = theme.shadows[shadow];
    return 'rounded-lg';
  };

  const getBorderStyles = () => {
    if (!border) return '';
    return `border ${isDark ? 'border-gray-700' : 'border-gray-200'}`;
  };

  const getBackgroundStyles = () => {
    return `bg-white ${isDark ? 'bg-gray-800' : ''}`;
  };

  return (
    <View
      className={`${getBackgroundStyles()} ${getBorderStyles()} ${getShadowStyles()} ${getPaddingStyles()} ${className}`}
      style={[
        shadow !== 'none' && theme.shadows[shadow],
        style,
      ]}
    >
      {children}
    </View>
  );
};
