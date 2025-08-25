import { QueryClient } from '@tanstack/react-query';
// import { MMKV } from 'react-native-mmkv';
// import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

// Create MMKV storage instance
// const storage = new MMKV();

// Custom storage adapter for MMKV
// const mmkvStorage = {
//   getItem: (key: string) => {
//     const value = storage.getString(key);
//     return value || null;
//   },
//   setItem: (key: string, value: string) => {
//     storage.set(key, value);
//   },
//   removeItem: (key: string) => {
//     storage.delete(key);
//   },
// };

// Create persister for offline support
// const persister = createSyncStoragePersister({
//   storage: mmkvStorage,
//   key: 'query-cache',
// });

// Create query client with configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache time
      gcTime: 1000 * 60 * 5, // 5 minutes
      staleTime: 1000 * 60 * 5, // 5 minutes
      
      // Retry configuration
      retry: (failureCount, error: unknown) => {
        // Don't retry on 4xx errors (client errors)
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as { status: number }).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Network mode
      networkMode: 'online',
      
      // Refetch on window focus
      refetchOnWindowFocus: false,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Refetch on mount
      refetchOnMount: true,
    },
    mutations: {
      // Retry configuration for mutations
      retry: (failureCount, error: unknown) => {
        // Don't retry mutations on 4xx errors
        if (error && typeof error === 'object' && 'status' in error) {
          const status = (error as { status: number }).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      
      // Retry delay for mutations
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Auth
  auth: {
    user: ['auth', 'user'] as const,
    session: ['auth', 'session'] as const,
  },
  
  // Settings
  settings: {
    organization: ['settings', 'organization'] as const,
    businessProfile: ['settings', 'businessProfile'] as const,
    defaults: ['settings', 'defaults'] as const,
    notifications: ['settings', 'notifications'] as const,
    all: ['settings'] as const,
  },
  
  // Clients
  clients: {
    all: ['clients'] as const,
    lists: () => [...queryKeys.clients.all, 'list'] as const,
    list: (filters: unknown) => [...queryKeys.clients.lists(), filters] as const,
    details: () => [...queryKeys.clients.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.clients.details(), id] as const,
  },
  
  // Invoices
  invoices: {
    all: ['invoices'] as const,
    lists: () => [...queryKeys.invoices.all, 'list'] as const,
    list: (filters: unknown) => [...queryKeys.invoices.lists(), filters] as const,
    details: () => [...queryKeys.invoices.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.invoices.details(), id] as const,
  },

  // Quotes
  quotes: {
    all: ['quotes'] as const,
    lists: () => [...queryKeys.quotes.all, 'list'] as const,
    list: (filters: unknown) => [...queryKeys.quotes.lists(), filters] as const,
    details: () => [...queryKeys.quotes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.quotes.details(), id] as const,
  },

  // Pricebook
  pricebook: {
    all: ['pricebook'] as const,
    lists: () => [...queryKeys.pricebook.all, 'list'] as const,
    list: (filters: unknown) => [...queryKeys.pricebook.lists(), filters] as const,
    details: () => [...queryKeys.pricebook.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.pricebook.details(), id] as const,
  },
  
  // Dashboard
  dashboard: {
    summary: ['dashboard', 'summary'] as const,
    recentActivity: ['dashboard', 'recentActivity'] as const,
    stats: ['dashboard', 'stats'] as const,
    all: ['dashboard'] as const,
  },
  
  // KitAI
  kitai: {
    messages: ['kitai', 'messages'] as const,
    threads: ['kitai', 'threads'] as const,
    thread: (threadId: string) => [...queryKeys.kitai.threads, threadId] as const,
    all: ['kitai'] as const,
  },
  
  // Templates
  templates: {
    all: ['templates'] as const,
    list: (type: string) => [...queryKeys.templates.all, type] as const,
    detail: (id: string) => [...queryKeys.templates.all, id] as const,
  },
  
  // Sync
  sync: {
    status: ['sync', 'status'] as const,
    queue: ['sync', 'queue'] as const,
  },
} as const;

// Invalidate related queries helper
export const invalidateQueries = {
  // Invalidate all client-related queries
  clients: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.clients.all });
  },
  
  // Invalidate all invoice-related queries
  invoices: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
  },

  // Invalidate all quote-related queries
  quotes: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.quotes.all });
  },

  // Invalidate all pricebook-related queries
  pricebook: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.pricebook.all });
  },
  
  // Invalidate dashboard queries
  dashboard: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
  },
  
  // Invalidate settings queries
  settings: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
  },
  
  // Invalidate specific client
  client: (id: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.clients.detail(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.clients.lists() });
  },
  
  // Invalidate specific invoice
  invoice: (id: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.invoices.detail(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.invoices.lists() });
  },

  // Invalidate specific quote
  quote: (id: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.quotes.detail(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.quotes.lists() });
  },

  // Invalidate specific pricebook item
  pricebookItem: (id: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.pricebook.detail(id) });
    queryClient.invalidateQueries({ queryKey: queryKeys.pricebook.lists() });
  },
};

// Prefetch queries for better UX
export const prefetchQueries = {
  // Prefetch dashboard data
  dashboard: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.summary,
      queryFn: () => Promise.resolve(null), // Will be implemented with actual API
    });
  },
  
  // Prefetch clients list
  clients: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.clients.lists(),
      queryFn: () => Promise.resolve([]), // Will be implemented with actual API
    });
  },
  
  // Prefetch invoices list
  invoices: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.invoices.lists(),
      queryFn: () => Promise.resolve([]), // Will be implemented with actual API
    });
  },
};

// Export persister for use in app
// export { persister };
