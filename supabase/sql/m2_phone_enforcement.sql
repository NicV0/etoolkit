-- Backfill: set blank for nulls (then enforce non-empty via CHECK)
update clients set phone = coalesce(phone,'');

-- Add CHECK to prohibit empty or whitespace-only strings
alter table clients drop constraint if exists clients_phone_present;
alter table clients add constraint clients_phone_present check (length(trim(coalesce(phone,''))) > 0);
