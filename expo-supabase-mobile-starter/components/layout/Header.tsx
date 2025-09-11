import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '../../lib/theme/tokens';

export function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 }}>
      <Text style={{ color: colors.text.primary, fontFamily: 'Inter_800ExtraBold', fontSize: 32 }}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ color: colors.text.secondary, marginTop: 6 }}>{subtitle}</Text>
      ) : null}
    </View>
  );
}
export default Header;
