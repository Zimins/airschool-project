# Data Model: Authentication System

**Feature**: Simple Authentication System with Admin Support  
**Date**: 2025-09-10  
**Version**: 0.1.0

## Core Entities

### User Entity

Represents all users in the system (both regular users and admins).

**Fields**:
- `id`: uuid (Primary Key, auto-generated)
- `email`: varchar(255) (Unique, not null) - User's login identifier
- `password_hash`: varchar(255) (not null) - SHA-256 hash with salt
- `role`: varchar(50) (not null) - Either 'user' or 'admin'
- `created_at`: timestamp (not null, default: now()) - Account creation time
- `last_login`: timestamp (nullable) - Most recent successful login
- `is_active`: boolean (not null, default: true) - Account status

**Validation Rules**:
- Email must be valid email format (RFC 5322)
- Email must be unique across all users
- Password hash must be 64 characters (SHA-256 output)
- Role must be either 'user' or 'admin'
- Email length: 5-255 characters
- No special SQL characters in email (basic injection prevention)

**Relationships**:
- No foreign key relationships in MVP
- Future: May relate to user_profiles, user_sessions tables

### Session Entity (Implicit)

Not stored in database for MVP - handled in AsyncStorage on client.

**Structure in AsyncStorage**:
```typescript
{
  userId: string,
  email: string,
  role: 'user' | 'admin',
  loginTimestamp: number,
  token: string // Simple hash for verification
}
```

## Database Schema

### Migration Script
```sql
-- Create users table
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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies (basic security)
CREATE POLICY "Users can read their own data" ON users 
  FOR SELECT USING (id = auth.uid()::uuid);
  
CREATE POLICY "Users can update their own data" ON users 
  FOR UPDATE USING (id = auth.uid()::uuid);

-- Insert default admin account
INSERT INTO users (email, password_hash, role) VALUES
  ('admin@airschool.com', 'admin_password_hash_here', 'admin');
```

## TypeScript Interfaces

### User Model
```typescript
export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
  last_login: string | null;
  is_active: boolean;
}

export interface UserCreateData {
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface UserSession {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  loginTimestamp: number;
  token: string;
}
```

### Validation Schema
```typescript
export const UserValidation = {
  email: {
    required: true,
    format: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    minLength: 5,
    maxLength: 255
  },
  password: {
    required: true,
    minLength: 6,
    maxLength: 128,
    // No special SQL characters for basic injection prevention
    allowedChars: /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]+$/
  },
  role: {
    required: true,
    enum: ['user', 'admin']
  }
};
```

## State Transitions

### User Lifecycle
1. **Created** → `is_active: true, last_login: null`
2. **First Login** → `last_login` updated
3. **Active Use** → `last_login` updated on each successful login
4. **Deactivated** → `is_active: false` (admin action)

### Authentication Flow States
1. **Unauthenticated** → No session in AsyncStorage
2. **Authenticating** → Login request in progress
3. **Authenticated** → Valid session in AsyncStorage
4. **Session Expired** → Invalid/missing session, redirect to login

## Data Access Patterns

### Read Operations
- Login: Query by email, verify password hash
- Session validation: Query by user ID
- Admin user list: Query all users (admin only)

### Write Operations
- User creation: Insert new user record
- Login: Update last_login timestamp
- Password change: Update password_hash
- Role change: Update role (admin only)

## Security Considerations

### Data Protection
- Passwords never stored in plain text
- Password hashes use SHA-256 + unique salt per user
- Email addresses are case-insensitive for login
- Basic SQL injection prevention via Supabase client

### Access Control
- Users can only access their own data
- Admins can access all user data
- Role-based UI restrictions
- RLS policies prevent unauthorized database access

## Performance Considerations

### Indexing Strategy
- Primary index on `id` (primary key)
- Unique index on `email` for fast login queries
- Index on `role` for admin user filtering
- Index on `is_active` for active user queries

### Query Optimization
- Login queries are O(1) with email index
- User listing with pagination for admin views
- Minimal data transfer (exclude password_hash in responses)

---
*Data model complete - ready for contract generation*