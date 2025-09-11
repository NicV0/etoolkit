import React from 'react';
import { Text, TouchableOpacity, ViewStyle } from 'react-native';
import { theme } from '../../lib/theme/tokens';

export type PillProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
};

export const Pill: React.FC<PillProps> = ({ label, selected, onPress, style, testID }) => {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={[{
        borderRadius: theme.semantic.radii.full,
        paddingVertical: theme.semantic.spacing.xs,
        paddingHorizontal: theme.semantic.spacing.sm,
        backgroundColor: selected ? theme.semantic.colors.accent.primary : 'transparent',
        borderColor: selected ? theme.semantic.colors.accent.primary : theme.semantic.colors.border.subtle,
        borderWidth: 1,
      }, style]}
      testID={testID}
    >
      <Text style={{ color: selected ? theme.semantic.colors.text.inverse : theme.semantic.colors.text.primary }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default Pill;
