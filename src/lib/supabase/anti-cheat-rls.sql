-- =====================================================================
-- ADVANCED ZERO-TRUST RLS & ANTI-CHEAT HARDENING MIGRATION
-- Reference: OWASP ASVS Level 2+ / IELTS Scribe Defensive Architecture
-- =====================================================================

-- 1. Enable RLS on public.typing_sessions
ALTER TABLE IF EXISTS public.typing_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing permissive insert policy if present
DROP POLICY IF EXISTS "Strict user session insert" ON public.typing_sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.typing_sessions;

-- Create Strict user session insert policy with human physiological bounds
CREATE POLICY "Strict user session insert"
ON public.typing_sessions
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id 
  AND net_wpm <= 250 
  AND duration_seconds >= 3
  AND accuracy >= 0
  AND accuracy <= 100
);

-- Users can only read their own typing sessions
DROP POLICY IF EXISTS "Users can view own sessions" ON public.typing_sessions;
CREATE POLICY "Users can view own sessions"
ON public.typing_sessions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Strictly revoke client-side UPDATE and DELETE
-- (Typing sessions are immutable append-only ledger; only Super Admin via Service Role can override)
REVOKE UPDATE, DELETE ON public.typing_sessions FROM authenticated, anon;


-- 2. Hardening public.system_settings & announcements
ALTER TABLE IF EXISTS public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.announcements ENABLE ROW LEVEL SECURITY;

-- Allow public read of non-sensitive system settings keys
DROP POLICY IF EXISTS "Public can view general system settings" ON public.system_settings;
CREATE POLICY "Public can view general system settings"
ON public.system_settings
FOR SELECT
TO authenticated, anon
USING (key IN ('general_info', 'theme_defaults', 'feature_flags'));

-- Sensitive system settings (maintenance_config, security_config) are restricted to service_role only
REVOKE ALL ON public.system_settings FROM anon;
GRANT SELECT ON public.system_settings TO authenticated, anon;

-- Public can only view active announcements
DROP POLICY IF EXISTS "Public can view active announcements" ON public.announcements;
CREATE POLICY "Public can view active announcements"
ON public.announcements
FOR SELECT
TO authenticated, anon
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Prevent client mutation on system_settings and announcements
REVOKE INSERT, UPDATE, DELETE ON public.system_settings FROM authenticated, anon;
REVOKE INSERT, UPDATE, DELETE ON public.announcements FROM authenticated, anon;
