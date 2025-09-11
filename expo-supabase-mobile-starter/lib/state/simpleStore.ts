import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Core entity types
export type Client = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
};

export type InvoiceItem = {
  id: string;
  description: string;
  qty: number;
  price: number;
};

export type Invoice = {
  id: string;
  clientId: string;
  total: number;
  status: 'paid' | 'unpaid' | 'overdue';
  createdAt: Date;
  dueDate: Date;
  items: InvoiceItem[];
};

export type Quote = {
  id: string;
  clientId: string;
  total: number;
  status: 'open' | 'approved' | 'rejected';
  createdAt: Date;
  items: InvoiceItem[];
};

// Settings types
export type Organization = {
  name: string;
  logo?: string;
  accentColor: string;
};

export type BusinessProfile = {
  address?: string;
  phone?: string;
  website?: string;
};

export type Defaults = {
  currency: string;
  taxRate: number;
  paymentTerms: 'net15' | 'net30' | 'net45' | 'net60';
};

export type Notifications = {
  emailNotifications: boolean;
  pushNotifications: boolean;
  invoiceReminders: boolean;
};

// Store interface
interface SimpleStore {
  // State
  clients: Client[];
  invoices: Invoice[];
  quotes: Quote[];
  
  // Settings
  organization: Organization;
  businessProfile: BusinessProfile;
  defaults: Defaults;
  notifications: Notifications;
  
  // Actions
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>) => void;
  deleteClient: (id: string) => void;
  
  createInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => void;
  updateInvoice: (id: string, updates: Partial<Omit<Invoice, 'id' | 'createdAt'>>) => void;
  markInvoicePaid: (id: string) => void;
  deleteInvoice: (id: string) => void;
  
  createQuote: (quote: Omit<Quote, 'id' | 'createdAt'>) => void;
  updateQuote: (id: string, updates: Partial<Omit<Quote, 'id' | 'createdAt'>>) => void;
  deleteQuote: (id: string) => void;
  
  // Settings actions
  updateOrganization: (updates: Partial<Organization>) => void;
  updateBusinessProfile: (updates: Partial<BusinessProfile>) => void;
  updateDefaults: (updates: Partial<Defaults>) => void;
  updateNotifications: (updates: Partial<Notifications>) => void;
}

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

// Create the simple store
export const useSimpleStore = create<SimpleStore>()(
  persist(
    (set, get) => ({
      // Initial state
      clients: [],
      invoices: [],
      quotes: [],
      
      // Settings initial state
      organization: {
        name: 'My Business',
        accentColor: '#4e8bfa',
      },
      businessProfile: {
        address: '',
        phone: '',
        website: '',
      },
      defaults: {
        currency: 'USD',
        taxRate: 10,
        paymentTerms: 'net30',
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        invoiceReminders: true,
      },
      
      // Client actions
      addClient: (client) => {
        const newClient: Client = {
          ...client,
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          createdAt: new Date(),
        };
        set((state) => ({
          clients: [...state.clients, newClient],
        }));
      },
      
      updateClient: (id, updates) => {
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === id ? { ...client, ...updates } : client
          ),
        }));
      },
      
      deleteClient: (id) => {
        set((state) => ({
          clients: state.clients.filter((client) => client.id !== id),
        }));
      },
      
      // Invoice actions
      createInvoice: (invoice) => {
        const newInvoice: Invoice = {
          ...invoice,
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          createdAt: new Date(),
        };
        set((state) => ({
          invoices: [...state.invoices, newInvoice],
        }));
      },
      
      updateInvoice: (id, updates) => {
        set((state) => ({
          invoices: state.invoices.map((invoice) =>
            invoice.id === id ? { ...invoice, ...updates } : invoice
          ),
        }));
      },
      
      markInvoicePaid: (id) => {
        set((state) => ({
          invoices: state.invoices.map((invoice) =>
            invoice.id === id ? { ...invoice, status: 'paid' as const } : invoice
          ),
        }));
      },
      
      deleteInvoice: (id) => {
        set((state) => ({
          invoices: state.invoices.filter((invoice) => invoice.id !== id),
        }));
      },
      
      // Quote actions
      createQuote: (quote) => {
        const newQuote: Quote = {
          ...quote,
          id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
          createdAt: new Date(),
        };
        set((state) => ({
          quotes: [...state.quotes, newQuote],
        }));
      },
      
      updateQuote: (id, updates) => {
        set((state) => ({
          quotes: state.quotes.map((quote) =>
            quote.id === id ? { ...quote, ...updates } : quote
          ),
        }));
      },
      
      deleteQuote: (id) => {
        set((state) => ({
          quotes: state.quotes.filter((quote) => quote.id !== id),
        }));
      },
      
      // Settings actions
      updateOrganization: (updates) => {
        set((state) => ({
          organization: { ...state.organization, ...updates },
        }));
      },
      
      updateBusinessProfile: (updates) => {
        set((state) => ({
          businessProfile: { ...state.businessProfile, ...updates },
        }));
      },
      
      updateDefaults: (updates) => {
        set((state) => ({
          defaults: { ...state.defaults, ...updates },
        }));
      },
      
      updateNotifications: (updates) => {
        set((state) => ({
          notifications: { ...state.notifications, ...updates },
        }));
      },
    }),
    {
      name: 'simple-store',
      storage: createJSONStorage(() => asyncStorage),
      partialize: (state) => ({
        clients: state.clients,
        invoices: state.invoices,
        quotes: state.quotes,
        organization: state.organization,
        businessProfile: state.businessProfile,
        defaults: state.defaults,
        notifications: state.notifications,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('Simple store rehydrated successfully');
        }
      },
    }
  )
);

// Convenience hooks for specific entities
export const useClients = () => useSimpleStore((state) => ({
  clients: state.clients,
  addClient: state.addClient,
  updateClient: state.updateClient,
  deleteClient: state.deleteClient,
}));

export const useInvoices = () => useSimpleStore((state) => ({
  invoices: state.invoices,
  createInvoice: state.createInvoice,
  updateInvoice: state.updateInvoice,
  markInvoicePaid: state.markInvoicePaid,
  deleteInvoice: state.deleteInvoice,
}));

export const useQuotes = () => useSimpleStore((state) => ({
  quotes: state.quotes,
  createQuote: state.createQuote,
  updateQuote: state.updateQuote,
  deleteQuote: state.deleteQuote,
}));

// Settings hook
export const useSettingsStore = () => useSimpleStore((state) => ({
  organization: state.organization,
  businessProfile: state.businessProfile,
  defaults: state.defaults,
  notifications: state.notifications,
  updateOrganization: state.updateOrganization,
  updateBusinessProfile: state.updateBusinessProfile,
  updateDefaults: state.updateDefaults,
  updateNotifications: state.updateNotifications,
}));

