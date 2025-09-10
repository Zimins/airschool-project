/**
 * Type Definitions for Authentication System
 */

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

export interface DatabaseUser {
  id: string;
  email: string;
  password_hash: string;
  role: 'user' | 'admin';
  created_at: string;
  last_login: string | null;
  is_active: boolean;
}

export type UserRole = 'user' | 'admin';

/**
 * Authentication State for React Context
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  session: UserSession | null;
  error: string | null;
}

/**
 * Authentication Actions for React Context
 */
export interface AuthActions {
  login: (credentials: UserLoginData) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: UserCreateData) => Promise<void>;
  checkSession: () => Promise<void>;
  clearError: () => void;
}