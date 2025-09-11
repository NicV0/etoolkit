import React from 'react';
import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '../../lib/theme/tokens';

export type SelectOption<T = string> = {
  label: string;
  value: T;
  disabled?: boolean;
};

export type SelectProps<T = string> = {
  label?: string;
  value?: T;
  onChange: (value: T) => void;
  options: Array<SelectOption<T>>;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  style?: ViewStyle;
  testID?: string;
  inputTestID?: string;
  triggerTestID?: string;
};

// Simple inline select for MVP (can be swapped for ActionSheet later)
export const Select = <T extends string | number | symbol>({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select…',
  disabled,
  error,
  style,
  testID,
  inputTestID,
  triggerTestID,
}: SelectProps<T>) => {
  const selected = options.find(o => o.value === value);

  return (
    <View style={[{ marginBottom: theme.semantic.spacing.md }, style]} testID={testID}>
      {label && (
        <Text style={{
          color: theme.semantic.colors.text.primary,
          marginBottom: theme.semantic.spacing.xs,
          fontSize: theme.semantic.type.body,
          fontWeight: theme.semantic.type.weight.medium,
        }}>
          {label}
        </Text>
      )}
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={label || placeholder}
        accessibilityState={{ disabled: !!disabled, selected: !!selected }}
        disabled={disabled}
        testID={triggerTestID || 'select.trigger'}
        onPress={() => {
          if (disabled) return;
          // For MVP, cycle through options; skip disabled options
          let idx = Math.max(0, options.findIndex(o => o.value === value));
          let attempts = 0;
          let next = options[(idx + 1) % options.length];
          while (next?.disabled && attempts < options.length) {
            idx = (idx + 1) % options.length;
            next = options[(idx + 1) % options.length];
            attempts++;
          }
          if (next && !next.disabled) onChange(next.value);
        }}
        style={{
          backgroundColor: disabled ? theme.semantic.colors.interactive.disabled : theme.semantic.colors.input.background,
          borderColor: error ? theme.semantic.colors.state.danger : theme.semantic.colors.border.subtle,
          borderWidth: 1,
          borderRadius: theme.semantic.radii.md,
          paddingVertical: theme.semantic.spacing.sm,
          paddingHorizontal: theme.semantic.spacing.md,
        }}
      >
        <Text testID={inputTestID} style={{ color: selected ? theme.semantic.colors.text.primary : theme.semantic.colors.text.muted }}>
          {selected ? selected.label : placeholder}
        </Text>
      </TouchableOpacity>
      {error && (
        <Text style={{ color: theme.semantic.colors.state.danger, fontSize: theme.semantic.type.meta, marginTop: theme.semantic.spacing.xs }}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default Select;
