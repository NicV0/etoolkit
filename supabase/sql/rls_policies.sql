alter table organizations enable row level security;
create policy "select_own_orgs" on organizations for select
  using (exists(select 1 from memberships m where m.org_id = organizations.id and m.user_id = auth.uid()));

alter table memberships enable row level security;
create policy "select_own_membership" on memberships for select
  using (user_id = auth.uid());

alter table clients enable row level security;
create policy "all_clients_by_membership" on clients for all
  using (exists(select 1 from memberships m where m.org_id = clients.org_id and m.user_id = auth.uid()))
  with check (exists(select 1 from memberships m where m.org_id = clients.org_id and m.user_id = auth.uid()));

alter table quotes enable row level security;
create policy "all_quotes_by_membership" on quotes for all
  using (exists(select 1 from memberships m where m.org_id = quotes.org_id and m.user_id = auth.uid()))
  with check (exists(select 1 from memberships m where m.org_id = quotes.org_id and m.user_id = auth.uid()));

alter table quote_items enable row level security;
create policy "all_quote_items_by_membership" on quote_items for all
  using (exists(
    select 1 from quotes q
    join memberships m on m.org_id = q.org_id
    where q.id = quote_items.quote_id and m.user_id = auth.uid()
  ))
  with check (exists(
    select 1 from quotes q
    join memberships m on m.org_id = q.org_id
    where q.id = quote_items.quote_id and m.user_id = auth.uid()
  ));

alter table org_features enable row level security;
create policy "all_org_features_by_membership" on org_features for all
  using (exists(select 1 from memberships m where m.org_id = org_features.org_id and m.user_id = auth.uid()))
  with check (exists(select 1 from memberships m where m.org_id = org_features.org_id and m.user_id = auth.uid()));
