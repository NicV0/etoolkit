import { supabase } from '../../lib/supabase';

export type InvoiceItem = { name: string; qty: number; rate: number };

export function computeTotals(items: InvoiceItem[], taxPercent: number) {
  const subtotal = items.reduce((s, it)=> s + (Number(it.qty)||0)*(Number(it.rate)||0), 0);
  const tax = subtotal * ((Number(taxPercent)||0)/100);
  return { subtotal, tax, total: subtotal + tax };
}

async function allocateNumber(): Promise<string> {
  // Option A (M2 S1 local): format from timestamp/random (stable enough offline)
  const n = Date.now().toString().slice(-6);
  return `INV-${n}`;
}

export async function createInvoice(org_id: string, input: {
  client_id: string;
  items: InvoiceItem[];
  tax_percent?: number;
  terms?: string;
  notes?: string;
  brand_color?: string;
  template_key?: string;
  quote_id?: string;
}) {
  const number = await allocateNumber();
  const { subtotal, tax, total } = computeTotals(input.items, input.tax_percent ?? 0);
  const { data: inv, error } = await supabase
    .from('invoices')
    .insert({
      org_id,
      client_id: input.client_id,
      quote_id: input.quote_id ?? null,
      number,
      status: 'OPEN',
      subtotal_cents: Math.round(subtotal*100),
      tax_cents: Math.round(tax*100),
      total_cents: Math.round(total*100),
      terms: input.terms ?? null,
      notes: input.notes ?? null,
      brand_color: input.brand_color ?? '#1e3a8a',
      template_key: input.template_key ?? 'clean',
    })
    .select('id')
    .single();
  if (error) throw error;

  const items = input.items.map(it => ({
    invoice_id: inv!.id,
    name: it.name || 'Item',
    qty: Number(it.qty)||1,
    rate_cents: Math.round((Number(it.rate)||0)*100),
  }));
  if (items.length) {
    const { error: iErr } = await supabase.from('invoice_items').insert(items);
    if (iErr) throw iErr;
  }
  return { invoice_id: inv!.id };
}

export async function createFromQuote(org_id: string, quote_id: string) {
  const { data: q, error } = await supabase.from('quotes')
    .select('id, org_id, client_id, tax_percent, terms, brand_color, template_key')
    .eq('id', quote_id)
    .single();
  if (error) throw error;
  const { data: qi } = await supabase.from('quote_items').select('name, qty, rate_cents').eq('quote_id', quote_id);
  const items = (qi||[]).map(it=> ({ name: it.name, qty: it.qty, rate: (it.rate_cents||0)/100 }));
  return createInvoice(org_id, {
    client_id: q!.client_id,
    items,
    tax_percent: q!.tax_percent||0,
    terms: q!.terms||undefined,
    brand_color: q!.brand_color||undefined,
    template_key: q!.template_key||undefined,
    quote_id,
  });
}

export async function getInvoiceWithItems(id: string) {
  const { data: inv } = await supabase.from('invoices').select('*').eq('id', id).single();
  const { data: items } = await supabase.from('invoice_items').select('*').eq('invoice_id', id).order('id');
  return { inv, items: items||[] };
}
