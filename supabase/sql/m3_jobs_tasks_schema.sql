create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  client_id uuid not null references clients(id) on delete restrict,
  title text not null,
  notes text,
  status text not null default 'NEW' check (status in ('NEW','SCHEDULED','IN_PROGRESS','HOLD','COMPLETE','VOID')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists task_items (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references jobs(id) on delete cascade,
  title text not null,
  done boolean not null default false,
  order_index int not null default 0,
  created_at timestamptz default now()
);

create table if not exists schedule_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  job_id uuid not null references jobs(id) on delete cascade,
  assignee_user_id uuid references auth.users(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  note text,
  created_at timestamptz default now()
);

create index if not exists idx_jobs_org on jobs(org_id, created_at desc);
create index if not exists idx_events_org_start on schedule_events(org_id, starts_at);
create index if not exists idx_tasks_job on task_items(job_id, order_index);

create or replace function touch_jobs_updated()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_jobs_touch before update on jobs
for each row execute function touch_jobs_updated();
