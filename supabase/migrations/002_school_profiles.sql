-- Migration: 002_school_profiles
-- Design Ref: §3.3 school_profiles (Optional 1:0..1 with profiles)
-- Plan SC: FR-03 (School Profile Optional registration) + FR-17 (auto-inject toggle)

CREATE TYPE school_level_enum AS ENUM ('elementary', 'middle', 'high');

CREATE TABLE school_profiles (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  school_name TEXT NOT NULL,
  homepage_url TEXT,
  logo_url TEXT,
  primary_color TEXT,
  mascot_desc TEXT,
  mascot_ref_url TEXT,
  building_ref_url TEXT,
  style_desc TEXT,
  base_prompt TEXT,
  school_level school_level_enum,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION touch_school_profile_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER school_profiles_updated_at
  BEFORE UPDATE ON school_profiles
  FOR EACH ROW EXECUTE FUNCTION touch_school_profile_updated_at();
