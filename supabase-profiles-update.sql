alter table public.profiles
  add column if not exists instagram text,
  add column if not exists how_did_you_find_us text;
