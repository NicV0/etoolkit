create extension if not exists "pgcrypto";

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

create table if not exists memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  user_id uuid not null,
  role text not null check (role in ('OWNER','ADMIN','MEMBER')),
  created_at timestamptz default now(),
  unique (org_id, user_id)
);

create index if not exists idx_memberships_user on memberships (user_id);
create unique index if not exists idx_memberships_org_user on memberships (org_id, user_id);

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  name text not null,
  email text,
  phone text not null,
  address text,
  created_at timestamptz default now()
);

create index if not exists idx_clients_org_created on clients (org_id, created_at desc);

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references organizations(id),
  client_id uuid references clients(id),
  deposit_percent int default 0,
  discount_cents int default 0,
  tax_percent int default 0,
  terms text,
  contract_text text,
  template_key text default 'clean',
  brand_color text default '#1e3a8a',
  status text default 'DRAFT',
  created_at timestamptz default now()
);

create index if not exists idx_quotes_org_created on quotes (org_id, created_at desc);

create table if not exists quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid references quotes(id),
  name text not null,
  qty int not null check (qty > 0),
  rate_cents int not null check (rate_cents >= 0)
);

create index if not exists idx_quote_items_quote on quote_items (quote_id);

create table if not exists org_features (
  org_id uuid primary key references organizations(id),
  brand_color text default '#1e3a8a',
  template_default text default 'clean',
  company_name text,
  logo_url text
);
