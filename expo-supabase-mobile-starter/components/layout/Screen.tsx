import React from 'react';
import { View, ViewStyle } from 'react-native';
import { theme } from '../../lib/theme/tokens';

export type ScreenProps = {
  /**
   * The content to display in the screen.
   */
  children: React.ReactNode;
  /**
   * Style overrides for the screen container.
   */
  style?: ViewStyle;
  /**
   * Whether to apply safe area padding. Defaults to true.
   */
  safeArea?: boolean;
  /** Test ID for e2e */
  testID?: string;
};

export default function Screen({
  children,
  style,
  safeArea = true,
  testID,
}: ScreenProps) {
  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: theme.colors.background,
          paddingHorizontal: theme.spacing.lg,
          paddingTop: safeArea ? theme.spacing.lg : 0,
        },
        style,
      ]}
      testID={testID}
    >
      {children}
    </View>
  );
}

