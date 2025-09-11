import React from 'react';
import { Text, View, ViewStyle } from 'react-native';
import { theme } from '../../lib/theme/tokens';

export type BadgeProps = {
  /**
   * The text to display in the badge.
   */
  label?: string;
  /**
   * The visual variant of the badge.
   */
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  /**
   * The size of the badge.
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Status for convenience (maps to label and variant)
   */
  status?: 'active' | 'inactive';
  /**
   * Style overrides for the badge container.
   */
  style?: ViewStyle;
};

export default function Badge({
  label,
  variant = 'default',
  size = 'md',
  status,
  style,
}: BadgeProps) {
  // Handle status prop for convenience
  const finalLabel = status ? status : label;
  const finalVariant = status === 'active' ? 'success' : status === 'inactive' ? 'warning' : variant;
  const getBackgroundColor = () => {
    switch (finalVariant) {
      case 'success':
        return theme.semantic.colors.state.success;
      case 'warning':
        return theme.semantic.colors.state.warning;
      case 'error':
        return theme.semantic.colors.state.danger;
      case 'info':
        return theme.semantic.colors.state.info;
      default:
        return theme.semantic.colors.background.surface;
    }
  };

  const getTextColor = () => {
    switch (finalVariant) {
      case 'success':
      case 'warning':
      case 'error':
        return theme.semantic.colors.text.inverse;
      case 'info':
        return theme.semantic.colors.text.primary;
      default:
        return theme.semantic.colors.text.primary;
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs };
      case 'lg':
        return { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm };
      default:
        return { paddingHorizontal: theme.spacing.sm, paddingVertical: theme.spacing.xs };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return theme.typography.fontSize.caption; // 13
      case 'lg':
        return theme.typography.fontSize.body; // 16
      default:
        return theme.typography.fontSize.caption; // 13
    }
  };

  return (
    <View
      style={[
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: theme.semantic.radii.full,
          ...getPadding(),
          alignSelf: 'flex-start',
        },
        style,
      ]}
    >
              <Text
          style={{
            color: getTextColor(),
            fontSize: getFontSize(),
            fontWeight: theme.semantic.type.weight.semibold,
            textTransform: 'capitalize',
          }}
        >
          {finalLabel}
        </Text>
    </View>
  );
}

// Convenience components for common variants
export const SuccessBadge = (props: Omit<BadgeProps, 'variant'>) => (
  <Badge {...props} variant="success" />
);

export const WarningBadge = (props: Omit<BadgeProps, 'variant'>) => (
  <Badge {...props} variant="warning" />
);

export const ErrorBadge = (props: Omit<BadgeProps, 'variant'>) => (
  <Badge {...props} variant="error" />
);

export const InfoBadge = (props: Omit<BadgeProps, 'variant'>) => (
  <Badge {...props} variant="info" />
);

// Specialized badges for specific use cases
export const ClientStatusBadge: React.FC<{ status: 'active' | 'inactive' }> = ({ status }) => (
  <Badge
    label={status}
    variant={status === 'active' ? 'success' : 'warning'}
  />
);

export const InvoiceStatusBadge: React.FC<{ status: 'paid' | 'unpaid' | 'overdue' }> = ({ status }) => {
  const getVariant = () => {
    switch (status) {
      case 'paid':
        return 'success' as const;
      case 'overdue':
        return 'error' as const;
      default:
        return 'warning' as const;
    }
  };

  return <Badge label={status} variant={getVariant()} />;
};
