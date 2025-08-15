-- Invoices: add Stripe refs and states
alter table if exists invoices
  add column if not exists stripe_invoice_id text,
  add column if not exists stripe_payment_intent_id text,
  add column if not exists currency text default 'usd',
  add column if not exists client_email text;

-- Payments table
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  invoice_id uuid not null references invoices(id) on delete cascade,
  provider text not null default 'stripe',
  provider_payment_id text not null,
  amount_cents int not null,
  currency text not null default 'usd',
  status text not null, -- succeeded|processing|requires_action|failed|refunded|canceled
  raw jsonb,
  created_at timestamptz default now()
);

-- Idempotent webhook receipts
create table if not exists webhook_events (
  id text primary key, -- Stripe event id
  received_at timestamptz default now()
);

create index if not exists idx_payments_invoice on payments(invoice_id);
create index if not exists idx_payments_org on payments(org_id, created_at desc);
