-- Create users table for authentication
-- Based on data-model.md schema

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Create indices for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Add email validation constraint
ALTER TABLE users ADD CONSTRAINT valid_email CHECK (email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$');

-- Add comments for documentation
COMMENT ON TABLE users IS 'User accounts for authentication system';
COMMENT ON COLUMN users.id IS 'Unique identifier for user';
COMMENT ON COLUMN users.email IS 'User email address (unique login identifier)';
COMMENT ON COLUMN users.password_hash IS 'SHA-256 hash of user password with salt';
COMMENT ON COLUMN users.role IS 'User role: admin or user';
COMMENT ON COLUMN users.created_at IS 'Account creation timestamp';
COMMENT ON COLUMN users.last_login IS 'Most recent successful login';
COMMENT ON COLUMN users.is_active IS 'Account status (active/inactive)';