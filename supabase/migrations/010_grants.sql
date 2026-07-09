-- Migration: 010_grants
-- Fixes: "permission denied for table profiles" when "Automatically expose new tables"
-- was disabled at project creation. RLS controls row-level access, but tables also
-- need GRANT for role-level access.

-- Schema usage (required)
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- profiles: authenticated user reads/updates own row (RLS-filtered)
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- school_profiles: authenticated user has full CRUD on own row (RLS-filtered)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.school_profiles TO authenticated;

-- Allow authenticated users to call the credit RPCs (defense in depth;
-- the functions themselves already grant EXECUTE only to service_role, so this
-- line is a no-op safeguard for future refactors that may relax the RPC guard).
-- (No RPC grants needed here — service_role already has them.)
