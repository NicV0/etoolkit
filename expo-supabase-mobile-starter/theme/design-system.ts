// Design System - Apple-inspired clean design
export const designSystem = {
  // Color Palette - Minimal and clean
  colors: {
    // Primary Brand Colors (Blue accent)
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Main blue
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    
    // Neutral Colors (Clean grays)
    gray: {
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
    
    // Semantic Colors (Subtle)
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#10b981',
      600: '#059669',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
    },
    
    // Background Colors (Frosted glass)
    background: {
      primary: '#ffffff',
      secondary: '#f9fafb',
      tertiary: '#f3f4f6',
      glass: 'rgba(255, 255, 255, 0.8)',
      glassSecondary: 'rgba(255, 255, 255, 0.6)',
      dark: '#111827',
      darkSecondary: '#1f2937',
    },
    
    // Text Colors (Clean hierarchy)
    text: {
      primary: '#111827',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
      inverse: '#ffffff',
      muted: '#9ca3af',
    },
  },
  
  // Typography - SF Pro inspired
  typography: {
    fontFamily: {
      sans: 'System',
      mono: 'Courier',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 36,
    },
    fontWeight: {
      normal: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
  },
  
  // Spacing - Consistent rhythm
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  
  // Border Radius - Apple-style rounded corners
  borderRadius: {
    none: 0,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },
  
  // Shadows - Subtle depth (Apple-style)
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 8,
    },
    // Apple-style frosted glass shadow
    glass: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 8,
    },
  },
  
  // Component Styles - Apple-inspired
  components: {
    // Card Styles (Frosted glass)
    card: {
      base: {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.6)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 8,
      },
      elevated: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.3,
        shadowRadius: 32,
        elevation: 12,
      },
    },
    
    // Button Styles (Apple-style)
    button: {
      primary: {
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
        shadowColor: '#3b82f6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
      },
      secondary: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
      },
      ghost: {
        backgroundColor: 'transparent',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 24,
      },
    },
    
    // Input Styles (Clean and minimal)
    input: {
      base: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
      },
    },
  },
};

// Helper functions for consistent styling
export const getTextStyle = (size: keyof typeof designSystem.typography.fontSize, weight: keyof typeof designSystem.typography.fontWeight = 'normal') => ({
  fontSize: designSystem.typography.fontSize[size],
  fontWeight: designSystem.typography.fontWeight[weight],
  lineHeight: designSystem.typography.lineHeight.normal,
});

export const getSpacing = (size: keyof typeof designSystem.spacing) => designSystem.spacing[size];

export const getColor = (category: keyof typeof designSystem.colors, shade?: string) => {
  const colorGroup = designSystem.colors[category];
  if (typeof colorGroup === 'string') return colorGroup;
  if (shade && shade in colorGroup) return colorGroup[shade as keyof typeof colorGroup];
  return colorGroup;
};

// Apple-style gradient background
export const getBackgroundGradient = () => ({
  backgroundColor: '#f5f7fb',
  // For React Native, we'll use a solid color that matches the gradient feel
});
