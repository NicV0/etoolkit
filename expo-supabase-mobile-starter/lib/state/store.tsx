import React, { createContext, useContext, useState, useMemo } from 'react';

export type Client = { 
  id: string; 
  name: string; 
  email: string; 
  status: 'active' | 'pending' | 'inactive';
  phone?: string;
  address?: string;
};

export type Invoice = { 
  id: string; 
  clientId: string; 
  total: number; 
  status: 'unpaid' | 'paid' | 'overdue';
  dueDate?: string;
  description?: string;
  createdAt: string;
};

export type Quote = { 
  id: string; 
  clientId: string; 
  total: number; 
  status: 'open' | 'sent' | 'accepted' | 'rejected';
  description?: string;
  createdAt: string;
};

type StoreContextType = {
  clients: Client[];
  invoices: Invoice[];
  quotes: Quote[];
  addClient: (client: Omit<Client, 'id' | 'status'> & { status?: Client['status'] }) => Client;
  createInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => Invoice;
  createQuote: (quote: Omit<Quote, 'id' | 'createdAt'>) => Quote;
  updateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  updateQuoteStatus: (id: string, status: Quote['status']) => void;
};

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const addClient = (clientData: Omit<Client, 'id' | 'status'> & { status?: Client['status'] }) => {
    const newClient: Client = { 
      id: String(Date.now()), 
      status: clientData.status ?? 'active', 
      name: clientData.name, 
      email: clientData.email,
      phone: clientData.phone,
      address: clientData.address
    };
    setClients(prev => [newClient, ...prev]);
    return newClient;
  };

  const createInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdAt'>) => {
    const newInvoice: Invoice = { 
      ...invoiceData, 
      id: 'INV-' + String(1000 + invoices.length),
      createdAt: new Date().toISOString()
    };
    setInvoices(prev => [newInvoice, ...prev]);
    return newInvoice;
  };

  const createQuote = (quoteData: Omit<Quote, 'id' | 'createdAt'>) => {
    const newQuote: Quote = { 
      ...quoteData, 
      id: 'Q-' + String(6000 + quotes.length),
      createdAt: new Date().toISOString()
    };
    setQuotes(prev => [newQuote, ...prev]);
    return newQuote;
  };

  const updateInvoiceStatus = (id: string, status: Invoice['status']) => {
    setInvoices(prev => 
      prev.map(invoice => 
        invoice.id === id ? { ...invoice, status } : invoice
      )
    );
  };

  const updateQuoteStatus = (id: string, status: Quote['status']) => {
    setQuotes(prev => 
      prev.map(quote => 
        quote.id === id ? { ...quote, status } : quote
      )
    );
  };

  const value = useMemo(() => ({
    clients,
    invoices,
    quotes,
    addClient,
    createInvoice,
    createQuote,
    updateInvoiceStatus,
    updateQuoteStatus
  }), [clients, invoices, quotes]);

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

