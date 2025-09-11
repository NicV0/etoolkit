import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { theme } from '../../lib/theme/tokens';

export type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  style?: ViewStyle;
  testID?: string;
};

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action, style, testID }) => {
  return (
    <View style={[{
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.semantic.spacing.lg,
      borderRadius: theme.semantic.radii.lg,
      borderColor: theme.semantic.colors.border.subtle,
      borderWidth: 1,
      backgroundColor: theme.semantic.colors.background.surface,
    }, style]} testID={testID}>
      <Text style={{ color: theme.semantic.colors.text.primary, fontSize: theme.semantic.type.section, fontWeight: theme.semantic.type.weight.semibold, marginBottom: theme.semantic.spacing.sm }}>
        {title}
      </Text>
      {description && (
        <Text style={{ color: theme.semantic.colors.text.secondary, marginBottom: theme.semantic.spacing.md, textAlign: 'center' }}>
          {description}
        </Text>
      )}
      {action}
    </View>
  );
};

export default EmptyState;
