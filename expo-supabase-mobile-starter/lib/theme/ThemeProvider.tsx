import React, { createContext, useContext, useMemo, PropsWithChildren } from 'react';
import { theme, type Theme } from './tokens';

// Stub ThemeProvider (MVP)
// - Keeps tokens static for now
// - Provides a stable context for future theme switching (e.g., light/dark)
// - Single source of truth: lib/theme/tokens.ts

export interface ThemeProviderProps {
  // Reserved for future: 'light' | 'dark' | 'system'
  mode?: 'dark';
}

const ThemeContext = createContext<Theme>(theme);

export const ThemeProvider = ({ children }: PropsWithChildren<ThemeProviderProps>) => {
  // Static MVP: always provide the exported theme from tokens.ts
  const value = useMemo(() => theme, []);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

export type { Theme };
