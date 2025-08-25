import { Dimensions } from 'react-native';
import { theme, breakpoints } from './tokens';

// Get screen dimensions
const { width: screenWidth } = Dimensions.get('window');

// Responsive utilities
export const isTablet = () => screenWidth >= breakpoints.md;
export const isLargeTablet = () => screenWidth >= breakpoints.lg;

// Responsive spacing
export const getResponsiveSpacing = (mobile: number, tablet: number, largeTablet?: number) => {
  if (isLargeTablet() && largeTablet !== undefined) {
    return largeTablet;
  }
  if (isTablet()) {
    return tablet;
  }
  return mobile;
};

// Responsive font size
export const getResponsiveFontSize = (mobile: number, tablet: number, largeTablet?: number) => {
  if (isLargeTablet() && largeTablet !== undefined) {
    return largeTablet;
  }
  if (isTablet()) {
    return tablet;
  }
  return mobile;
};

// Common style combinations
export const commonStyles = {
  // Screen container
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.screen,
  },
  
  // Card styles
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.component.padding,
    ...theme.shadows.sm,
  },
  
  // Row layout
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // Center content
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Space between
  spaceBetween: {
    justifyContent: 'space-between',
  },
  
  // Full width
  fullWidth: {
    width: '100%',
  },
  
  // Full height
  fullHeight: {
    height: '100%',
  },
} as const;

// Text style helpers
export const textStyles = {
  // Heading styles
  h1: {
    fontSize: theme.typography.fontSize.h1,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.fontSize.h1 * theme.typography.lineHeight.tight,
  },
  
  h2: {
    fontSize: theme.typography.fontSize.h2,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.fontSize.h2 * theme.typography.lineHeight.tight,
  },
  
  h3: {
    fontSize: theme.typography.fontSize.h3,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.fontSize.h3 * theme.typography.lineHeight.tight,
  },
  
  // Body text styles
  body: {
    fontSize: theme.typography.fontSize.body,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.fontSize.body * theme.typography.lineHeight.normal,
  },
  
  bodyStrong: {
    fontSize: theme.typography.fontSize.bodyStrong,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.fontSize.bodyStrong * theme.typography.lineHeight.normal,
  },
  
  // Section title
  section: {
    fontSize: theme.typography.fontSize.section,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    lineHeight: theme.typography.fontSize.section * theme.typography.lineHeight.normal,
  },
  
  // Caption text
  caption: {
    fontSize: theme.typography.fontSize.caption,
    fontWeight: theme.typography.fontWeight.regular,
    color: theme.colors.text.secondary,
    lineHeight: theme.typography.fontSize.caption * theme.typography.lineHeight.normal,
  },
  
  // Muted text
  muted: {
    color: theme.colors.text.muted,
  },
  
  // Secondary text
  secondary: {
    color: theme.colors.text.secondary,
  },
} as const;

// Button style helpers
export const buttonStyles = {
  // Base button
  base: {
    minHeight: theme.hitTargets.minimum,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  
  // Primary button
  primary: {
    backgroundColor: theme.colors.primary,
  },
  
  // Secondary button
  secondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  // Outline button
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  
  // Ghost button
  ghost: {
    backgroundColor: 'transparent',
  },
  
  // Disabled state
  disabled: {
    backgroundColor: theme.colors.interactive.disabled,
    opacity: 0.5,
  },
} as const;

// Input style helpers
export const inputStyles = {
  // Base input
  base: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    fontSize: theme.typography.fontSize.body,
    color: theme.colors.text.primary,
    minHeight: theme.hitTargets.minimum,
  },
  
  // Focused state
  focused: {
    borderColor: theme.colors.primary,
  },
  
  // Error state
  error: {
    borderColor: theme.colors.error,
  },
  
  // Disabled state
  disabled: {
    backgroundColor: theme.colors.interactive.disabled,
    opacity: 0.5,
  },
} as const;

// Badge style helpers
export const badgeStyles = {
  // Base badge
  base: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  
  // Status badges
  success: {
    backgroundColor: theme.colors.success,
  },
  
  warning: {
    backgroundColor: theme.colors.warning,
  },
  
  error: {
    backgroundColor: theme.colors.error,
  },
  
  info: {
    backgroundColor: theme.colors.info,
  },
} as const;

// Animation helpers
export const animationHelpers = {
  // Press animation
  press: {
    transform: [{ scale: 0.98 }],
  },
  
  // Fade in
  fadeIn: {
    opacity: 1,
  },
  
  // Fade out
  fadeOut: {
    opacity: 0,
  },
  
  // Slide up
  slideUp: {
    transform: [{ translateY: 0 }],
  },
  
  // Slide down
  slideDown: {
    transform: [{ translateY: 20 }],
  },
} as const;

// Export all utilities
export const themeUtils = {
  isTablet,
  isLargeTablet,
  getResponsiveSpacing,
  getResponsiveFontSize,
  commonStyles,
  textStyles,
  buttonStyles,
  inputStyles,
  badgeStyles,
  animationHelpers,
} as const;
