import React from 'react';
import { Text, View } from 'react-native';
import { semantic, theme } from '../../lib/theme/tokens';

/**
 * Small status pill. Provide either a specific label or let the
 * component use the status string as the label. Colours derive from
 * status to keep semantics clear.
 */
export default function Badge({
  label,
  status,
}: {
  label?: string;
  status: 'active' | 'inactive' | 'overdue' | 'paid' | 'open' | 'approved' | 'rejected';
}) {
  let bgColor: string;
  switch (status) {
    case 'active':
      bgColor = semantic.colors.state.success;
      break;
    case 'inactive':
      bgColor = semantic.colors.state.warning;
      break;
    case 'overdue':
      bgColor = semantic.colors.state.danger;
      break;
    case 'paid':
      bgColor = semantic.colors.accent.primary;
      break;
    case 'open':
      bgColor = semantic.colors.state.warning;
      break;
    case 'approved':
      bgColor = semantic.colors.state.success;
      break;
    case 'rejected':
      bgColor = semantic.colors.state.danger;
      break;
    default:
      bgColor = semantic.colors.background.surface;
      break;
  }
  return (
    <View
      style={{
        backgroundColor: bgColor,
        paddingHorizontal: semantic.spacing.sm,
        paddingVertical: semantic.spacing.xs,
        borderRadius: semantic.radii.sm,
      }}
    >
      <Text
        style={{
          color: semantic.colors.text.inverse,
          fontSize: theme.typography.fontSize.caption,
          fontWeight: '600',
          textTransform: 'capitalize',
        }}
      >
        {label ?? status}
      </Text>
    </View>
  );
}