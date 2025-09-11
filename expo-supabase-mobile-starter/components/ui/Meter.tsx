import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { theme } from '../../lib/theme/tokens';

export type MeterProps = {
  value: number; // 0-100
  label?: string;
  style?: ViewStyle;
  testID?: string;
};

export const Meter: React.FC<MeterProps> = ({ value, label, style, testID }) => {
  const pct = Math.max(0, Math.min(100, value));
  const barColor = pct >= 90 ? theme.semantic.colors.state.warning : theme.semantic.colors.accent.primary;

  return (
    <View style={style} testID={testID}>
      {label && (
        <Text style={{ color: theme.semantic.colors.text.primary, marginBottom: theme.semantic.spacing.xs }}>
          {label}
        </Text>
      )}
      <View style={{ height: theme.semantic.component.meter.height, backgroundColor: theme.semantic.colors.border.subtle, borderRadius: theme.semantic.radii.full }}>
        <View testID={testID ? `${testID}.bar` : undefined} style={{ width: `${pct}%`, height: theme.semantic.component.meter.height, backgroundColor: barColor, borderRadius: theme.semantic.radii.full }} />
      </View>
    </View>
  );
};

export default Meter;
