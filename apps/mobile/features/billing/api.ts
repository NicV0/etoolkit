export interface ClientDetails {
  name: string;
  email?: string;
  phone: string;
  address?: string;
}

export interface QuoteItemInput {
  name: string;
  qty: number;
  rate: number;
}

export interface QuoteDraftInput {
  client_id: string;
  items: QuoteItemInput[];
  deposit_percent?: number;
  tax_percent?: number;
  terms?: string;
  contract_text?: string;
  template_key?: string;
  brand_color?: string;
}

export async function ensureClient(org_id: string, name: string, email: string | undefined, phone: string) {
  if (!phone) {
    throw new Error('phone is required');
  }
  // In a real implementation, this would query Supabase and insert as needed.
  return { client_id: `client_${Math.random().toString(36).slice(2)}` };
}

export async function saveQuoteDraft(org_id: string, input: QuoteDraftInput) {
  if (!input.items || input.items.length === 0) {
    throw new Error('at least one line item required');
  }
  const hasValid = input.items.some((i) => i.qty > 0 && i.rate >= 0);
  if (!hasValid) {
    throw new Error('invalid line items');
  }
  // In a real implementation, this would persist to Supabase.
  return { quote_id: `quote_${Math.random().toString(36).slice(2)}` };
}
