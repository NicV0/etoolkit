import { supabase } from './supabase';
import { db, putMeta, getMeta } from './localdb';

export async function syncOrgData(orgId: string) {
  const since = getMeta(`since:${orgId}`);
  const filters = since ? `,gte.updated_at.${since}` : '';

  const clients = await supabase.from('clients').select('*').eq('org_id', orgId);
  if (!clients.error) {
    db.runSync('BEGIN');
    for (const c of clients.data||[]) {
      db.runSync(
        'INSERT INTO clients_idx(id,org_id,name,email,phone,address,updated_at) VALUES(?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,email=excluded.email,phone=excluded.phone,address=excluded.address,updated_at=excluded.updated_at',
        [c.id, c.org_id, c.name||'', c.email||'', c.phone||'', c.address||'', Date.parse(c.updated_at||new Date().toISOString())]
      );
    }
    db.runSync('COMMIT');
  }

  const quotes = await supabase.from('quotes_view').select('*').eq('org_id', orgId);
  if (!quotes.error) {
    db.runSync('BEGIN');
    for (const q of quotes.data||[]) {
      db.runSync(
        'INSERT INTO quotes_idx(id,org_id,client_id,number,status,terms,contract,items,total_cents,tax_percent,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET number=excluded.number,status=excluded.status,terms=excluded.terms,contract=excluded.contract,items=excluded.items,total_cents=excluded.total_cents,tax_percent=excluded.tax_percent,updated_at=excluded.updated_at',
        [q.id, q.org_id, q.client_id, q.number||'', q.status, q.terms||'', q.contract_text||'', JSON.stringify(q.items||[]), q.total_cents||0, q.tax_percent||0, Date.parse(q.updated_at||new Date().toISOString())]
      );
    }
    db.runSync('COMMIT');
  }

  const invoices = await supabase.from('invoices_view').select('*').eq('org_id', orgId);
  if (!invoices.error) {
    db.runSync('BEGIN');
    for (const inv of invoices.data||[]) {
      db.runSync(
        'INSERT INTO invoices_idx(id,org_id,client_id,number,status,total_cents,due_date,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET number=excluded.number,status=excluded.status,total_cents=excluded.total_cents,due_date=excluded.due_date,updated_at=excluded.updated_at',
        [inv.id, inv.org_id, inv.client_id, inv.number||'', inv.status, inv.total_cents||0, inv.due_date?Date.parse(inv.due_date):null, Date.parse(inv.updated_at||new Date().toISOString())]
      );
    }
    db.runSync('COMMIT');
  }

  putMeta(`since:${orgId}`, new Date().toISOString());
}
