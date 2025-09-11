import React from 'react';

import { View, TextInput, ViewStyle } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { theme } from '../../lib/theme/tokens';
import IconButton from './IconButton';

export type SearchBarProps = {
  /**
   * Current value of the search input.
   */
  value: string;
  /**
   * Change handler called whenever the text changes.
   */
  onChangeText: (text: string) => void;
  /**
   * Placeholder text shown when value is empty.
   */
  placeholder: string;
  /**
   * Optional accessibility label. If omitted the placeholder is used.
   */
  accessibilityLabel?: string;
  /**
   * Called when the user submits the search (keyboard submit).
   */
  onSubmit?: (query: string) => void;
  /**
   * Called when the clear button is pressed. Defaults to onChangeText('').
   */
  onClear?: () => void;
  /**
   * Disables the input when true.
   */
  disabled?: boolean;
  /**
   * Auto focus the input when mounted.
   */
  autoFocus?: boolean;
  /**
   * Style overrides for the search bar container.
   */
  style?: ViewStyle;
  /** Test IDs for e2e */
  testID?: string;
  inputTestID?: string;
  clearButtonTestID?: string;
  /** Optional clear button toggle */
  allowClear?: boolean;
  /** Max input length */
  maxLength?: number;
};

export default function SearchBar({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
  onSubmit,
  onClear,
  disabled = false,
  autoFocus = false,
  style,
  testID,
  inputTestID,
  clearButtonTestID,
  allowClear = true,
  maxLength,
}: SearchBarProps) {
  const handleSubmit = () => {
    if (onSubmit) onSubmit(value);
  };

  const handleClear = () => {
    if (onClear) onClear();
    else onChangeText('');
  };

  return (
    <View
      accessibilityRole="search"
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.semantic.colors.input.background,
          borderRadius: theme.semantic.radii.md,
          paddingHorizontal: theme.semantic.spacing.md,
          paddingVertical: theme.semantic.spacing.sm,
          borderWidth: 1,
          borderColor: theme.semantic.colors.border.subtle,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      accessibilityLabel={accessibilityLabel ?? placeholder}
      testID={testID}
    >
      <Search color={theme.semantic.colors.text.secondary} size={theme.iconSizes.md} />
      <TextInput
        style={{
          flex: 1,
          marginLeft: theme.semantic.spacing.sm,
          color: theme.semantic.colors.text.primary,
          fontSize: theme.semantic.type.body,
          backgroundColor: 'transparent',
        }}
        value={value}
        onChangeText={(text) => {
          if (disabled) return;
          const next = typeof maxLength === 'number' ? text.slice(0, maxLength) : text;
          onChangeText(next);
        }}
        placeholder={placeholder}
        placeholderTextColor={theme.semantic.colors.text.muted}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!disabled}
        onSubmitEditing={handleSubmit}
        autoFocus={autoFocus}
        maxLength={maxLength}
        testID={inputTestID}
      />
      {!!value && allowClear && !disabled && (
        <IconButton
          accessibilityLabel="Clear search"
          onPress={handleClear}
          icon={<X color={theme.semantic.colors.text.secondary} size={theme.iconSizes.sm} />}
          size="sm"
          variant="ghost"
          testID={clearButtonTestID}
        />
      )}
    </View>
  );
}
