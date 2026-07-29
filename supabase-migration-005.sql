-- =====================================================================
-- Migration 005: add vegetarian adult meal option
-- Run this in Supabase SQL Editor after supabase-migration-004.sql.
-- Idempotent — safe to re-run.
--
-- Menu:
--   Adults: 'Beef Short Rib', 'Salmon' or 'Vegetarian'
--   Children: 'Chicken Fingers and Fries' (single option, auto-assigned)
--
-- 'Vegetarian' = Eggplant stuffed with onion, red pepper, zucchini,
--                rice and quinoa.
-- =====================================================================

-- Widen the check constraint to allow the new vegetarian meal option.
alter table public.guests
  drop constraint if exists guests_meal_preference_check;

alter table public.guests
  add constraint guests_meal_preference_check
    check (
      meal_preference is null
      or meal_preference in ('Beef Short Rib', 'Salmon', 'Vegetarian', 'Chicken Fingers and Fries')
    );
