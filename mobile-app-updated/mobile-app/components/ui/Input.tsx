import React from 'react';
import { TextInput, View, Text } from 'react-native';
import { semantic, theme } from '../../lib/theme/tokens';

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
  keyboardType?: 'default' | 'email-address' | 'numeric';
  /**
   * The return key type hint. Defaults to 'next'.
   */
  returnKeyType?: 'done' | 'next' | 'send';
  /**
   * Hides the text input contents for sensitive fields. Defaults to false.
   */
  secureTextEntry?: boolean;
};

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  returnKeyType = 'next',
  secureTextEntry = false,
}: InputProps) {
  return (
    <View style={{ marginBottom: semantic.spacing.md }}>
      {label && (
        <Text
          style={{
            color: semantic.colors.text.primary,
            marginBottom: semantic.spacing.sm,
            fontSize: theme.typography.fontSize.body,
            fontWeight: '500',
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={semantic.colors.text.muted as any}
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        secureTextEntry={secureTextEntry}
        style={{
          backgroundColor: semantic.colors.input.background as any,
          color: semantic.colors.text.primary as any,
          paddingVertical: semantic.spacing.sm,
          paddingHorizontal: semantic.spacing.md,
          borderRadius: semantic.radii.md,
          fontSize: theme.typography.fontSize.body,
        }}
      />
    </View>
  );
}