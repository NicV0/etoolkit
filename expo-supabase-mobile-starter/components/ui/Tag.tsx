import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { theme } from '../../lib/theme/tokens';

export type TagProps = {
  label: string;
  color?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  style?: ViewStyle;
  testID?: string;
};

export const Tag: React.FC<TagProps> = ({ label, color = 'neutral', style, testID }) => {
  const bg =
    color === 'success' ? theme.semantic.colors.state.success :
    color === 'warning' ? theme.semantic.colors.state.warning :
    color === 'danger' ? theme.semantic.colors.state.danger :
    color === 'info' ? theme.semantic.colors.state.info :
    theme.semantic.colors.background.surface;
  const text = color === 'neutral' ? theme.semantic.colors.text.primary : theme.semantic.colors.text.inverse;

  return (
    <View style={[{
      alignSelf: 'flex-start',
      borderRadius: theme.semantic.radii.sm,
      paddingVertical: theme.semantic.spacing.xs,
      paddingHorizontal: theme.semantic.spacing.sm,
      backgroundColor: bg,
    }, style]} testID={testID}>
      <Text style={{ color: text, fontSize: theme.semantic.type.meta, fontWeight: theme.semantic.type.weight.medium }}>
        {label}
      </Text>
    </View>
  );
};

export default Tag;
