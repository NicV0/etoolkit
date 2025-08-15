alter table org_features add column if not exists plan text default 'free' check (plan in ('free','pro'));

create table if not exists templates (
  key text primary key,
  name text not null,
  tier text not null check (tier in ('free','pro')),
  active boolean not null default true
);

insert into templates(key,name,tier) values
  ('clean','Clean Minimal','free') on conflict do nothing,
  ('bold','Bold Accent','free') on conflict do nothing,
  ('lined','Lined Pro','pro') on conflict do nothing,
  ('stacked','Stacked Ledger','pro') on conflict do nothing;

create or replace function can_use_template(p_org uuid, p_tpl text)
returns boolean language sql stable as $$
  with orgp as (
    select coalesce(plan,'free') as plan from org_features where org_id = p_org
  ), tpl as (
    select tier from templates where key = p_tpl and active = true
  )
  select case
    when (select count(*) from tpl)=0 then false
    when (select plan from orgp) = 'pro' then true
    else (select tier from tpl) = 'free'
  end;
$$;
