-- Migration: Add missing columns to weekly_resets and focus_pillar to user_profiles
-- Run: 2024-00-02

-- Add focus_pillar to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS focus_pillar TEXT;

-- Add all missing section columns to weekly_resets
ALTER TABLE weekly_resets
  ADD COLUMN IF NOT EXISTS s1_wins TEXT,
  ADD COLUMN IF NOT EXISTS s1_fell_short TEXT,
  ADD COLUMN IF NOT EXISTS s1_knew_better TEXT,
  ADD COLUMN IF NOT EXISTS s2_higher_self TEXT,
  ADD COLUMN IF NOT EXISTS s2_default_self TEXT,
  ADD COLUMN IF NOT EXISTS s2_pattern_focus TEXT,
  ADD COLUMN IF NOT EXISTS s3_said_yes TEXT,
  ADD COLUMN IF NOT EXISTS s3_stayed_busy TEXT,
  ADD COLUMN IF NOT EXISTS s3_avoided_decision TEXT,
  ADD COLUMN IF NOT EXISTS s4_energy_flat TEXT,
  ADD COLUMN IF NOT EXISTS s4_energy_protected TEXT,
  ADD COLUMN IF NOT EXISTS s4_showed_up TEXT,
  ADD COLUMN IF NOT EXISTS s4_energy_shift TEXT,
  ADD COLUMN IF NOT EXISTS s5_tolerated TEXT,
  ADD COLUMN IF NOT EXISTS s5_standard_commit TEXT,
  ADD COLUMN IF NOT EXISTS s6_impacted TEXT,
  ADD COLUMN IF NOT EXISTS s6_avoided_truth TEXT,
  ADD COLUMN IF NOT EXISTS s6_clarity TEXT,
  ADD COLUMN IF NOT EXISTS s6_conversation TEXT,
  ADD COLUMN IF NOT EXISTS s7_cost_detail TEXT,
  ADD COLUMN IF NOT EXISTS s7_done_tolerating TEXT,
  ADD COLUMN IF NOT EXISTS s7_must_change TEXT,
  ADD COLUMN IF NOT EXISTS s7_stop TEXT,
  ADD COLUMN IF NOT EXISTS s7_automate TEXT,
  ADD COLUMN IF NOT EXISTS s7_delegate TEXT,
  ADD COLUMN IF NOT EXISTS nonneg_1 TEXT,
  ADD COLUMN IF NOT EXISTS nonneg_2 TEXT,
  ADD COLUMN IF NOT EXISTS nonneg_3 TEXT;
