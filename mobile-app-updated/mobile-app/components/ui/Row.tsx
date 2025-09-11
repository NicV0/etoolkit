import React from 'react';
import { View, ViewStyle } from 'react-native';

/**
 * A simple flex row that aligns its children horizontally. You can pass
 * additional style props to customise alignment and spacing.
 */
export default function Row({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}