import { db } from '../../lib/localdb';

function tokenize(s: string) { return (s||'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(Boolean); }
function uniq<T>(a: T[]) { return Array.from(new Set(a)); }

export type Doc = { id: string; kind: 'client'|'quote'|'invoice'|'job'; text: string; meta: Record<string, any> };

export function* scanDocs(orgId: string): Generator<Doc> {
  for (const row of db.getAllSync('SELECT * FROM clients_idx WHERE org_id=?', [orgId]) as any[]) {
    yield { id: row.id, kind:'client', text: `${row.name} ${row.email||''} ${row.phone||''} ${row.address||''}`, meta: { name: row.name, email: row.email, phone: row.phone } };
  }
  for (const row of db.getAllSync('SELECT * FROM quotes_idx WHERE org_id=?', [orgId]) as any[]) {
    const items = (() => { try { return JSON.parse(row.items||'[]'); } catch { return []; } })();
    const itemText = items.map((i:any)=> `${i.name} ${i.qty} ${(i.rate||0)}`).join(' ');
    yield { id: row.id, kind:'quote', text: `${row.number||''} ${row.status} ${row.terms||''} ${row.contract||''} ${itemText}`, meta: { number: row.number, status: row.status, total_cents: row.total_cents } };
  }
  for (const row of db.getAllSync('SELECT * FROM invoices_idx WHERE org_id=?', [orgId]) as any[]) {
    yield { id: row.id, kind:'invoice', text: `${row.number||''} ${row.status} ${row.total_cents}`, meta: { number: row.number, status: row.status, total_cents: row.total_cents } };
  }
  for (const row of db.getAllSync('SELECT * FROM jobs_idx WHERE org_id=?', [orgId]) as any[]) {
    yield { id: row.id, kind:'job', text: `${row.title||''} ${row.notes||''} ${row.status||''}`, meta: { title: row.title, status: row.status } };
  }
}

export function search(orgId: string, query: string, limit = 8) {
  const qTokens = uniq(tokenize(query)).filter(t=>t.length>1);
  const docs = Array.from(scanDocs(orgId));
  const N = Math.max(1, docs.length);
  const df = new Map<string, number>();
  for (const d of docs) {
    const seen = new Set<string>();
    for (const t of uniq(tokenize(d.text))) { if (!seen.has(t)) { df.set(t, (df.get(t)||0)+1); seen.add(t);} }
  }
  function score(d: Doc) {
    const tokens = tokenize(d.text);
    const len = tokens.length || 1;
    let s = 0;
    for (const t of qTokens) {
      const tf = tokens.filter(x=>x===t).length;
      const idf = Math.log((N - (df.get(t)||1) + 0.5) / ((df.get(t)||1) + 0.5) + 1);
      const k1 = 1.2, b = 0.75, avgdl = 80;
      s += idf * ((tf*(k1+1)) / (tf + k1*(1 - b + b*(len/avgdl))));
    }
    return s;
  }
  return docs.map(d=>({ d, s: score(d) })).sort((a,b)=> b.s - a.s).slice(0, limit);
}
