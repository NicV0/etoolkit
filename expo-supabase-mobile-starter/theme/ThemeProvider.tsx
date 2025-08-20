import React, { createContext, useContext, ReactNode } from 'react';

interface Theme {
  colors: {
    primary: string;
    background: string;
    text: string;
    border: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}

const defaultTheme: Theme = {
  colors: {
    primary: '#007AFF',
    background: '#FFFFFF',
    text: '#000000',
    border: '#E5E5E5',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};

const ThemeContext = createContext<Theme>(defaultTheme);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={defaultTheme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

