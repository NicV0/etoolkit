alter table jobs enable row level security;
alter table task_items enable row level security;
alter table schedule_events enable row level security;

-- jobs
create policy if not exists "jobs read" on jobs for select using (
  exists (select 1 from memberships m where m.org_id = jobs.org_id and m.user_id = auth.uid())
);
create policy if not exists "jobs insert" on jobs for insert with check (
  exists (select 1 from memberships m where m.org_id = jobs.org_id and m.user_id = auth.uid())
);
create policy if not exists "jobs update" on jobs for update using (
  exists (select 1 from memberships m where m.org_id = jobs.org_id and m.user_id = auth.uid())
);
create policy if not exists "jobs delete" on jobs for delete using (
  exists (select 1 from memberships m where m.org_id = jobs.org_id and m.user_id = auth.uid())
);

-- task_items (parent-enforced)
create policy if not exists "tasks read" on task_items for select using (
  exists (
    select 1 from jobs j
    join memberships m on m.org_id = j.org_id and m.user_id = auth.uid()
    where j.id = task_items.job_id
  )
);
create policy if not exists "tasks write" on task_items for insert with check (
  exists (
    select 1 from jobs j
    join memberships m on m.org_id = j.org_id and m.user_id = auth.uid()
    where j.id = task_items.job_id
  )
);
create policy if not exists "tasks update" on task_items for update using (
  exists (
    select 1 from jobs j
    join memberships m on m.org_id = j.org_id and m.user_id = auth.uid()
    where j.id = task_items.job_id
  )
);
create policy if not exists "tasks delete" on task_items for delete using (
  exists (
    select 1 from jobs j
    join memberships m on m.org_id = j.org_id and m.user_id = auth.uid()
    where j.id = task_items.job_id
  )
);

-- schedule_events
create policy if not exists "events read" on schedule_events for select using (
  exists (select 1 from memberships m where m.org_id = schedule_events.org_id and m.user_id = auth.uid())
);
create policy if not exists "events write" on schedule_events for insert with check (
  exists (select 1 from memberships m where m.org_id = schedule_events.org_id and m.user_id = auth.uid())
);
create policy if not exists "events update" on schedule_events for update using (
  exists (select 1 from memberships m where m.org_id = schedule_events.org_id and m.user_id = auth.uid())
);
create policy if not exists "events delete" on schedule_events for delete using (
  exists (select 1 from memberships m where m.org_id = schedule_events.org_id and m.user_id = auth.uid())
);
