import React, { useState, useRef, useCallback } from 'react';
import { View, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { Search } from 'lucide-react-native';
import { theme } from '../../lib/theme/tokens';

export interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSearch?: (query: string) => void;
  style?: ViewStyle;
  debounceMs?: number;
  disabled?: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = React.memo(({
  placeholder = 'Search...',
  value = '',
  onChangeText,
  onSearch,
  style,
  debounceMs = 300,
  disabled = false,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const handleTextChange = useCallback((text: string) => {
    setInputValue(text);
    onChangeText?.(text);

    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Set new timeout for search
    if (onSearch) {
      debounceTimeoutRef.current = setTimeout(() => {
        onSearch(text);
      }, debounceMs);
    }
  }, [onChangeText, onSearch, debounceMs]);

  const handleSubmit = useCallback(() => {
    if (onSearch) {
      onSearch(inputValue);
    }
  }, [onSearch, inputValue]);

  return (
    <View style={[styles.container, style]}>
      <Search size={20} color={theme.colors.text.secondary} style={styles.icon} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.text.muted}
        value={inputValue}
        onChangeText={handleTextChange}
        onSubmitEditing={handleSubmit}
        editable={!disabled}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.primary,
    backgroundColor: 'transparent',
  },
});
