-- Buckets
insert into storage.buckets (id, name, public) values ('branding-logos','branding-logos', false)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('exports','exports', false)
  on conflict (id) do nothing;

-- Logo files: only org members may read/write within their org prefix
-- Path convention: branding-logos/<org_id>/logo.png
create policy if not exists "logo read" on storage.objects for select using (
  bucket_id = 'branding-logos' and (
    exists (select 1 from memberships m where m.user_id = auth.uid() and storage.foldername(name) = m.org_id::text)
  )
);
create policy if not exists "logo write" on storage.objects for insert with check (
  bucket_id = 'branding-logos' and (
    exists (select 1 from memberships m where m.user_id = auth.uid() and storage.foldername(name) = m.org_id::text)
  )
);

-- Exports (optional future server exports)
create policy if not exists "exports rw" on storage.objects for all using (
  bucket_id = 'exports' and exists (select 1 from memberships m where m.user_id = auth.uid())
) with check (
  bucket_id = 'exports' and exists (select 1 from memberships m where m.user_id = auth.uid())
);
