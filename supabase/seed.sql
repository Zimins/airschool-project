-- Seed data for authentication system
-- Creates default admin account for testing

-- Insert default admin account
-- Password: 'admin123' hashed with SHA-256 + salt
-- Note: In production, this should be created through secure admin interface
INSERT INTO users (email, password_hash, role) VALUES
  ('admin@airschool.com', 'c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd472634dfac71cd34ebc35d16ab7fb8a90c81f975113d6c7538dc69dd8de9077ec', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert test user account  
-- Password: 'password123' hashed with SHA-256 + salt
INSERT INTO users (email, password_hash, role) VALUES
  ('testuser@example.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f846399ad3f4e4dc8da42e06e4e2c37ac4b9e0c5647c8f2b5d7c0a8b9c3e8f2e1', 'user')
ON CONFLICT (email) DO NOTHING;

-- Additional test users for testing scenarios
INSERT INTO users (email, password_hash, role) VALUES
  ('pilot1@example.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f846399ad3f4e4dc8da42e06e4e2c37ac4b9e0c5647c8f2b5d7c0a8b9c3e8f2e1', 'user'),
  ('pilot2@example.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f846399ad3f4e4dc8da42e06e4e2c37ac4b9e0c5647c8f2b5d7c0a8b9c3e8f2e1', 'user'),
  ('moderator@airschool.com', 'c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd472634dfac71cd34ebc35d16ab7fb8a90c81f975113d6c7538dc69dd8de9077ec', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Note: Hash generation for reference:
-- admin123: SHA-256('admin123' + 'airschool_salt') = c7ad44cb...
-- password123: SHA-256('password123' + 'airschool_salt') = ef92b778...
-- In real implementation, salt should be unique per user and stored separately