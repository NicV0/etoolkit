-- 1) Stripe linkage on clients & invoices
alter table clients add column if not exists stripe_customer_id text;
alter table invoices add column if not exists stripe_invoice_id text;
alter table invoices add column if not exists stripe_payment_link_url text;
alter table invoices add column if not exists currency text not null default 'USD';

-- 2) Payments table (reconciled from webhooks)
create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  invoice_id uuid not null references invoices(id) on delete cascade,
  provider text not null default 'stripe',
  provider_payment_intent_id text,
  amount_cents int not null,
  currency text not null default 'USD',
  status text not null, -- 'succeeded' | 'processing' | 'requires_payment_method' | 'canceled' | etc
  raw jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_payments_invoice on payments(invoice_id);

-- 3) Webhook idempotency store
create table if not exists webhook_events (
  id text primary key,
  received_at timestamptz default now(),
  type text not null,
  raw jsonb
);
