// Design System Tokens
// Based on UI/UX Specification

// Color Palette (Navy theme per FRONTEND_PLAN)
export const colors = {
  // Accent
  primary: '#3AA1FF',       // Accent-1
  accent2: '#6CA8FF',       // Accent-2

  // Background stack
  background: '#0F2234',    // Base
  card: '#122A40',          // Surface
  surface: '#17344D',       // Raised
  border: '#23425F',        // Divider

  // Status
  success: '#3CCB8E',
  warning: '#FFB020',
  error: '#FF5A5A',
  info: '#6CA8FF',

  // Text
  text: {
    primary: '#EAF2FB',
    secondary: '#B6C7DA',
    muted: '#7F95AC',
    inverse: '#0F2234',
  },

  // Interactive States (derived from accent)
  interactive: {
    hover: '#6CA8FF',      // lighter accent
    pressed: '#2C8DE6',    // darker accent
    disabled: 'rgba(255,255,255,0.38)',
  },

  // Overlay
  overlay: {
    backdrop: 'rgba(0,0,0,0.6)',
    card: 'rgba(255,255,255,0.06)',
  },

  // Input baseline
  input: '#17344D',
} as const;

// Typography Scale
export const typography = {
  fontFamily: {
    primary: 'Inter',
  },
  
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  fontSize: {
    // Meta
    caption: 13,
    // Body
    body: 16,
    bodyStrong: 18,
    // Section/Card Titles
    section: 20,
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
  
  // Specific spacing values (semantic scale)
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
  
  // Screen padding
  screen: 16,
  
  // Component spacing
  component: {
    padding: 16,
    margin: 16,
    gap: 12,
  },
} as const;

// Border Radius
export const borderRadius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
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
// Semantic aliases to be used by UI components
export const semantic = {
  colors: {
    background: {
      base: colors.background,
      surface: colors.card,
      elevated: colors.surface,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      muted: colors.text.muted,
      inverse: colors.text.inverse,
      onAccent: colors.text.inverse,
    },
    accent: {
      primary: colors.primary,
      primaryHover: colors.interactive.hover,
      primaryPressed: colors.interactive.pressed,
    },
    state: {
      success: colors.success,
      warning: colors.warning,
      danger: colors.error,
      info: colors.info,
      onDanger: colors.text.primary,
    },
    border: {
      subtle: colors.border,
    },
    interactive: {
      fill: colors.primary,
      fillHover: colors.interactive.hover,
      fillPressed: colors.interactive.pressed,
      outline: colors.border,
      outlineHover: colors.primary,
      outlinePressed: colors.interactive.pressed,
      disabled: colors.interactive.disabled,
    },
    focus: {
      ring: '#6CA8FF',
    },
    overlay: {
      backdrop: colors.overlay.backdrop,
      card: colors.overlay.card,
    },
    input: {
      background: colors.input,
    },
  },
  radii: {
    sm: borderRadius.sm,
    md: borderRadius.md,
    lg: borderRadius.lg,
    xl: borderRadius.xl,
    full: borderRadius.full,
  },
  spacing: {
    xs: spacing.xs,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
    xl: spacing.xl,
    '2xl': spacing['2xl'],
  },
  shadows: {
    card: shadows.md,
    popover: shadows.lg,
    modal: shadows.lg,
  },
  type: {
    body: typography.fontSize.body,
    meta: typography.fontSize.caption,
    section: typography.fontSize.section,
    titleXL: typography.fontSize.h1,
    weight: typography.fontWeight,
    line: typography.lineHeight,
    family: typography.fontFamily,
  },
  component: {
    skeleton: {
      lineHeight: 14,
      avatarSize: 40,
      duration: 1300,
    },
    meter: {
      height: 8,
    },
  },
} as const;

// Pass-through aliases (back-compat): semantic.text.onAccent -> semantic.colors.text.onAccent, semantic.state.onDanger -> semantic.colors.state.onDanger
;(semantic as any).text = { get onAccent() { return (semantic as any).colors.text.onAccent } }
;(semantic as any).state = { get onDanger() { return (semantic as any).colors.state.onDanger } }

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
  semantic,
} as const;

// Type exports
export type Theme = typeof theme;
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type Semantic = typeof semantic;
