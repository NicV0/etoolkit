import React from 'react';
import { View, TextInput } from 'react-native';
import { colors, borderRadius } from '../../lib/theme/tokens';
import { Search } from 'lucide-react-native';

export function SearchBar({ value, onChangeText, placeholder='Search' } : { value: string; onChangeText: (t:string)=>void; placeholder?: string }) {
  return (
    <View style={{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      marginBottom: 16, 
      paddingHorizontal: 12, 
      paddingVertical: 8,
      backgroundColor: '#FFFFFF18', 
      borderRadius: borderRadius.lg, 
      borderColor: colors.border, 
      borderWidth: 1 
    }}>
      <Search color={colors.text.muted} size={18} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.muted}
        style={{ marginLeft: 8, color: colors.text.primary, flex: 1, fontFamily: 'Inter_400Regular' }}
      />
    </View>
  );
}
