import React from 'react';
import { View, TextInput } from 'react-native';
import { semantic, theme } from '../../lib/theme/tokens';
import { Search } from 'lucide-react-native';

/**
 * A compact search input with a leading search icon. You must pass
 * value/onChangeText to control the input from the parent. For a more
 * accessible experience, specify an accessibilityLabel.
 */
export default function SearchBar({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  accessibilityLabel?: string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: semantic.colors.background.surface,
        borderRadius: semantic.radii.md,
        paddingHorizontal: semantic.spacing.md,
        paddingVertical: semantic.spacing.sm,
      }}
    >
      <Search color={semantic.colors.text.primary as any} size={theme.iconSizes.md} />
      <TextInput
        style={{
          flex: 1,
          marginLeft: semantic.spacing.sm,
          color: semantic.colors.text.primary as any,
          fontSize: theme.typography.fontSize.body,
        }}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={semantic.colors.text.muted as any}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}