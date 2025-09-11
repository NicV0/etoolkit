import React, { createContext, useContext, useState } from 'react';

/**
 * Types representing the core entities in the app. A client has basic
 * contact information and a status. Invoices and quotes both capture
 * financial documents associated with a client, including line items and
 * a total. If this shape changes in the future you only need to update
 * it here.
 */
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

/**
 * The shape of our global store. Each array holds the current objects in
 * memory and the functions mutate those arrays. In a real world app you
 * would persist these values somewhere (such as AsyncStorage) and likely
 * add more business rules around status transitions.
 */
interface Store {
  clients: Client[];
  invoices: Invoice[];
  quotes: Quote[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  createInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => void;
  createQuote: (quote: Omit<Quote, 'id' | 'createdAt'>) => void;
  markInvoicePaid: (invoiceId: string) => void;
}

const StoreContext = createContext<Store | undefined>(undefined);

/**
 * The provider wraps the app and supplies a store via context. All state
 * lives here so that each page and component can read and modify it.
 */
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);

  function addClient(client: Omit<Client, 'id' | 'createdAt'>) {
    setClients(prev => [
      ...prev,
      { ...client, id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, createdAt: new Date() },
    ]);
  }

  function createInvoice(invoice: Omit<Invoice, 'id' | 'createdAt'>) {
    setInvoices(prev => [
      ...prev,
      { ...invoice, id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, createdAt: new Date() },
    ]);
  }

  function createQuote(quote: Omit<Quote, 'id' | 'createdAt'>) {
    setQuotes(prev => [
      ...prev,
      { ...quote, id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, createdAt: new Date() },
    ]);
  }

  function markInvoicePaid(id: string) {
    setInvoices(prev => prev.map(inv => (inv.id === id ? { ...inv, status: 'paid' } : inv)));
  }

  return (
    <StoreContext.Provider value={{ clients, invoices, quotes, addClient, createInvoice, createQuote, markInvoicePaid }}>
      {children}
    </StoreContext.Provider>
  );
}

/**
 * A convenience hook to read from the store. Throws if called outside of
 * AppProvider so developers know to wrap components correctly.
 */
export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error('useStore must be used within AppProvider');
  }
  return ctx;
}