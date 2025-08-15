alter table invoices enable row level security;
alter table invoice_items enable row level security;

-- invoices: select/insert/update/delete only for org members
create policy if not exists "invoices read" on invoices for select using (
  exists (select 1 from memberships m where m.org_id = invoices.org_id and m.user_id = auth.uid())
);
create policy if not exists "invoices insert" on invoices for insert with check (
  exists (select 1 from memberships m where m.org_id = invoices.org_id and m.user_id = auth.uid())
);
create policy if not exists "invoices update" on invoices for update using (
  exists (select 1 from memberships m where m.org_id = invoices.org_id and m.user_id = auth.uid())
);
create policy if not exists "invoices delete" on invoices for delete using (
  exists (select 1 from memberships m where m.org_id = invoices.org_id and m.user_id = auth.uid())
);

-- invoice_items: scope through parent invoice.org_id
create policy if not exists "invoice_items read" on invoice_items for select using (
  exists (
    select 1 from invoices i
    join memberships m on m.org_id = i.org_id and m.user_id = auth.uid()
    where i.id = invoice_items.invoice_id
  )
);
create policy if not exists "invoice_items insert" on invoice_items for insert with check (
  exists (
    select 1 from invoices i
    join memberships m on m.org_id = i.org_id and m.user_id = auth.uid()
    where i.id = invoice_items.invoice_id
  )
);
create policy if not exists "invoice_items update" on invoice_items for update using (
  exists (
    select 1 from invoices i
    join memberships m on m.org_id = i.org_id and m.user_id = auth.uid()
    where i.id = invoice_items.invoice_id
  )
);
create policy if not exists "invoice_items delete" on invoice_items for delete using (
  exists (
    select 1 from invoices i
    join memberships m on m.org_id = i.org_id and m.user_id = auth.uid()
    where i.id = invoice_items.invoice_id
  )
);
