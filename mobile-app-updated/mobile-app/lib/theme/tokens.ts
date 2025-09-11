// Re-export canonical tokens to ensure a single source of truth
export {
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
  theme,
} from '../../../../expo-supabase-mobile-starter/lib/theme/tokens';

// Optional compatibility alias for legacy imports in this folder
export const tokens = {
  // Minimal aliases to avoid breaking older code; prefer semantic/theme directly
  colors: {
    background: undefined as unknown as string,
    card: undefined as unknown as string,
    text: undefined as unknown as string,
    primary: undefined as unknown as string,
    success: undefined as unknown as string,
    warning: undefined as unknown as string,
    danger: undefined as unknown as string,
    border: undefined as unknown as string,
    input: undefined as unknown as string,
  },
  spacing: {
    xs: undefined as unknown as number,
    sm: undefined as unknown as number,
    md: undefined as unknown as number,
    lg: undefined as unknown as number,
    xl: undefined as unknown as number,
  },
  radii: {
    sm: undefined as unknown as number,
    md: undefined as unknown as number,
    lg: undefined as unknown as number,
  },
};