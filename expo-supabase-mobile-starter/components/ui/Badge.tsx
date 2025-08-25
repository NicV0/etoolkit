import React from 'react';
import {
  View,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../../lib/theme/tokens';
import { badgeStyles } from '../../lib/theme/utils';

// Badge variants
export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

// Badge sizes
export type BadgeSize = 'sm' | 'md' | 'lg';

// Badge props interface
export interface BadgeProps {
  // Content
  children: React.ReactNode;
  
  // Variants
  variant?: BadgeVariant;
  size?: BadgeSize;
  
  // Styling
  style?: ViewStyle;
  textStyle?: TextStyle;
  
  // Other
  fullWidth?: boolean;
}

// Badge component
export const Badge: React.FC<BadgeProps> = React.memo(({
  children,
  variant = 'default',
  size = 'md',
  style,
  textStyle,
  fullWidth = false,
}) => {
  // Get badge styles based on variant and size
  const getBadgeStyle = (): ViewStyle => {
    const baseStyle = badgeStyles.base;
    const variantStyle = getVariantStyle(variant);
    const sizeStyle = getSizeStyle(size);
    const widthStyle = fullWidth ? { width: '100%' as const } : {};

    return {
      ...baseStyle,
      ...variantStyle,
      ...sizeStyle,
      ...widthStyle,
    };
  };

  // Get text styles based on variant and size
  const getTextStyle = (): TextStyle => {
    const baseTextStyle = getBaseTextStyle(variant);
    const sizeTextStyle = getSizeTextStyle(size);

    return {
      ...baseTextStyle,
      ...sizeTextStyle,
    };
  };

  // Get variant-specific styles
  const getVariantStyle = (badgeVariant: BadgeVariant): ViewStyle => {
    switch (badgeVariant) {
      case 'success':
        return badgeStyles.success;
      case 'warning':
        return badgeStyles.warning;
      case 'error':
        return badgeStyles.error;
      case 'info':
        return badgeStyles.info;
      default:
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
    }
  };

  // Get size-specific styles
  const getSizeStyle = (badgeSize: BadgeSize): ViewStyle => {
    switch (badgeSize) {
      case 'sm':
        return {
          paddingHorizontal: theme.spacing.xs,
          paddingVertical: 2,
        };
      case 'lg':
        return {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
        };
      default: // md
        return {
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
        };
    }
  };

  // Get base text style based on variant
  const getBaseTextStyle = (badgeVariant: BadgeVariant): TextStyle => {
    switch (badgeVariant) {
      case 'success':
        return {
          color: theme.colors.text.inverse,
          fontWeight: theme.typography.fontWeight.semibold,
        };
      case 'warning':
        return {
          color: theme.colors.text.inverse,
          fontWeight: theme.typography.fontWeight.semibold,
        };
      case 'error':
        return {
          color: theme.colors.text.inverse,
          fontWeight: theme.typography.fontWeight.semibold,
        };
      case 'info':
        return {
          color: theme.colors.text.inverse,
          fontWeight: theme.typography.fontWeight.semibold,
        };
      default:
        return {
          color: theme.colors.text.primary,
          fontWeight: theme.typography.fontWeight.semibold,
        };
    }
  };

  // Get size-specific text styles
  const getSizeTextStyle = (badgeSize: BadgeSize): TextStyle => {
    switch (badgeSize) {
      case 'sm':
        return {
          fontSize: theme.typography.fontSize.caption,
        };
      case 'lg':
        return {
          fontSize: theme.typography.fontSize.body,
        };
      default: // md
        return {
          fontSize: theme.typography.fontSize.caption,
        };
    }
  };

  return (
    <View style={[getBadgeStyle(), style]}>
      {typeof children === 'string' ? (
        <Text style={[getTextStyle(), textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
});

// Status badge components for convenience
export const SuccessBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge {...props} variant="success" />
);

export const WarningBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge {...props} variant="warning" />
);

export const ErrorBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge {...props} variant="error" />
);

export const InfoBadge: React.FC<Omit<BadgeProps, 'variant'>> = (props) => (
  <Badge {...props} variant="info" />
);

// Client status badge component
export const ClientStatusBadge: React.FC<{
  status: 'active' | 'inactive';
  size?: BadgeSize;
}> = ({ status, size = 'md' }) => {
  const variant = status === 'active' ? 'success' : 'warning';
  const label = status === 'active' ? 'Active' : 'Inactive';
  
  return (
    <Badge variant={variant} size={size}>
      {label}
    </Badge>
  );
};

// Invoice status badge component
export const InvoiceStatusBadge: React.FC<{
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  size?: BadgeSize;
}> = ({ status, size = 'md' }) => {
  const getVariant = (): BadgeVariant => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'sent':
        return 'info';
      case 'paid':
        return 'success';
      case 'overdue':
        return 'error';
      case 'cancelled':
        return 'default';
      default:
        return 'default';
    }
  };

  const getLabel = (): string => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'sent':
        return 'Sent';
      case 'paid':
        return 'Paid';
      case 'overdue':
        return 'Overdue';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <Badge variant={getVariant()} size={size}>
      {getLabel()}
    </Badge>
  );
};
