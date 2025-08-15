create table if not exists outbound_emails (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  invoice_id uuid,
  to_email text not null,
  subject text not null,
  sent_at timestamptz default now()
);
