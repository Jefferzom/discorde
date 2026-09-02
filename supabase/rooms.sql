-- Execute no SQL Editor do Supabase (Dashboard → SQL)

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text,
  created_by text,
  created_at timestamptz not null default now()
);

create index if not exists rooms_created_at_idx on public.rooms (created_at desc);

alter table public.rooms enable row level security;

create policy "rooms_select_public"
  on public.rooms for select
  to anon, authenticated
  using (true);

create policy "rooms_insert_public"
  on public.rooms for insert
  to anon, authenticated
  with check (true);

create policy "rooms_update_public"
  on public.rooms for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "rooms_delete_public"
  on public.rooms for delete
  to anon, authenticated
  using (true);
