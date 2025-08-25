import { StateCreator } from 'zustand';

// App types
export interface OfflineQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'client' | 'invoice' | 'settings';
  entityId?: string;
  data: Record<string, unknown>;
  timestamp: number;
  retries: number;
  maxRetries: number;
  dependencies?: string[];
}

export interface FeatureFlags {
  [key: string]: boolean;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: string | null;
  syncInProgress: boolean;
  syncError: string | null;
  pendingChanges: number;
}

export interface AppSlice {
  // State
  lastSync: string | null;
  offlineQueue: OfflineQueueItem[];
  featureFlags: FeatureFlags;
  syncStatus: SyncStatus;
  
  // Actions
  updateLastSync: (timestamp: string) => void;
  addToOfflineQueue: (item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retries'>) => string;
  removeFromOfflineQueue: (id: string) => void;
  updateOfflineQueueItem: (id: string, updates: Partial<OfflineQueueItem>) => void;
  clearOfflineQueue: () => void;
  updateFeatureFlags: (flags: Partial<FeatureFlags>) => void;
  setSyncStatus: (status: Partial<SyncStatus>) => void;
  incrementRetry: (id: string) => void;
  markQueueItemFailed: (id: string, error: string) => void;
}

// Default feature flags
const defaultFeatureFlags: FeatureFlags = {
  kitai: true,
  offlineMode: true,
  biometricAuth: false,
  advancedSearch: false,
  bulkOperations: false,
  analytics: false,
};

export const createAppSlice: StateCreator<AppSlice> = (set, get) => ({
  // Initial state
  lastSync: null,
  offlineQueue: [],
  featureFlags: defaultFeatureFlags,
  syncStatus: {
    isOnline: true,
    lastSync: null,
    syncInProgress: false,
    syncError: null,
    pendingChanges: 0,
  },
  
  // Actions
  updateLastSync: (timestamp: string) => {
    set({
      lastSync: timestamp,
      syncStatus: {
        ...get().syncStatus,
        lastSync: timestamp,
      },
    });
  },
  
  addToOfflineQueue: (itemData) => {
    const id = 'queue_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const item: OfflineQueueItem = {
      ...itemData,
      id,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: itemData.maxRetries || 3,
    };
    
    set((state) => ({
      offlineQueue: [...state.offlineQueue, item],
      syncStatus: {
        ...state.syncStatus,
        pendingChanges: state.offlineQueue.length + 1,
      },
    }));
    
    return id;
  },
  
  removeFromOfflineQueue: (id: string) => {
    set((state) => ({
      offlineQueue: state.offlineQueue.filter((item) => item.id !== id),
      syncStatus: {
        ...state.syncStatus,
        pendingChanges: Math.max(0, state.offlineQueue.length - 1),
      },
    }));
  },
  
  updateOfflineQueueItem: (id: string, updates: Partial<OfflineQueueItem>) => {
    set((state) => ({
      offlineQueue: state.offlineQueue.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  },
  
  clearOfflineQueue: () => {
    set({
      offlineQueue: [],
      syncStatus: {
        ...get().syncStatus,
        pendingChanges: 0,
      },
    });
  },
  
  updateFeatureFlags: (flags: Partial<FeatureFlags>) => {
    set((state) => ({
      ...state,
      featureFlags: {
        ...state.featureFlags,
        ...flags,
      },
    } as AppSlice));
  },
  
  setSyncStatus: (status: Partial<SyncStatus>) => {
    set((state) => ({
      syncStatus: {
        ...state.syncStatus,
        ...status,
      },
    }));
  },
  
  incrementRetry: (id: string) => {
    set((state) => ({
      offlineQueue: state.offlineQueue.map((item) =>
        item.id === id ? { ...item, retries: item.retries + 1 } : item
      ),
    }));
  },
  
  markQueueItemFailed: (id: string, error: string) => {
    set((state) => ({
      offlineQueue: state.offlineQueue.map((item) =>
        item.id === id ? { ...item, error } : item
      ),
      syncStatus: {
        ...state.syncStatus,
        syncError: error,
      },
    }));
  },
});
