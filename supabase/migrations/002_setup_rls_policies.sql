-- Set up Row Level Security policies for users table
-- Based on data-model.md security requirements

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read their own data" ON users 
  FOR SELECT 
  USING (id = auth.uid()::uuid);

-- Policy: Users can update their own data (except role)
CREATE POLICY "Users can update their own data" ON users 
  FOR UPDATE 
  USING (id = auth.uid()::uuid)
  WITH CHECK (id = auth.uid()::uuid AND role = OLD.role);

-- Policy: Allow user registration (insert new users)
CREATE POLICY "Allow user registration" ON users 
  FOR INSERT 
  WITH CHECK (role = 'user');

-- Policy: Admin users can read all user data
CREATE POLICY "Admin can read all users" ON users 
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::uuid 
      AND role = 'admin' 
      AND is_active = true
    )
  );

-- Policy: Admin users can update any user data
CREATE POLICY "Admin can update all users" ON users 
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::uuid 
      AND role = 'admin' 
      AND is_active = true
    )
  );

-- Policy: Admin users can insert new users (including other admins)
CREATE POLICY "Admin can create users" ON users 
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid()::uuid 
      AND role = 'admin' 
      AND is_active = true
    )
  );

-- Add comments for documentation
COMMENT ON POLICY "Users can read their own data" ON users IS 'Users can only access their own profile data';
COMMENT ON POLICY "Users can update their own data" ON users IS 'Users can update their profile but not change their role';
COMMENT ON POLICY "Allow user registration" ON users IS 'Allow new user registration with user role only';
COMMENT ON POLICY "Admin can read all users" ON users IS 'Admin users can view all user accounts';
COMMENT ON POLICY "Admin can update all users" ON users IS 'Admin users can modify any user account';
COMMENT ON POLICY "Admin can create users" ON users IS 'Admin users can create new accounts with any role';