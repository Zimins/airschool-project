-- Simple fix: Remove all problematic RLS policies that cause recursion
-- Allow public read, disable write protection temporarily for testing

-- Drop all policies that reference admin_users (causes recursion)
DROP POLICY IF EXISTS "Allow admin read access to admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow admin insert to flight_schools" ON flight_schools;
DROP POLICY IF EXISTS "Allow admin update to flight_schools" ON flight_schools;
DROP POLICY IF EXISTS "Allow admin delete from flight_schools" ON flight_schools;
DROP POLICY IF EXISTS "Allow admin insert to programs" ON programs;
DROP POLICY IF EXISTS "Allow admin update to programs" ON programs;
DROP POLICY IF EXISTS "Allow admin delete from programs" ON programs;

-- Recreate simple policies without recursion
-- Allow all authenticated users to manage flight schools (temporary for testing)
CREATE POLICY "Allow authenticated insert to flight_schools"
  ON flight_schools
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to flight_schools"
  ON flight_schools
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated delete from flight_schools"
  ON flight_schools
  FOR DELETE
  TO authenticated
  USING (true);

-- Programs policies
CREATE POLICY "Allow authenticated insert to programs"
  ON programs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update to programs"
  ON programs
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated delete from programs"
  ON programs
  FOR DELETE
  TO authenticated
  USING (true);

-- Note: This is a simplified version for testing
-- TODO: Add proper role-based access control after users table is created