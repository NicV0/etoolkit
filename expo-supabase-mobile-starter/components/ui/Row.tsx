import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { colors } from '../../lib/theme/tokens';

export function Row({ children, onPress } : { children: React.ReactNode; onPress?: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <View style={{ 
        paddingHorizontal: 16, 
        paddingVertical: 12, 
        backgroundColor: '#FFFFFF1A', 
        borderBottomColor: colors.border, 
        borderBottomWidth: 1 
      }}>
        {children}
      </View>
    </TouchableOpacity>
  );
}
