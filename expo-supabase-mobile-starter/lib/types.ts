import type { Database as DB } from "../types/database";

// Quick helpers
type Tables = DB["public"]["Tables"];
type Enums = DB["public"]["Enums"];

// Core business entities
export type Client = Tables["clients"]["Row"];
export type NewClient = Tables["clients"]["Insert"];
export type UpdateClient = Tables["clients"]["Update"];

export type Quote = Tables["quotes"]["Row"];
export type NewQuote = Tables["quotes"]["Insert"];
export type UpdateQuote = Tables["quotes"]["Update"];

export type Invoice = Tables["invoices"]["Row"];
export type NewInvoice = Tables["invoices"]["Insert"];
export type UpdateInvoice = Tables["invoices"]["Update"];

export type PricebookItem = Tables["pricebook_items"]["Row"];
export type NewPricebookItem = Tables["pricebook_items"]["Insert"];
export type UpdatePricebookItem = Tables["pricebook_items"]["Update"];

// KitAI specific types
export type KitAIMessage = Tables["kitai_messages"]["Row"];
export type NewKitAIMessage = Tables["kitai_messages"]["Insert"];
export type UpdateKitAIMessage = Tables["kitai_messages"]["Update"];

export type KitAIThread = Tables["kitai_threads"]["Row"];
export type NewKitAIThread = Tables["kitai_threads"]["Insert"];
export type UpdateKitAIThread = Tables["kitai_threads"]["Update"];

// Organization and settings
export type Organization = Tables["organizations"]["Row"];
export type NewOrganization = Tables["organizations"]["Insert"];
export type UpdateOrganization = Tables["organizations"]["Update"];

export type Settings = Tables["settings"]["Row"];
export type NewSettings = Tables["settings"]["Insert"];
export type UpdateSettings = Tables["settings"]["Update"];

// Supporting entities
export type QuoteItem = Tables["quote_items"]["Row"];
export type NewQuoteItem = Tables["quote_items"]["Insert"];

export type InvoiceItem = Tables["invoice_items"]["Row"];
export type NewInvoiceItem = Tables["invoice_items"]["Insert"];

export type Payment = Tables["payments"]["Row"];
export type NewPayment = Tables["payments"]["Insert"];

export type Job = Tables["jobs"]["Row"];
export type NewJob = Tables["jobs"]["Insert"];

// Enums
export type Currency = "USD" | "EUR" | "GBP" | "CAD" | "AUD";
export type QuoteStatus = Enums["quote_status"];
export type InvoiceStatus = Enums["invoice_status"];
export type PaymentMethod = Enums["payment_method"];
export type ClientStatus = Enums["client_status"];

// Utility types
export type UUID = string;
export type Timestamp = string;
