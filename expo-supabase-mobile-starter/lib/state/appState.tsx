import React, { createContext, useContext, useState, useCallback } from 'react';

// App state types
export interface AppState {
  // User and organization
  userId?: string;
  orgId?: string;
  isAuthenticated: boolean;
  
  // UI state
  isLoading: boolean;
  isOffline: boolean;
  currentScreen: string;
  
  // Data state
  lastSyncTime?: string;
  pendingChanges: number;
  
  // Settings
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: boolean;
  
  // Business state
  currentClientId?: string;
  currentQuoteId?: string;
  currentInvoiceId?: string;
}

// Actions that can be performed on the state
export interface AppActions {
  // Authentication
  setUser: (userId: string, orgId: string) => void;
  clearUser: () => void;
  
  // UI state
  setLoading: (loading: boolean) => void;
  setOffline: (offline: boolean) => void;
  setCurrentScreen: (screen: string) => void;
  
  // Data state
  setLastSyncTime: (time: string) => void;
  setPendingChanges: (count: number) => void;
  incrementPendingChanges: () => void;
  decrementPendingChanges: () => void;
  
  // Settings
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  setLanguage: (language: string) => void;
  setNotifications: (enabled: boolean) => void;
  
  // Business state
  setCurrentClient: (clientId?: string) => void;
  setCurrentQuote: (quoteId?: string) => void;
  setCurrentInvoice: (invoiceId?: string) => void;
  
  // Utility
  reset: () => void;
}

// Combined state and actions
export interface AppContextType {
  state: AppState;
  actions: AppActions;
}

// Default state
const defaultState: AppState = {
  isAuthenticated: false,
  isLoading: false,
  isOffline: false,
  currentScreen: 'dashboard',
  pendingChanges: 0,
  theme: 'auto',
  language: 'en',
  notifications: true,
};

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(defaultState);

  // Helper function to update state
  const updateState = useCallback((updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Actions
  const actions: AppActions = {
    // Authentication
    setUser: useCallback((userId: string, orgId: string) => {
      updateState({ userId, orgId, isAuthenticated: true });
    }, [updateState]),
    
    clearUser: useCallback(() => {
      updateState({ 
        userId: undefined, 
        orgId: undefined, 
        isAuthenticated: false 
      });
    }, [updateState]),
    
    // UI state
    setLoading: useCallback((loading: boolean) => {
      updateState({ isLoading: loading });
    }, [updateState]),
    
    setOffline: useCallback((offline: boolean) => {
      updateState({ isOffline: offline });
    }, [updateState]),
    
    setCurrentScreen: useCallback((screen: string) => {
      updateState({ currentScreen: screen });
    }, [updateState]),
    
    // Data state
    setLastSyncTime: useCallback((time: string) => {
      updateState({ lastSyncTime: time });
    }, [updateState]),
    
    setPendingChanges: useCallback((count: number) => {
      updateState({ pendingChanges: count });
    }, [updateState]),
    
    incrementPendingChanges: useCallback(() => {
      setState(prev => ({ ...prev, pendingChanges: prev.pendingChanges + 1 }));
    }, []),
    
    decrementPendingChanges: useCallback(() => {
      setState(prev => ({ 
        ...prev, 
        pendingChanges: Math.max(0, prev.pendingChanges - 1) 
      }));
    }, []),
    
    // Settings
    setTheme: useCallback((theme: 'light' | 'dark' | 'auto') => {
      updateState({ theme });
    }, [updateState]),
    
    setLanguage: useCallback((language: string) => {
      updateState({ language });
    }, [updateState]),
    
    setNotifications: useCallback((enabled: boolean) => {
      updateState({ notifications: enabled });
    }, [updateState]),
    
    // Business state
    setCurrentClient: useCallback((clientId?: string) => {
      updateState({ currentClientId: clientId });
    }, [updateState]),
    
    setCurrentQuote: useCallback((quoteId?: string) => {
      updateState({ currentQuoteId: quoteId });
    }, [updateState]),
    
    setCurrentInvoice: useCallback((invoiceId?: string) => {
      updateState({ currentInvoiceId: invoiceId });
    }, [updateState]),
    
    // Utility
    reset: useCallback(() => {
      setState(defaultState);
    }, []),
  };

  const contextValue: AppContextType = {
    state,
    actions,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// Hook to use the app state
export const useAppState = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};

// Convenience hooks for specific state slices
export const useAuth = () => {
  const { state, actions } = useAppState();
  return {
    isAuthenticated: state.isAuthenticated,
    userId: state.userId,
    orgId: state.orgId,
    setUser: actions.setUser,
    clearUser: actions.clearUser,
  };
};

export const useUI = () => {
  const { state, actions } = useAppState();
  return {
    isLoading: state.isLoading,
    isOffline: state.isOffline,
    currentScreen: state.currentScreen,
    setLoading: actions.setLoading,
    setOffline: actions.setOffline,
    setCurrentScreen: actions.setCurrentScreen,
  };
};

export const useData = () => {
  const { state, actions } = useAppState();
  return {
    lastSyncTime: state.lastSyncTime,
    pendingChanges: state.pendingChanges,
    setLastSyncTime: actions.setLastSyncTime,
    setPendingChanges: actions.setPendingChanges,
    incrementPendingChanges: actions.incrementPendingChanges,
    decrementPendingChanges: actions.decrementPendingChanges,
  };
};

export const useSettings = () => {
  const { state, actions } = useAppState();
  return {
    theme: state.theme,
    language: state.language,
    notifications: state.notifications,
    setTheme: actions.setTheme,
    setLanguage: actions.setLanguage,
    setNotifications: actions.setNotifications,
  };
};

export const useBusiness = () => {
  const { state, actions } = useAppState();
  return {
    currentClientId: state.currentClientId,
    currentQuoteId: state.currentQuoteId,
    currentInvoiceId: state.currentInvoiceId,
    setCurrentClient: actions.setCurrentClient,
    setCurrentQuote: actions.setCurrentQuote,
    setCurrentInvoice: actions.setCurrentInvoice,
  };
};
