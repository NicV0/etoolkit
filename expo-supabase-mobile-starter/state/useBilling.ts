import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serverComm, type Quote, type Invoice, type LineItem, type CreateQuoteData, type CreateInvoiceData } from '../lib/ServerComm';

// Re-export types for backward compatibility
export type { Quote, Invoice, LineItem, CreateQuoteData, CreateInvoiceData };

// Real API functions using ServerComm
const getOrgQuotes = async (orgId: string, status?: string): Promise<Quote[]> => {
  const filters = status ? { status: status as any } : undefined;
  return serverComm.getOrgQuotes(orgId, filters);
};

const getOrgInvoices = async (orgId: string, status?: string): Promise<Invoice[]> => {
  const filters = status ? { status: status as any } : undefined;
  return serverComm.getOrgInvoices(orgId, filters);
};

const createQuote = async (orgId: string, data: CreateQuoteData): Promise<Quote> => {
  return serverComm.createQuote(orgId, data);
};

const createInvoice = async (orgId: string, data: CreateInvoiceData): Promise<Invoice> => {
  return serverComm.createInvoice(orgId, data);
};

export const useBilling = (orgId: string) => {
  const queryClient = useQueryClient();

  const {
    data: quotes = [],
    isLoading: quotesLoading,
    error: quotesError,
  } = useQuery({
    queryKey: ['quotes', orgId],
    queryFn: () => getOrgQuotes(orgId),
    enabled: !!orgId,
  });

  const {
    data: invoices = [],
    isLoading: invoicesLoading,
    error: invoicesError,
  } = useQuery({
    queryKey: ['invoices', orgId],
    queryFn: () => getOrgInvoices(orgId),
    enabled: !!orgId,
  });

  const createQuoteMutation = useMutation({
    mutationFn: (data: CreateQuoteData) => createQuote(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes', orgId] });
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: (data: CreateInvoiceData) => createInvoice(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices', orgId] });
    },
  });

  return {
    quotes,
    invoices,
    quotesLoading,
    invoicesLoading,
    quotesError,
    invoicesError,
    createQuote: createQuoteMutation.mutateAsync,
    createInvoice: createInvoiceMutation.mutateAsync,
    isCreatingQuote: createQuoteMutation.isPending,
    isCreatingInvoice: createInvoiceMutation.isPending,
  };
};
