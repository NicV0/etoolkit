create sequence if not exists invoice_number_seq start 10001;

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  client_id uuid not null references clients(id) on delete restrict,
  quote_id uuid references quotes(id) on delete set null,
  number text not null,
  status text not null default 'OPEN' check (status in ('OPEN','SENT','PAID','VOID')),
  subtotal_cents int not null default 0,
  tax_cents int not null default 0,
  total_cents int not null default 0,
  terms text,
  notes text,
  brand_color text default '#1e3a8a',
  template_key text default 'clean',
  created_at timestamptz default now()
);

create table if not exists invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  name text not null,
  qty int not null check (qty>0),
  rate_cents int not null check (rate_cents>=0)
);

create index if not exists idx_invoices_org_created on invoices(org_id, created_at desc);
create index if not exists idx_invoice_items_invoice on invoice_items(invoice_id);

-- helper to allocate invoice numbers
create or replace function allocate_invoice_number() returns text as $$
  declare n bigint;
  begin
    select nextval('invoice_number_seq') into n;
    return 'INV-' || n::text;
  end;
$$ language plpgsql stable;
