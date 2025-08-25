import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import state slices
import { createAuthSlice, AuthSlice } from './slices/authSlice';
import { createSettingsSlice, SettingsSlice } from './slices/settingsSlice';
import { createUISlice, UISlice } from './slices/uiSlice';
import { createAppSlice, AppSlice } from './slices/appSlice';

// Custom storage adapter for AsyncStorage with error handling
const asyncStorage = {
  getItem: async (name: string) => {
    try {
      const value = await AsyncStorage.getItem(name);
      return value;
    } catch (error) {
      console.warn('Failed to get item from storage:', error);
      return null;
    }
  },
  setItem: async (name: string, value: string) => {
    try {
      await AsyncStorage.setItem(name, value);
      return true;
    } catch (error) {
      console.warn('Failed to set item in storage:', error);
      return false;
    }
  },
  removeItem: async (name: string) => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      console.warn('Failed to remove item from storage:', error);
    }
  },
};

// Combined store type
export interface AppStore extends 
  AuthSlice,
  SettingsSlice,
  UISlice,
  AppSlice {}

// Create the main store with error handling
export const useAppStore = create<AppStore>()(
  persist(
    (...a) => ({
      // Auth slice
      ...createAuthSlice(...a),
      
      // Settings slice
      ...createSettingsSlice(...a),
      
      // UI slice
      ...createUISlice(...a),
      
      // App slice
      ...createAppSlice(...a),
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => asyncStorage),
      partialize: (state) => ({
        // Only persist specific parts of the state
        auth: {
          isAuthenticated: state.isAuthenticated,
          user: state.user,
          session: state.session,
        },
        settings: {
          theme: state.theme,
          organization: state.organization,
          businessProfile: state.businessProfile,
          defaults: state.defaults,
          notifications: state.notifications,
        },
        app: {
          lastSync: state.lastSync,
          offlineQueue: state.offlineQueue,
          featureFlags: state.featureFlags,
        },
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('Store rehydrated successfully');
        }
      },
    }
  )
);

// Export individual hooks for better performance
export const useAuthStore = () => useAppStore((state) => ({
  isAuthenticated: state.isAuthenticated,
  user: state.user,
  session: state.session,
  login: state.login,
  logout: state.logout,
  updateUser: state.updateUser,
}));

export const useSettingsStore = () => useAppStore((state) => ({
  theme: state.theme,
  organization: state.organization,
  businessProfile: state.businessProfile,
  defaults: state.defaults,
  notifications: state.notifications,
  updateTheme: state.updateTheme,
  updateOrganization: state.updateOrganization,
  updateBusinessProfile: state.updateBusinessProfile,
  updateDefaults: state.updateDefaults,
  updateNotifications: state.updateNotifications,
}));

export const useUIStore = () => useAppStore((state) => ({
  toasts: state.toasts,
  modals: state.modals,
  loading: state.loading,
  addToast: state.addToast,
  removeToast: state.removeToast,
  showModal: state.showModal,
  hideModal: state.hideModal,
  setLoading: state.setLoading,
}));

export const useAppState = () => useAppStore((state) => ({
  lastSync: state.lastSync,
  offlineQueue: state.offlineQueue,
  featureFlags: state.featureFlags,
  updateLastSync: state.updateLastSync,
  addToOfflineQueue: state.addToOfflineQueue,
  removeFromOfflineQueue: state.removeFromOfflineQueue,
  updateFeatureFlags: state.updateFeatureFlags,
}));


