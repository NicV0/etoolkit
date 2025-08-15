export type Intent = 'list_overdue_invoices'|'total_billed_today'|'client_contact'|'search'|'unknown';
export type Turn = { role:'user'|'assistant'; text:string; citations?: { kind:string; id:string; label?:string }[] };
