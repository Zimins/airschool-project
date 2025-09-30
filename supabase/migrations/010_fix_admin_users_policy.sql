-- Fix admin_users table infinite recursion
-- This table's policy references itself, causing the recursion

-- Drop the problematic policy on admin_users
DROP POLICY IF EXISTS "Allow admin read access to admin_users" ON admin_users;

-- Recreate with simple authenticated access (no recursion)
CREATE POLICY "Allow authenticated read access to admin_users"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Optionally disable RLS on admin_users entirely if it's not sensitive
-- ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;