import React from 'react';
import { ActivityIndicator, View, ViewStyle } from 'react-native';
import { theme } from '../../lib/theme/tokens';

export type LoadingSpinnerProps = {
  /**
   * The size of the spinner.
   */
  size?: 'small' | 'large';
  /**
   * The color of the spinner. Defaults to primary color.
   */
  color?: string;
  /**
   * Style overrides for the container.
   */
  style?: ViewStyle;
};

export default function LoadingSpinner({
  size = 'large',
  color = theme.semantic.colors.accent.primary,
  style,
}: LoadingSpinnerProps) {
  return (
    <View style={[{ justifyContent: 'center', alignItems: 'center' }, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}
