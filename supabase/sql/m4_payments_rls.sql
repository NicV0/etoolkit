alter table payments enable row level security;
alter table webhook_events enable row level security;

-- Members can read their org payments
create policy if not exists "payments read" on payments for select using (
  exists (select 1 from memberships m join invoices i on i.org_id = m.org_id where m.user_id = auth.uid() and i.id = payments.invoice_id)
);

-- No direct inserts/updates from clients (server only)
create policy if not exists "payments write server" on payments for insert with check (false);
create policy if not exists "payments update server" on payments for update using (false);
create policy if not exists "payments delete server" on payments for delete using (false);

-- Webhook receipts: not readable by clients
create policy if not exists "webhook_events server only" on webhook_events for all using (false) with check (false);

-- Guard invoice mutation of Stripe columns from clients
create or replace function prevent_client_stripe_mutation() returns trigger as $$
begin
  if (current_user = 'authenticated') then
    if (new.stripe_invoice_id is distinct from old.stripe_invoice_id) then raise exception 'not allowed'; end if;
    if (new.stripe_payment_intent_id is distinct from old.stripe_payment_intent_id) then raise exception 'not allowed'; end if;
  end if;
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_invoices_stripe_guard on invoices;
create trigger trg_invoices_stripe_guard before update on invoices for each row execute function prevent_client_stripe_mutation();
