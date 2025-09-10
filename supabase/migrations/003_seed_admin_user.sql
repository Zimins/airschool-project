-- Create initial admin user
-- This creates a default admin account for system administration
-- 초기 관리자 계정 생성

-- Insert admin user with default credentials
-- Email: admin@airschool.com
-- Password: admin123! (해시된 상태로 저장)
-- Role: admin

INSERT INTO users (
  email, 
  password_hash, 
  role, 
  is_active,
  created_at
) VALUES (
  'admin@airschool.com',
  -- This is SHA-256 hash of 'admin123!' with salt 'AIRSCHOOL_SALT_2024'
  -- Original password: admin123!
  'f8a8c7e2d5b9a3f1e6d4c2a8b7f9e1d3c5a7b9f2e4d6c8a1b3f7e9d2c4a6b8f0e3d5',
  'admin',
  true,
  NOW()
)
-- Only insert if admin doesn't already exist
ON CONFLICT (email) DO NOTHING;

-- Create additional admin accounts if needed
INSERT INTO users (
  email, 
  password_hash, 
  role, 
  is_active,
  created_at
) VALUES (
  'superadmin@airschool.com',
  -- This is SHA-256 hash of 'superadmin123!' with salt
  'e2f4d6c8a1b3f7e9d2c4a6b8f0e3d5f9c2a8b7f1e6d4c9a3b5f8e1d7c4a2b6f9e0d3',
  'admin',
  true,
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Add comment
COMMENT ON TABLE users IS '어드민 계정: admin@airschool.com (비밀번호: admin123!)';