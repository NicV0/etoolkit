import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { colors } from '../../lib/theme/tokens';

export function Row({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} accessibilityRole="button" hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <View
        className="px-4 py-3"
        style={{ backgroundColor: 'colors.card', borderBottomColor: colors.border, borderBottomWidth: 1 }}
      >
        {children}
      </View>
    </TouchableOpacity>
  );
}