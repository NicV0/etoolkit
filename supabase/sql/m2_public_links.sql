create table if not exists public_links (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('quote','invoice')),
  entity_id uuid not null,
  org_id uuid not null references organizations(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz default now()
);
create index if not exists idx_public_links_entity on public_links(kind, entity_id);
