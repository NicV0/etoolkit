import React, { forwardRef } from 'react';
import { TextInput, View, Text, TextInputProps, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  style?: ViewStyle;
  inputStyle?: ViewStyle;
}

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  style,
  inputStyle,
  ...props
}, ref) => {
  const { theme, isDark } = useTheme();

  const getBorderColor = () => {
    if (error) return 'border-error-500';
    return isDark ? 'border-gray-600' : 'border-gray-300';
  };

  const getBackgroundColor = () => {
    return isDark ? 'bg-gray-800' : 'bg-white';
  };

  const getTextColor = () => {
    return isDark ? 'text-white' : 'text-gray-900';
  };

  const getPlaceholderColor = () => {
    return isDark ? theme.colors.gray[400] : theme.colors.gray[500];
  };

  return (
    <View className={`${className}`} style={style}>
      {label && (
        <Text className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          {label}
        </Text>
      )}
      
      <View className={`relative`}>
        {leftIcon && (
          <View className="absolute left-3 top-0 bottom-0 justify-center z-10">
            {leftIcon}
          </View>
        )}
        
        <TextInput
          ref={ref}
          className={`
            ${getBackgroundColor()} 
            ${getBorderColor()} 
            ${getTextColor()}
            border rounded-lg px-4 py-3 text-base
            ${leftIcon ? 'pl-12' : ''}
            ${rightIcon ? 'pr-12' : ''}
            ${error ? 'border-error-500' : ''}
          `}
          placeholderTextColor={getPlaceholderColor()}
          style={inputStyle}
          {...props}
        />
        
        {rightIcon && (
          <View className="absolute right-3 top-0 bottom-0 justify-center z-10">
            {rightIcon}
          </View>
        )}
      </View>
      
      {(error || helperText) && (
        <Text 
          className={`text-sm mt-2 ${error ? 'text-error-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
});

Input.displayName = 'Input';
