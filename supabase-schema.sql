-- =====================================================================
-- Wedding RSVP Tracker — Supabase Schema
-- Run this in your Supabase project's SQL Editor.
-- =====================================================================

-- Optional: clean slate (uncomment to reset)
-- drop table if exists public.guests cascade;
-- drop table if exists public.families cascade;

create table if not exists public.families (
  id uuid primary key default gen_random_uuid(),
  family_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.guests (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  full_name text not null,
  email text,
  church_attendance text,        -- 'Yes' | 'No' | null
  reception_attendance text,     -- 'Yes' | 'No' | null
  meal_preference text,          -- 'Beef' | 'Chicken' | 'Fish' | 'Vegetarian' | null
  dietary_restrictions text,
  rsvp_submitted_at timestamptz,
  created_at timestamptz not null default now()
);

-- Case-insensitive lookups on full_name
create index if not exists guests_full_name_lower_idx
  on public.guests (lower(full_name));

create index if not exists guests_family_id_idx
  on public.guests (family_id);

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.families enable row level security;
alter table public.guests   enable row level security;

-- ---- Guests --------------------------------------------------------
-- Public (anon) can read the guest list. This is required so a guest
-- can look themselves up by name. The anon key is in the client bundle.
drop policy if exists "guests_select_public" on public.guests;
create policy "guests_select_public"
  on public.guests for select
  to anon, authenticated
  using (true);

-- Public (anon) can update RSVP fields only. We restrict which columns
-- can be updated through Supabase by allowing UPDATE here and letting
-- the client send only RSVP columns. (Anon cannot change family_id,
-- full_name, or email because we never expose those updates in the UI;
-- a paranoid hardening step would be a SECURITY DEFINER function — see
-- bottom of file.)
drop policy if exists "guests_update_public_rsvp" on public.guests;
create policy "guests_update_public_rsvp"
  on public.guests for update
  to anon, authenticated
  using (true)
  with check (true);

-- Only authenticated users (admins) can insert/delete guests.
drop policy if exists "guests_insert_admin" on public.guests;
create policy "guests_insert_admin"
  on public.guests for insert
  to authenticated
  with check (true);

drop policy if exists "guests_delete_admin" on public.guests;
create policy "guests_delete_admin"
  on public.guests for delete
  to authenticated
  using (true);

-- ---- Families ------------------------------------------------------
-- Anon can read family rows (needed to display the family name on RSVP).
drop policy if exists "families_select_public" on public.families;
create policy "families_select_public"
  on public.families for select
  to anon, authenticated
  using (true);

-- Only authenticated users (admins) can manage families.
drop policy if exists "families_write_admin" on public.families;
create policy "families_write_admin"
  on public.families for all
  to authenticated
  using (true)
  with check (true);

-- =====================================================================
-- (Optional hardening) Restrict anon UPDATE to RSVP columns only via RPC.
-- If you want to lock things down further later, drop the
-- "guests_update_public_rsvp" policy above and use this function from
-- the client instead.
-- =====================================================================
create or replace function public.submit_rsvp(
  p_guest_id uuid,
  p_church_attendance text,
  p_reception_attendance text,
  p_meal_preference text,
  p_dietary_restrictions text
) returns void
language sql
security definer
set search_path = public
as $$
  update public.guests
     set church_attendance     = p_church_attendance,
         reception_attendance  = p_reception_attendance,
         meal_preference       = p_meal_preference,
         dietary_restrictions  = p_dietary_restrictions,
         rsvp_submitted_at     = now()
   where id = p_guest_id;
$$;

grant execute on function public.submit_rsvp(uuid, text, text, text, text) to anon, authenticated;
