import React from 'react';
import { TextInput, View, Text, ViewStyle } from 'react-native';
import { theme } from '../../lib/theme/tokens';

export type InputProps = {
  /**
   * A label displayed above the input. If undefined no label is shown.
   */
  label?: string;
  /**
   * Current value of the text input. Must be controlled by the parent.
   */
  value: string;
  /**
   * Change handler called whenever the text changes.
   */
  onChangeText: (text: string) => void;
  /**
   * Placeholder text shown when value is empty.
   */
  placeholder?: string;
  /**
   * Keyboard type hint. Defaults to 'default'.
   */
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  /**
   * The return key type hint. Defaults to 'next'.
   */
  returnKeyType?: 'done' | 'next' | 'send' | 'search';
  /**
   * Hides the text input contents for sensitive fields. Defaults to false.
   */
  secureTextEntry?: boolean;
  /**
   * Disables the input when true.
   */
  disabled?: boolean;
  /**
   * Shows an error state when true.
   */
  error?: boolean;
  /**
   * Error message to display below the input.
   */
  errorMessage?: string;
  /**
   * Style overrides for the container.
   */
  style?: ViewStyle;
  /** Test IDs for e2e */
  testID?: string;
  inputTestID?: string;
  /**
   * Style overrides for the input field.
   */
  inputStyle?: ViewStyle;
  /**
   * Optional accessibility label. If omitted the label is used.
   */
  accessibilityLabel?: string;
  /**
   * Auto-capitalize behavior. Defaults to 'sentences'.
   */
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  /**
   * Auto-correct behavior. Defaults to true.
   */
  autoCorrect?: boolean;
  /**
   * Auto-complete behavior.
   */
  autoComplete?: 'off' | 'username' | 'password' | 'email' | 'name' | 'tel' | 'street-address' | 'postal-code' | 'cc-number' | 'cc-csc' | 'cc-exp' | 'cc-exp-month' | 'cc-exp-year';
};

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  returnKeyType = 'next',
  secureTextEntry = false,
  disabled = false,
  error = false,
  errorMessage,
  style,
  inputStyle,
  accessibilityLabel,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  autoComplete,
testID,
  inputTestID,
}: InputProps) {
  const getBorderColor = () => {
    if (error) return theme.semantic.colors.state.danger;
    if (disabled) return theme.semantic.colors.border.subtle;
    return theme.semantic.colors.border.subtle;
  };

  const getBackgroundColor = () => {
    if (disabled) return theme.semantic.colors.interactive.disabled;
    return theme.semantic.colors.input.background;
  };

  const getTextColor = () => {
    if (disabled) return theme.semantic.colors.text.muted;
    return theme.semantic.colors.text.primary;
  };

  return (
    <View style={[{ marginBottom: theme.semantic.spacing.md }, style]} testID={testID}>
      {label && (
        <Text
          style={{
            color: theme.semantic.colors.text.primary,
            marginBottom: theme.semantic.spacing.sm,
            fontSize: theme.semantic.type.body,
            fontWeight: theme.semantic.type.weight.medium,
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.semantic.colors.text.muted}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        secureTextEntry={secureTextEntry}
        editable={!disabled}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        autoComplete={autoComplete}
        style={[
          {
            backgroundColor: getBackgroundColor(),
            color: getTextColor(),
            paddingVertical: theme.semantic.spacing.sm,
            paddingHorizontal: theme.semantic.spacing.md,
            borderRadius: theme.semantic.radii.md,
            fontSize: theme.semantic.type.body,
            borderWidth: 1,
            borderColor: getBorderColor(),
          },
          inputStyle,
        ]}
        accessibilityLabel={accessibilityLabel ?? label}
        testID={inputTestID}
      />
      {error && errorMessage && (
        <Text
          style={{
            color: theme.semantic.colors.state.danger,
            fontSize: theme.semantic.type.meta,
            marginTop: theme.semantic.spacing.xs,
          }}
        >
          {errorMessage}
        </Text>
      )}
    </View>
  );
}

// Convenience components for common variants
export const FilledInput = (props: Omit<InputProps, 'variant'>) => (
  <Input {...props} />
);

export const OutlinedInput = (props: Omit<InputProps, 'variant'>) => (
  <Input {...props} />
);
