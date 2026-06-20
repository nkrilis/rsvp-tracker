-- =====================================================================
-- Migration 003: mark guests as children (different menu options)
-- Run this in Supabase SQL Editor after supabase-migration-002.sql.
-- Idempotent — safe to re-run.
-- =====================================================================

-- 1) Flag a guest as a child. Defaults to false (adult).
alter table public.guests
  add column if not exists is_child boolean not null default false;

-- 2) Children have their own menu option. Widen the meal_preference
--    check constraint to allow the child meal alongside the adult meals.
alter table public.guests
  drop constraint if exists guests_meal_preference_check;

alter table public.guests
  add constraint guests_meal_preference_check
    check (
      meal_preference is null
      or meal_preference in ('Steak', 'Salmon', 'Chicken Fingers and Fries')
    );
