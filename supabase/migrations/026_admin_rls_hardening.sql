-- 026: Make admin a server-side fact and lock down content tables.
--
-- Before this migration:
--   * study_materials, community_posts, community_comments, profiles and
--     admin_users had RLS disabled, so anyone holding the public anon key
--     could insert/update/delete rows.
--   * flight_schools allowed any *authenticated* user to insert/update/delete.
--   * The app decided "is admin" from user_metadata.role, which every user can
--     set on themselves via auth.updateUser().
--
-- After this migration:
--   * public.is_admin() (SECURITY DEFINER) answers from admin_users membership
--     and is the single source of truth for both RLS and the app UI.
--   * Content tables are world-readable; writes need is_admin() (or, for
--     community posts/comments, ownership).
--   * Existing admins (the accounts that carried user_metadata.role = 'admin')
--     are bootstrapped into admin_users so nobody gets locked out.

-- ---------------------------------------------------------------------------
-- 1. is_admin()
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = auth.uid()
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

COMMENT ON FUNCTION public.is_admin() IS
  'True when the calling user is listed in admin_users. Used by RLS policies and exposed as an RPC for the app.';

-- ---------------------------------------------------------------------------
-- 2. admin_users: enable RLS (policies already exist: self-check SELECT and
--    super_admin management). Direct table privileges for anon/authenticated
--    are dropped; is_admin() runs as definer so it keeps working.
-- ---------------------------------------------------------------------------
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.admin_users FROM anon, authenticated;

-- Bootstrap: accounts that the app currently treats as admins.
INSERT INTO public.admin_users (id, email, role, created_at, setup_note)
SELECT u.id, u.email, 'admin', now(),
       'Bootstrapped from user_metadata.role = admin by migration 026 (2026-09-16)'
FROM auth.users u
WHERE u.raw_user_meta_data->>'role' = 'admin'
  AND u.email NOT LIKE 'dogfood.qa+%'
ON CONFLICT (id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. study_materials: public read, admin-only writes
-- ---------------------------------------------------------------------------
ALTER TABLE public.study_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to study_materials" ON public.study_materials;
DROP POLICY IF EXISTS "Allow admin insert to study_materials" ON public.study_materials;
DROP POLICY IF EXISTS "Allow admin update to study_materials" ON public.study_materials;
DROP POLICY IF EXISTS "Allow admin delete from study_materials" ON public.study_materials;
DROP POLICY IF EXISTS "study_materials_public_read" ON public.study_materials;
DROP POLICY IF EXISTS "study_materials_admin_insert" ON public.study_materials;
DROP POLICY IF EXISTS "study_materials_admin_update" ON public.study_materials;
DROP POLICY IF EXISTS "study_materials_admin_delete" ON public.study_materials;

CREATE POLICY "study_materials_public_read" ON public.study_materials
  FOR SELECT USING (true);
CREATE POLICY "study_materials_admin_insert" ON public.study_materials
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "study_materials_admin_update" ON public.study_materials
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "study_materials_admin_delete" ON public.study_materials
  FOR DELETE TO authenticated USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- 4. community_posts: public read, members write their own, admins moderate
-- ---------------------------------------------------------------------------
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_posts_public_read" ON public.community_posts;
DROP POLICY IF EXISTS "community_posts_member_insert" ON public.community_posts;
DROP POLICY IF EXISTS "community_posts_owner_or_admin_update" ON public.community_posts;
DROP POLICY IF EXISTS "community_posts_owner_or_admin_delete" ON public.community_posts;

CREATE POLICY "community_posts_public_read" ON public.community_posts
  FOR SELECT USING (true);
CREATE POLICY "community_posts_member_insert" ON public.community_posts
  FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "community_posts_owner_or_admin_update" ON public.community_posts
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR public.is_admin())
  WITH CHECK (author_id = auth.uid() OR public.is_admin());
CREATE POLICY "community_posts_owner_or_admin_delete" ON public.community_posts
  FOR DELETE TO authenticated USING (author_id = auth.uid() OR public.is_admin());

-- ---------------------------------------------------------------------------
-- 5. community_comments: same shape as posts
-- ---------------------------------------------------------------------------
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "community_comments_public_read" ON public.community_comments;
DROP POLICY IF EXISTS "community_comments_member_insert" ON public.community_comments;
DROP POLICY IF EXISTS "community_comments_owner_or_admin_update" ON public.community_comments;
DROP POLICY IF EXISTS "community_comments_owner_or_admin_delete" ON public.community_comments;

CREATE POLICY "community_comments_public_read" ON public.community_comments
  FOR SELECT USING (true);
CREATE POLICY "community_comments_member_insert" ON public.community_comments
  FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "community_comments_owner_or_admin_update" ON public.community_comments
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid() OR public.is_admin())
  WITH CHECK (author_id = auth.uid() OR public.is_admin());
CREATE POLICY "community_comments_owner_or_admin_delete" ON public.community_comments
  FOR DELETE TO authenticated USING (author_id = auth.uid() OR public.is_admin());

-- ---------------------------------------------------------------------------
-- 6. flight_schools: drop the "any authenticated user may write" policies
--    added by 009; only admins manage schools. Public read stays as is.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated insert to flight_schools" ON public.flight_schools;
DROP POLICY IF EXISTS "Allow authenticated update to flight_schools" ON public.flight_schools;
DROP POLICY IF EXISTS "Allow authenticated delete from flight_schools" ON public.flight_schools;
DROP POLICY IF EXISTS "Allow admin full access" ON public.flight_schools;
DROP POLICY IF EXISTS "flight_schools_admin_insert" ON public.flight_schools;
DROP POLICY IF EXISTS "flight_schools_admin_update" ON public.flight_schools;
DROP POLICY IF EXISTS "flight_schools_admin_delete" ON public.flight_schools;

CREATE POLICY "flight_schools_admin_insert" ON public.flight_schools
  FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "flight_schools_admin_update" ON public.flight_schools
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "flight_schools_admin_delete" ON public.flight_schools
  FOR DELETE TO authenticated USING (public.is_admin());
-- Admins also need to see inactive schools in the management screen.
CREATE POLICY "flight_schools_admin_read_all" ON public.flight_schools
  FOR SELECT TO authenticated USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- 7. profiles: enable RLS. Nicknames are public (review/post author names);
--    each user manages only their own row. The signup trigger
--    (handle_new_user, SECURITY DEFINER) is unaffected.
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable insert for service role" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_owner_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_owner_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_owner_delete" ON public.profiles;

CREATE POLICY "profiles_public_read" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "profiles_owner_insert" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_owner_update" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_owner_delete" ON public.profiles
  FOR DELETE TO authenticated USING (id = auth.uid());
