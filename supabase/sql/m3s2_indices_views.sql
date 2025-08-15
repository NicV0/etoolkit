-- 1) Fast day queries
create index if not exists idx_events_org_range on schedule_events(org_id, starts_at, ends_at);

-- 2) Jobs quick lookup for calendar hydration
create view if not exists v_events_hydrated as
  select e.id, e.org_id, e.job_id, e.assignee_user_id,
         e.starts_at, e.ends_at, e.note,
         j.title as job_title, j.status as job_status
  from schedule_events e
  join jobs j on j.id = e.job_id;

-- 3) Optimistic concurrency: add version columns
alter table schedule_events add column if not exists version int not null default 0;
alter table jobs add column if not exists version int not null default 0;
alter table task_items add column if not exists version int not null default 0;

-- Trigger to bump version on updates
create or replace function bump_version() returns trigger as $$
begin
  new.version := old.version + 1;
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_events_bump on schedule_events;
create trigger trg_events_bump before update on schedule_events for each row execute function bump_version();

drop trigger if exists trg_jobs_bump on jobs;
create trigger trg_jobs_bump before update on jobs for each row execute function bump_version();

drop trigger if exists trg_tasks_bump on task_items;
create trigger trg_tasks_bump before update on task_items for each row execute function bump_version();
