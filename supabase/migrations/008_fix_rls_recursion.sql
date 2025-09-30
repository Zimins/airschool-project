-- Fix RLS infinite recursion by removing admin_users dependency
-- Use users table with role column instead

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Allow admin read access to admin_users" ON admin_users;
DROP POLICY IF EXISTS "Allow admin insert to flight_schools" ON flight_schools;
DROP POLICY IF EXISTS "Allow admin update to flight_schools" ON flight_schools;
DROP POLICY IF EXISTS "Allow admin delete from flight_schools" ON flight_schools;
DROP POLICY IF EXISTS "Allow admin insert to programs" ON programs;
DROP POLICY IF EXISTS "Allow admin update to programs" ON programs;
DROP POLICY IF EXISTS "Allow admin delete from programs" ON programs;

-- Recreate policies using users table instead of admin_users
-- Flight Schools policies
CREATE POLICY "Allow admin insert to flight_schools"
  ON flight_schools
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::uuid
      AND users.role = 'admin'
      AND users.is_active = true
    )
  );

CREATE POLICY "Allow admin update to flight_schools"
  ON flight_schools
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::uuid
      AND users.role = 'admin'
      AND users.is_active = true
    )
  );

CREATE POLICY "Allow admin delete from flight_schools"
  ON flight_schools
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::uuid
      AND users.role = 'admin'
      AND users.is_active = true
    )
  );

-- Programs policies
CREATE POLICY "Allow admin insert to programs"
  ON programs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::uuid
      AND users.role = 'admin'
      AND users.is_active = true
    )
  );

CREATE POLICY "Allow admin update to programs"
  ON programs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::uuid
      AND users.role = 'admin'
      AND users.is_active = true
    )
  );

CREATE POLICY "Allow admin delete from programs"
  ON programs
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()::uuid
      AND users.role = 'admin'
      AND users.is_active = true
    )
  );

-- Admin users table - allow admins to read without recursion
-- Use a function to avoid recursion
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users
    WHERE id = auth.uid()::uuid
    AND role = 'admin'
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Allow admin read access to admin_users"
  ON admin_users
  FOR SELECT
  USING (is_admin());