-- Completely disable RLS on admin_users to stop recursion
-- This is the most direct solution

-- Drop ALL policies on admin_users
DROP POLICY IF EXISTS "Allow admin read access to admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow authenticated read access to admin_users" ON admin_users;

-- Disable RLS entirely on admin_users table
ALTER TABLE admin_users DISABLE ROW LEVEL SECURITY;

-- Now let's also check if there are any other policies referencing admin_users
-- and drop them

-- List all policies (this is for documentation, won't execute in migration)
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename IN ('flight_schools', 'programs', 'admin_users');