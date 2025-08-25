import React, { useState, forwardRef } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
  AccessibilityRole,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';
import { theme } from '../../lib/theme/tokens';
import { inputStyles, textStyles } from '../../lib/theme/utils';

// Input variants
export type InputVariant = 'default' | 'filled' | 'outlined';

// Input sizes
export type InputSize = 'sm' | 'md' | 'lg';

// Input props interface
export interface InputProps extends Omit<TextInputProps, 'style'> {
  // Content
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  
  // Variants
  variant?: InputVariant;
  size?: InputSize;
  
  // States
  error?: string;
  disabled?: boolean;
  required?: boolean;
  
  // Styling
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  
  // Icons
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  
  // Accessibility
  accessibilityLabel?: string;
  accessibilityHint?: string;
  
  // Other
  fullWidth?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

// Input component
export const Input = React.memo(forwardRef<TextInput, InputProps>(({
  label,
  placeholder,
  value,
  onChangeText,
  variant = 'default',
  size = 'md',
  error,
  disabled = false,
  required = false,
  style,
  inputStyle,
  labelStyle,
  errorStyle,
  leftIcon,
  rightIcon,
  accessibilityLabel,
  accessibilityHint,
  fullWidth = false,
  multiline = false,
  numberOfLines = 1,
  ...textInputProps
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  // Handle focus
  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    textInputProps.onFocus?.(e);
  };

  // Handle blur
  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    textInputProps.onBlur?.(e);
  };

  // Get container styles
  const getContainerStyle = (): ViewStyle => {
    const baseStyle = inputStyles.base;
    const variantStyle = getVariantStyle(variant);
    const sizeStyle = getSizeStyle(size);
    const stateStyle = getStateStyle();
    const widthStyle = fullWidth ? { width: '100%' as const } : {};

    return {
      ...baseStyle,
      ...variantStyle,
      ...sizeStyle,
      ...stateStyle,
      ...widthStyle,
    };
  };

  // Get variant-specific styles
  const getVariantStyle = (inputVariant: InputVariant): ViewStyle => {
    switch (inputVariant) {
      case 'filled':
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: 0,
        };
      case 'outlined':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      default:
        return {};
    }
  };

  // Get size-specific styles
  const getSizeStyle = (inputSize: InputSize): ViewStyle => {
    switch (inputSize) {
      case 'sm':
        return {
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.sm,
          minHeight: 36,
        };
      case 'lg':
        return {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.lg,
          minHeight: 56,
        };
      default: // md
        return {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.md,
          minHeight: 44,
        };
    }
  };

  // Get state-specific styles
  const getStateStyle = (): ViewStyle => {
    if (disabled) {
      return inputStyles.disabled;
    }
    if (error) {
      return inputStyles.error;
    }
    if (isFocused) {
      return inputStyles.focused;
    }
    return {};
  };

  // Get input styles
  const getInputStyle = (): TextStyle => {
    const baseStyle = {
      fontSize: theme.typography.fontSize.body,
      color: theme.colors.text.primary,
      flex: 1,
    };

    if (multiline) {
      return {
        ...baseStyle,
        textAlignVertical: 'top',
        minHeight: numberOfLines * 20,
      };
    }

    return baseStyle;
  };

  // Get label styles
  const getLabelStyle = (): TextStyle => {
    return {
      ...textStyles.bodyStrong,
      marginBottom: theme.spacing.xs,
    };
  };

  // Get error styles
  const getErrorStyle = (): TextStyle => {
    return {
      ...textStyles.caption,
      color: theme.colors.error,
      marginTop: theme.spacing.xs,
    };
  };

  // Determine accessibility role
  const getAccessibilityRole = (): AccessibilityRole => {
    return 'text';
  };

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <Text style={[getLabelStyle(), labelStyle]}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      )}

      {/* Input Container */}
      <View style={[styles.inputContainer, getContainerStyle()]}>
        {/* Left Icon */}
        {leftIcon && (
          <View style={styles.leftIcon}>
            {leftIcon}
          </View>
        )}

        {/* Text Input */}
        <TextInput
          ref={ref}
          style={[getInputStyle(), inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.text.muted}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          accessibilityRole={getAccessibilityRole()}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled }}
          {...textInputProps}
        />

        {/* Right Icon */}
        {rightIcon && (
          <View style={styles.rightIcon}>
            {rightIcon}
          </View>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <Text style={[getErrorStyle(), errorStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
}));

// Styles
const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftIcon: {
    marginRight: theme.spacing.sm,
  },
  rightIcon: {
    marginLeft: theme.spacing.sm,
  },
  required: {
    color: theme.colors.error,
  },
});

// Export input variants as separate components for convenience
export const FilledInput = forwardRef<TextInput, Omit<InputProps, 'variant'>>((props, ref) => (
  <Input {...props} ref={ref} variant="filled" />
));

export const OutlinedInput = forwardRef<TextInput, Omit<InputProps, 'variant'>>((props, ref) => (
  <Input {...props} ref={ref} variant="outlined" />
));

// Export with display name for debugging
Input.displayName = 'Input';
FilledInput.displayName = 'FilledInput';
OutlinedInput.displayName = 'OutlinedInput';
