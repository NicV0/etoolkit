import React from 'react';
import { View } from 'react-native';
import { tokens } from '../../lib/theme/tokens';

/**
 * A simple wrapper that applies the app background and horizontal padding
 * consistently across screens. Wrap your entire page in this component
 * instead of a bare View so spacing and colors remain uniform.
 */
export default function Screen({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: tokens.colors.background,
        paddingHorizontal: tokens.spacing.lg,
        paddingTop: tokens.spacing.lg,
      }}
    >
      {children}
    </View>
  );
}