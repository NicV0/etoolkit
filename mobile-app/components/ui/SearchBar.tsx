import React from 'react';
import { View, TextInput } from 'react-native';
import { colors, radii } from '../../lib/theme/tokens';
import { Search } from 'lucide-react-native';

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search',
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
}) {
  return (
    <View
      className="flex-row items-center mb-4 px-3 py-2"
      style={{ backgroundColor: 'colors.card', borderRadius: radii.lg, borderColor: colors.border, borderWidth: 1 }}
    >
      <Search color={colors.textMuted} size={18} />
      <TextInput accessibilityLabel={placeholder} returnKeyType="search" autoCorrect={false} autoCapitalize="none"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={{ marginLeft: 8, color: colors.text, flex: 1, fontFamily: 'Inter_400Regular' }}
      />
    </View>
  );
}