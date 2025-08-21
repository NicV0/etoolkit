import React from 'react';
import { Pressable, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void;
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onPress,
  children,
  className = '',
  style,
  textStyle,
}) => {
  const { theme, isDark } = useTheme();

  const getVariantStyles = () => {
    const baseStyles = 'flex-row items-center justify-center rounded-lg';
    
    switch (variant) {
      case 'primary':
        return `${baseStyles} bg-primary-500 ${disabled ? 'opacity-50' : 'active:bg-primary-600'}`;
      case 'secondary':
        return `${baseStyles} bg-gray-100 ${isDark ? 'bg-gray-800' : ''} ${disabled ? 'opacity-50' : 'active:bg-gray-200'}`;
      case 'ghost':
        return `${baseStyles} bg-transparent ${disabled ? 'opacity-50' : 'active:bg-gray-100'}`;
      case 'danger':
        return `${baseStyles} bg-error-500 ${disabled ? 'opacity-50' : 'active:bg-error-600'}`;
      default:
        return baseStyles;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-2';
      case 'md':
        return 'px-4 py-2';
      case 'lg':
        return 'px-6 py-3';
      default:
        return 'px-4 py-2';
    }
  };

  const getTextStyles = () => {
    const baseTextStyles = 'font-medium text-center';
    
    switch (variant) {
      case 'primary':
        return `${baseTextStyles} text-white`;
      case 'secondary':
        return `${baseTextStyles} ${isDark ? 'text-white' : 'text-gray-900'}`;
      case 'ghost':
        return `${baseTextStyles} text-primary-500`;
      case 'danger':
        return `${baseTextStyles} text-white`;
      default:
        return baseTextStyles;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-sm';
      case 'md':
        return 'text-base';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  return (
    <Pressable
      className={`${getVariantStyles()} ${getSizeStyles()} ${className}`}
      onPress={onPress}
      disabled={disabled || loading}
      style={style}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? 'white' : theme.colors.primary[500]}
          style={{ marginRight: 8 }}
        />
      )}
      <Text
        className={`${getTextStyles()} ${getTextSize()}`}
        style={textStyle}
      >
        {children}
      </Text>
    </Pressable>
  );
};
