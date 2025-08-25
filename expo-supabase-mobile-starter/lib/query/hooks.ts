import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, invalidateQueries } from './queryClient';
import { clientAPI } from '../api/clients';
import { invoiceAPI } from '../api/invoices';
import { quoteAPI } from '../api/quotes';
import { pricebookAPI } from '../api/pricebook';
import type {
  CreateClientData,
  UpdateClientData,
  CreateInvoiceData,
  UpdateInvoiceData,
  CreateQuoteData,
  UpdateQuoteData,
  CreatePricebookItemData,
  UpdatePricebookItemData,
  ClientFilters,
  InvoiceFilters,
  QuoteFilters,
  PricebookFilters,
  Client,
  InvoiceWithItems,
  QuoteWithItems,
  PricebookItem,
  KitAIThread,
  KitAIMessage
} from '../types/unified';

// Client Hooks
export const useClients = (orgId: string, filters?: ClientFilters) => {
  return useQuery({
    queryKey: queryKeys.clients.list({ orgId, ...filters }),
    queryFn: () => clientAPI.list(orgId, filters),
  });
};

export const useClient = (orgId: string, id: string) => {
  return useQuery({
    queryKey: queryKeys.clients.detail(id),
    queryFn: () => clientAPI.get(id),
    enabled: !!id,
  });
};

export const useCreateClient = () => {
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: string; data: CreateClientData }) =>
      clientAPI.create(orgId, { 
        ...data, 
        status: data.status || 'active',
        country: data.country || 'US'
      }),
    onSuccess: () => {
      invalidateQueries.clients();
    },
  });
};

export const useUpdateClient = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientData }) =>
      clientAPI.update(id, data),
    onSuccess: () => {
      invalidateQueries.clients();
    },
  });
};

export const useDeleteClient = () => {
  return useMutation({
    mutationFn: (id: string) => clientAPI.delete(id),
    onSuccess: () => {
      invalidateQueries.clients();
    },
  });
};

// Invoice Hooks
export const useInvoices = (orgId: string, filters?: InvoiceFilters) => {
  return useQuery({
    queryKey: queryKeys.invoices.list({ orgId, ...filters }),
    queryFn: () => invoiceAPI.list(orgId, filters),
  });
};

export const useInvoice = (orgId: string, id: string) => {
  return useQuery({
    queryKey: queryKeys.invoices.detail(id),
    queryFn: () => invoiceAPI.get(id),
    enabled: !!id,
  });
};

export const useCreateInvoice = () => {
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: string; data: CreateInvoiceData }) =>
      invoiceAPI.create(orgId, {
        ...data,
        currency: data.currency || 'USD',
        tax_rate_pct: data.tax_rate_pct || 0,
        discount_amt: data.discount_amt || 0,
        issue_date: data.issue_date || new Date().toISOString().split('T')[0],
        items: data.items.map(item => ({
          ...item,
          taxable: item.taxable ?? true
        }))
      }),
    onSuccess: () => {
      invalidateQueries.invoices();
    },
  });
};

export const useUpdateInvoice = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvoiceData }) =>
      invoiceAPI.update(id, {
        ...data,
        items: data.items?.map(item => ({
          ...item,
          taxable: item.taxable ?? true
        }))
      }),
    onSuccess: () => {
      invalidateQueries.invoices();
    },
  });
};

export const useDeleteInvoice = () => {
  return useMutation({
    mutationFn: (id: string) => invoiceAPI.delete(id),
    onSuccess: () => {
      invalidateQueries.invoices();
    },
  });
};

// Quote Hooks
export const useQuotes = (orgId: string, filters?: QuoteFilters) => {
  return useQuery({
    queryKey: queryKeys.quotes.list({ orgId, ...filters }),
    queryFn: () => quoteAPI.list(orgId, filters),
  });
};

export const useQuote = (orgId: string, id: string) => {
  return useQuery({
    queryKey: queryKeys.quotes.detail(id),
    queryFn: () => quoteAPI.get(id),
    enabled: !!id,
  });
};

export const useCreateQuote = () => {
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: string; data: CreateQuoteData }) =>
      quoteAPI.create(orgId, {
        ...data,
        currency: data.currency || 'USD',
        tax_rate_pct: data.tax_rate_pct || 0,
        discount_amt: data.discount_amt || 0,
        items: data.items.map(item => ({
          ...item,
          taxable: item.taxable ?? true
        }))
      }),
    onSuccess: () => {
      invalidateQueries.quotes();
    },
  });
};

export const useUpdateQuote = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateQuoteData }) =>
      quoteAPI.update(id, {
        ...data,
        items: data.items?.map(item => ({
          ...item,
          taxable: item.taxable ?? true
        }))
      }),
    onSuccess: () => {
      invalidateQueries.quotes();
    },
  });
};

export const useDeleteQuote = () => {
  return useMutation({
    mutationFn: (id: string) => quoteAPI.delete(id),
    onSuccess: () => {
      invalidateQueries.quotes();
    },
  });
};

// Pricebook Hooks
export const usePricebookItems = (orgId: string, filters?: PricebookFilters) => {
  return useQuery({
    queryKey: queryKeys.pricebook.list({ orgId, ...filters }),
    queryFn: () => pricebookAPI.list(orgId, filters),
  });
};

export const usePricebookItem = (orgId: string, id: string) => {
  return useQuery({
    queryKey: queryKeys.pricebook.detail(id),
    queryFn: () => pricebookAPI.get(id),
    enabled: !!id,
  });
};

export const useCreatePricebookItem = () => {
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: string; data: CreatePricebookItemData }) =>
      pricebookAPI.create(orgId, {
        ...data,
        taxable: data.taxable ?? true,
        active: data.active ?? true,
        is_quick_pick: data.is_quick_pick ?? false
      }),
    onSuccess: () => {
      invalidateQueries.pricebook();
    },
  });
};

export const useUpdatePricebookItem = () => {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePricebookItemData }) =>
      pricebookAPI.update(id, data),
    onSuccess: () => {
      invalidateQueries.pricebook();
    },
  });
};

export const useDeletePricebookItem = () => {
  return useMutation({
    mutationFn: (id: string) => pricebookAPI.delete(id),
    onSuccess: () => {
      invalidateQueries.pricebook();
    },
  });
};

// KitAI Hooks
export const useKitAIThreads = (orgId: string) => {
  return useQuery({
    queryKey: queryKeys.kitai.threads,
    queryFn: () => Promise.resolve([] as KitAIThread[]), // TODO: Implement KitAI API
    enabled: !!orgId,
  });
};

export const useKitAIThread = (orgId: string, threadId: string) => {
  return useQuery({
    queryKey: queryKeys.kitai.thread(threadId),
    queryFn: () => Promise.resolve({} as KitAIThread), // TODO: Implement KitAI API
    enabled: !!threadId,
  });
};

export const useKitAIMessages = (orgId: string, threadId: string) => {
  return useQuery({
    queryKey: queryKeys.kitai.messages,
    queryFn: () => Promise.resolve([] as KitAIMessage[]), // TODO: Implement KitAI API
    enabled: !!threadId,
  });
};

// Dashboard Hooks
export const useDashboardSummary = (orgId: string) => {
  return useQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: () => Promise.resolve({}), // TODO: Implement dashboard API
    enabled: !!orgId,
  });
};

export const useDashboardStats = (orgId: string) => {
  return useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: () => Promise.resolve({}), // TODO: Implement dashboard API
    enabled: !!orgId,
  });
};

export const useRecentActivity = (orgId: string) => {
  return useQuery({
    queryKey: queryKeys.dashboard.recentActivity,
    queryFn: () => Promise.resolve([]), // TODO: Implement dashboard API
    enabled: !!orgId,
  });
};

// Utility Hooks
export const useRefreshData = () => {
  const queryClient = useQueryClient();
  
  return {
    refreshClients: () => queryClient.invalidateQueries({ queryKey: ['clients', 'list'] }),
    refreshInvoices: () => queryClient.invalidateQueries({ queryKey: ['invoices', 'list'] }),
    refreshQuotes: () => queryClient.invalidateQueries({ queryKey: ['quotes', 'list'] }),
    refreshPricebook: () => queryClient.invalidateQueries({ queryKey: ['pricebook', 'list'] }),
    refreshAll: () => queryClient.invalidateQueries(),
  };
};

export const useCreateKitAIMessage = () => {
  return useMutation({
    mutationFn: ({ threadId, content }: { threadId: string; content: string }) =>
      Promise.resolve({ id: 'temp', thread_id: threadId, content, role: 'user' as const, created_at: new Date().toISOString() }), // TODO: Implement KitAI API
    onSuccess: () => {
      // TODO: Invalidate KitAI queries when implemented
    },
  });
};
