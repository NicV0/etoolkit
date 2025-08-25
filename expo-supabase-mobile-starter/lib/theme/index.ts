// Comprehensive theme system based on mobile-app patterns
import { colors } from './tokens';

// Theme types
export type ThemeMode = 'light' | 'dark' | 'auto';
export type ColorScheme = 'light' | 'dark';

// Color palette
export interface ColorPalette {
  // Primary colors
  primary: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  // Neutral colors
  neutral: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  // Semantic colors
  success: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  warning: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  error: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  
  info: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
}

// Typography
export interface Typography {
  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
  };
  fontSize: {
    xs: number;
    sm: number;
    base: number;
    lg: number;
    xl: number;
    '2xl': number;
    '3xl': number;
    '4xl': number;
    '5xl': number;
    '6xl': number;
  };
  fontWeight: {
    thin: string;
    light: string;
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
    extrabold: string;
    black: string;
  };
  lineHeight: {
    none: number;
    tight: number;
    snug: number;
    normal: number;
    relaxed: number;
    loose: number;
  };
}

// Spacing
export interface Spacing {
  px: number;
  0: number;
  0.5: number;
  1: number;
  1.5: number;
  2: number;
  2.5: number;
  3: number;
  3.5: number;
  4: number;
  5: number;
  6: number;
  7: number;
  8: number;
  9: number;
  10: number;
  11: number;
  12: number;
  14: number;
  16: number;
  20: number;
  24: number;
  28: number;
  32: number;
  36: number;
  40: number;
  44: number;
  48: number;
  52: number;
  56: number;
  60: number;
  64: number;
  72: number;
  80: number;
  96: number;
}

// Border radius
export interface BorderRadius {
  none: number;
  sm: number;
  base: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
  '3xl': number;
  full: number;
}

// Shadows
export interface Shadows {
  sm: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  base: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  md: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  lg: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  xl: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  '2xl': {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}

// Theme interface
export interface Theme {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  colors: ColorPalette;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: Shadows;
}

// Light theme colors
const lightColors: ColorPalette = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
};

// Dark theme colors
const darkColors: ColorPalette = {
  primary: {
    50: '#1e3a8a',
    100: '#1e40af',
    200: '#1d4ed8',
    300: '#2563eb',
    400: '#3b82f6',
    500: '#60a5fa',
    600: '#93c5fd',
    700: '#bfdbfe',
    800: '#dbeafe',
    900: '#eff6ff',
  },
  neutral: {
    50: '#111827',
    100: '#1f2937',
    200: '#374151',
    300: '#4b5563',
    400: '#6b7280',
    500: '#9ca3af',
    600: '#d1d5db',
    700: '#e5e7eb',
    800: '#f3f4f6',
    900: '#f9fafb',
  },
  success: {
    50: '#14532d',
    100: '#166534',
    200: '#15803d',
    300: '#16a34a',
    400: '#22c55e',
    500: '#4ade80',
    600: '#86efac',
    700: '#bbf7d0',
    800: '#dcfce7',
    900: '#f0fdf4',
  },
  warning: {
    50: '#78350f',
    100: '#92400e',
    200: '#b45309',
    300: '#d97706',
    400: '#f59e0b',
    500: '#fbbf24',
    600: '#fcd34d',
    700: '#fde68a',
    800: '#fef3c7',
    900: '#fffbeb',
  },
  error: {
    50: '#7f1d1d',
    100: '#991b1b',
    200: '#b91c1c',
    300: '#dc2626',
    400: '#ef4444',
    500: '#f87171',
    600: '#fca5a5',
    700: '#fecaca',
    800: '#fee2e2',
    900: '#fef2f2',
  },
  info: {
    50: '#1e3a8a',
    100: '#1e40af',
    200: '#1d4ed8',
    300: '#2563eb',
    400: '#3b82f6',
    500: '#60a5fa',
    600: '#93c5fd',
    700: '#bfdbfe',
    800: '#dbeafe',
    900: '#eff6ff',
  },
};

// Typography configuration
const typography: Typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    serif: 'Georgia, Cambria, "Times New Roman", Times, serif',
    mono: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
  fontWeight: {
    thin: '100',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
};

// Spacing configuration
const spacing: Spacing = {
  px: 1,
  0: 0,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  11: 44,
  12: 48,
  14: 56,
  16: 64,
  20: 80,
  24: 96,
  28: 112,
  32: 128,
  36: 144,
  40: 160,
  44: 176,
  48: 192,
  52: 208,
  56: 224,
  60: 240,
  64: 256,
  72: 288,
  80: 320,
  96: 384,
};

// Border radius configuration
const borderRadius: BorderRadius = {
  none: 0,
  sm: 2,
  base: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
};

// Shadows configuration
const createShadows = (colorScheme: ColorScheme): Shadows => {
  const shadowColor = colorScheme === 'dark' ? '#000000' : '#000000';
  
  return {
    sm: {
      shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    base: {
      shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 15,
      elevation: 8,
    },
    xl: {
      shadowColor,
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.25,
      shadowRadius: 25,
      elevation: 12,
    },
    '2xl': {
      shadowColor,
      shadowOffset: { width: 0, height: 25 },
      shadowOpacity: 0.25,
      shadowRadius: 50,
      elevation: 16,
    },
  };
};

// Create theme function
export const createTheme = (mode: ThemeMode, colorScheme: ColorScheme): Theme => {
  const colors = colorScheme === 'dark' ? darkColors : lightColors;
  
  return {
    mode,
    colorScheme,
    colors,
    typography,
    spacing,
    borderRadius,
    shadows: createShadows(colorScheme),
  };
};

// Default themes
export const lightTheme = createTheme('light', 'light');
export const darkTheme = createTheme('dark', 'dark');

// Theme utilities
export const getThemeColors = (theme: Theme) => theme.colors;
export const getThemeTypography = (theme: Theme) => theme.typography;
export const getThemeSpacing = (theme: Theme) => theme.spacing;
export const getThemeBorderRadius = (theme: Theme) => theme.borderRadius;
export const getThemeShadows = (theme: Theme) => theme.shadows;

// Color utilities
export const getColor = (theme: Theme, colorPath: string): string => {
  const path = colorPath.split('.');
  let current: any = theme.colors;
  
  for (const key of path) {
    if (current[key] === undefined) {
      console.warn(`Color path "${colorPath}" not found in theme`);
      return theme.colors.neutral[500];
    }
    current = current[key];
  }
  
  return current;
};

// Spacing utilities
export const getSpacing = (theme: Theme, size: keyof Spacing): number => {
  return theme.spacing[size];
};

// Typography utilities
export const getFontSize = (theme: Theme, size: keyof Typography['fontSize']): number => {
  return theme.typography.fontSize[size];
};

export const getFontWeight = (theme: Theme, weight: keyof Typography['fontWeight']): string => {
  return theme.typography.fontWeight[weight];
};

export const getLineHeight = (theme: Theme, height: keyof Typography['lineHeight']): number => {
  return theme.typography.lineHeight[height];
};

// Border radius utilities
export const getBorderRadius = (theme: Theme, radius: keyof BorderRadius): number => {
  return theme.borderRadius[radius];
};

// Shadow utilities
export const getShadow = (theme: Theme, shadow: keyof Shadows) => {
  return theme.shadows[shadow];
};
