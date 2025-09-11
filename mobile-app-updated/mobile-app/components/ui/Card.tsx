import React from 'react';
import { View, ViewStyle } from 'react-native';
import { semantic } from '../../lib/theme/tokens';

/**
 * Card is a container with padding and a subtle background. Use cards to
 * group related content together. You can override the style prop to
 * customise spacing or layout, but avoid changing the background colour
 * directly to keep a consistent look throughout the app.
 */
export default function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View
      style={[
        {
          backgroundColor: semantic.colors.background.surface,
          borderRadius: semantic.radii.md,
          padding: semantic.spacing.lg,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}