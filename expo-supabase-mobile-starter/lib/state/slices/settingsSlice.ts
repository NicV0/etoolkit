import { StateCreator } from 'zustand';

// Settings types
export interface Organization {
  id: string;
  name: string;
  logo?: string;
  accentColor: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessProfile {
  address: string;
  phone: string;
  website?: string;
  ein?: string;
  abn?: string;
}

export interface Defaults {
  invoicePrefix: string;
  paymentTerms: 'net15' | 'net30' | 'net45' | 'net60';
  currency: string;
  taxRate: number;
  defaultTemplate: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  invoiceReminders: boolean;
  paymentReminders: boolean;
  syncNotifications: boolean;
}

export interface SettingsSlice {
  // State
  theme: 'dark' | 'light';
  organization: Organization | null;
  businessProfile: BusinessProfile | null;
  defaults: Defaults;
  notifications: NotificationSettings;
  
  // Actions
  updateTheme: (theme: 'dark' | 'light') => void;
  updateOrganization: (organization: Partial<Organization>) => void;
  updateBusinessProfile: (profile: Partial<BusinessProfile>) => void;
  updateDefaults: (defaults: Partial<Defaults>) => void;
  updateNotifications: (notifications: Partial<NotificationSettings>) => void;
  resetSettings: () => void;
}

// Default values
const defaultDefaults: Defaults = {
  invoicePrefix: 'INV-',
  paymentTerms: 'net30',
  currency: 'USD',
  taxRate: 0,
  defaultTemplate: 'modern-pro',
};

const defaultNotifications: NotificationSettings = {
  emailNotifications: true,
  pushNotifications: true,
  invoiceReminders: true,
  paymentReminders: true,
  syncNotifications: true,
};

export const createSettingsSlice: StateCreator<SettingsSlice> = (set, get) => ({
  // Initial state
  theme: 'dark',
  organization: null,
  businessProfile: null,
  defaults: defaultDefaults,
  notifications: defaultNotifications,
  
  // Actions
  updateTheme: (theme: 'dark' | 'light') => {
    set({ theme });
  },
  
  updateOrganization: (organizationUpdate: Partial<Organization>) => {
    const currentOrg = get().organization;
    if (currentOrg) {
      set({
        organization: {
          ...currentOrg,
          ...organizationUpdate,
          updatedAt: new Date().toISOString(),
        },
      });
    } else {
      // Create new organization
      set({
        organization: {
          id: 'org_' + Date.now(),
          name: organizationUpdate.name || 'My Organization',
          accentColor: organizationUpdate.accentColor || '#2563EB',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...organizationUpdate,
        },
      });
    }
  },
  
  updateBusinessProfile: (profileUpdate: Partial<BusinessProfile>) => {
    const currentProfile = get().businessProfile;
    if (currentProfile) {
      set({
        businessProfile: {
          ...currentProfile,
          ...profileUpdate,
        },
      });
    } else {
      // Create new business profile
      set({
        businessProfile: {
          address: '',
          phone: '',
          ...profileUpdate,
        },
      });
    }
  },
  
  updateDefaults: (defaultsUpdate: Partial<Defaults>) => {
    const currentDefaults = get().defaults;
    set({
      defaults: {
        ...currentDefaults,
        ...defaultsUpdate,
      },
    });
  },
  
  updateNotifications: (notificationsUpdate: Partial<NotificationSettings>) => {
    const currentNotifications = get().notifications;
    set({
      notifications: {
        ...currentNotifications,
        ...notificationsUpdate,
      },
    });
  },
  
  resetSettings: () => {
    set({
      theme: 'dark',
      organization: null,
      businessProfile: null,
      defaults: defaultDefaults,
      notifications: defaultNotifications,
    });
  },
});


