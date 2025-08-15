import { search } from './retrieval';
import type { Intent, Turn } from './types';

function detectIntent(q: string): Intent {
  const s = q.toLowerCase();
  if (s.includes('overdue') && s.includes('invoice')) return 'list_overdue_invoices';
  if (s.includes('total') && (s.includes('today') || s.includes('this day'))) return 'total_billed_today';
  if (s.includes('client') && (s.includes('email') || s.includes('phone') || s.includes('contact'))) return 'client_contact';
  if (s.trim().split(/\s+/).length <= 2) return 'search';
  return 'unknown';
}

export function answer(orgId: string, query: string): Turn {
  const intent = detectIntent(query);
  const results = search(orgId, query, 8);
  const cite = (kind:string,id:string,label?:string)=> ({ kind, id, label });

  if (intent === 'list_overdue_invoices') {
    const invoices = results.filter(r=> r.d.kind==='invoice' && /open|unpaid|overdue/.test(r.d.text));
    if (!invoices.length) return { role:'assistant', text:'No overdue invoices detected for your org.', citations: [] };
    const lines = invoices.slice(0,5).map((r)=> `• ${r.d.meta.number||r.d.id} — ${(r.d.meta.total_cents||0)/100}`);
    return { role:'assistant', text: `Possibly overdue invoices (top ${lines.length}):\n${lines.join('\n')}`, citations: invoices.slice(0,5).map(r=> cite('invoice', r.d.id, r.d.meta.number)) };
  }

  if (intent === 'total_billed_today') {
    const today = new Date(); const y = today.getFullYear(), m = today.getMonth(), d = today.getDate();
    const start = new Date(y,m,d).getTime(); const end = start + 86400000;
    const invs = results.filter(r=> r.d.kind==='invoice');
    const total = invs.reduce((s,r)=> s + (r.d.meta.total_cents||0), 0) / 100;
    return { role:'assistant', text: `Estimated total billed today: $${total.toFixed(2)} (from top matches).`, citations: invs.slice(0,5).map(r=> cite('invoice', r.d.id, r.d.meta.number)) };
  }

  if (intent === 'client_contact') {
    const c = results.find(r=> r.d.kind==='client');
    if (!c) return { role:'assistant', text:'Client not found in your data.', citations: [] };
    const name = c.d.meta.name||'Client';
    const email = c.d.meta.email||'—';
    const phone = c.d.meta.phone||'—';
    return { role:'assistant', text: `${name}: email ${email}, phone ${phone}.`, citations: [cite('client', c.d.id, name)] };
  }

  if (intent === 'search') {
    if (!results.length) return { role:'assistant', text:'No matches in your org data.', citations: [] };
    const lines = results.map(r=> `${r.d.kind.toUpperCase()} ${r.d.meta.number||r.d.meta.title||r.d.meta.name||r.d.id}`);
    return { role:'assistant', text: `Top matches:\n${lines.join('\n')}`, citations: results.map(r=> cite(r.d.kind, r.d.id, r.d.meta.number||r.d.meta.title||r.d.meta.name)) };
  }

  const lines = results.map(r=> `${r.d.kind.toUpperCase()} ${r.d.meta.number||r.d.meta.title||r.d.meta.name||r.d.id}`);
  return { role:'assistant', text: lines.length ? `I found related items:\n${lines.join('\n')}` : 'I could not find anything for that yet.', citations: results.map(r=> cite(r.d.kind, r.d.id)) };
}
