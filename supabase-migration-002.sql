-- =====================================================================
-- Migration 002: add household address (admin-only) + Steak/Salmon meals
-- Run this in Supabase SQL Editor after supabase-schema.sql.
-- Idempotent — safe to re-run.
-- =====================================================================

-- 1) Add address column to families
alter table public.families
  add column if not exists address text;

-- 2) Hide `address` from anon using column-level privileges.
--    RLS controls which ROWS are visible; grants control which COLUMNS.
--    Anon keeps a permissive row policy but only gets SELECT on
--    (id, family_name) — never `address`.
revoke select on public.families from anon;
grant  select (id, family_name) on public.families to anon;

-- Authenticated (admin) keeps full access to all columns.
grant select, insert, update, delete on public.families to authenticated;

-- (Existing RLS policies remain in effect.)

-- 3) Normalise meal_preference values to the new options (Steak / Salmon).
update public.guests
   set meal_preference = case
     when meal_preference = 'Beef'   then 'Steak'
     when meal_preference = 'Fish'   then 'Salmon'
     when meal_preference in ('Steak', 'Salmon') then meal_preference
     else null   -- Chicken, Vegetarian, anything else -> clear
   end
 where meal_preference is not null;

alter table public.guests
  drop constraint if exists guests_meal_preference_check;

alter table public.guests
  add constraint guests_meal_preference_check
    check (meal_preference is null or meal_preference in ('Steak', 'Salmon'));
