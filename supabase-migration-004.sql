-- =====================================================================
-- Migration 004: update meal options to match final menu
-- Run this in Supabase SQL Editor after supabase-migration-003.sql.
-- Idempotent — safe to re-run.
--
-- Final menu:
--   Adults: 'Beef Short Rib' or 'Salmon'
--   Children: 'Chicken Fingers and Fries' (single option, auto-assigned)
-- =====================================================================

-- 1) Migrate any existing meal_preference values to the new options.
update public.guests
   set meal_preference = case
     when meal_preference = 'Steak' then 'Beef Short Rib'
     when meal_preference = 'Pasta' then 'Chicken Fingers and Fries'
     when meal_preference in ('Beef Short Rib', 'Salmon', 'Chicken Fingers and Fries') then meal_preference
     else null
   end
 where meal_preference is not null;

-- 2) Update the check constraint to allow the new meal options.
alter table public.guests
  drop constraint if exists guests_meal_preference_check;

alter table public.guests
  add constraint guests_meal_preference_check
    check (
      meal_preference is null
      or meal_preference in ('Beef Short Rib', 'Salmon', 'Chicken Fingers and Fries')
    );
