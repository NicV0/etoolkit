// Design System Tokens
// Based on UI/UX Specification

// Color Palette
export const colors = {
  // Primary Accent
  primary: '#2563EB',
  
  // Dark Theme Colors
  background: '#0F172A',
  card: '#111827',
  surface: '#0B1220',
  border: '#1F2937',
  
  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#9CA3AF',
  
  // Text Colors
  text: {
    primary: '#E5E7EB',
    secondary: '#9CA3AF',
    muted: '#6B7280',
    inverse: '#FFFFFF',
  },
  
  // Interactive States
  interactive: {
    hover: '#1E40AF',
    pressed: '#1D4ED8',
    disabled: '#374151',
  },
  
  // Overlay Colors
  overlay: {
    backdrop: 'rgba(0, 0, 0, 0.5)',
    card: 'rgba(255, 255, 255, 0.05)',
  },
} as const;

// Typography Scale
export const typography = {
  fontFamily: {
    primary: 'Inter',
  },
  
  fontWeight: {
    regular: '400',
    semibold: '600',
    bold: '700',
  },
  
  fontSize: {
    // Caption
    caption: 12,
    // Body
    body: 14,
    bodyStrong: 16,
    // Section/Card Titles
    section: 18,
    // Headings
    h3: 24,
    h2: 28,
    h1: 32,
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.4,
    relaxed: 1.6,
  },
} as const;

// Spacing Scale
export const spacing = {
  // Base spacing unit
  base: 4,
  
  // Specific spacing values
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
  
  // Screen padding
  screen: 16,
  
  // Component spacing
  component: {
    padding: 16,
    margin: 12,
    gap: 12,
  },
} as const;

// Border Radius
export const borderRadius = {
  none: 0,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 24,
  full: 9999,
} as const;

// Shadows
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Animation Durations
export const animation = {
  duration: {
    fast: 90,
    normal: 120,
    slow: 220,
    shimmer: 650,
  },
  
  easing: {
    easeInOut: 'ease-in-out',
    easeOut: 'ease-out',
  },
} as const;

// Icon Sizes
export const iconSizes = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 22,
  xl: 24,
  '2xl': 32,
} as const;

// Responsive Breakpoints
export const breakpoints = {
  sm: 360,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

// Hit Target Sizes
export const hitTargets = {
  minimum: 44,
  comfortable: 48,
} as const;

// Z-Index Scale
export const zIndex = {
  base: 0,
  card: 1,
  dropdown: 10,
  modal: 100,
  toast: 200,
  tooltip: 300,
} as const;

// Export theme object
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  iconSizes,
  breakpoints,
  hitTargets,
  zIndex,
} as const;

// Type exports
export type Theme = typeof theme;
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
