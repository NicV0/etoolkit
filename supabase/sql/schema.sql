-- Clients table with phone required
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  name text not null,
  email text,
  phone text not null,
  address text,
  created_at timestamptz default now()
);

-- Quotes table
create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  client_id uuid not null,
  deposit_percent numeric default 0,
  tax_percent numeric default 0,
  terms text,
  contract_text text,
  template_key text,
  brand_color text,
  status text,
  created_at timestamptz default now()
);

-- Quote items
create table if not exists quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null,
  name text not null,
  qty integer not null,
  rate_cents integer not null
);
