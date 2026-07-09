-- Migration: 009_rls_auth
-- Design Ref: §3.3 RLS Policies (auth-related tables)
-- Plan SC: NFR Security (RLS-first isolation)

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- INSERT is done by trigger (SECURITY DEFINER), so no policy needed
-- DELETE cascades from auth.users

ALTER TABLE school_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY sp_select_own ON school_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY sp_insert_own ON school_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY sp_update_own ON school_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY sp_delete_own ON school_profiles
  FOR DELETE
  USING (auth.uid() = user_id);
