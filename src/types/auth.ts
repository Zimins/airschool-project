/**
 * Type Definitions for Authentication System
 * Based on contracts/types.ts specification
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
  supabaseSession?: any; // Store the full Supabase session for advanced features
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

/**
 * Error Types
 */
export enum AuthErrorType {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR'
}

export interface AuthError {
  type: AuthErrorType;
  message: string;
  details?: any;
}

/**
 * API Response Types
 */
export interface AuthResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export type LoginResponse = AuthResponse<UserSession>;
export type RegisterResponse = AuthResponse<User>;
export type LogoutResponse = AuthResponse<void>;
export type GetUserResponse = AuthResponse<User>;
export type ListUsersResponse = AuthResponse<User[]>;