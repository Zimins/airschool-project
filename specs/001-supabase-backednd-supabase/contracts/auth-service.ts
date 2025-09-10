/**
 * Authentication Service Contract
 * Defines the interface for authentication operations
 */

import { User, UserLoginData, UserCreateData, UserSession } from '../types';

export interface AuthServiceContract {
  /**
   * Authenticate user with email and password
   * @param credentials - User email and password
   * @returns Promise resolving to user session or null if invalid
   */
  login(credentials: UserLoginData): Promise<UserSession | null>;

  /**
   * Create new user account
   * @param userData - User registration data
   * @returns Promise resolving to created user or error
   */
  register(userData: UserCreateData): Promise<User>;

  /**
   * End user session and clear stored tokens
   * @returns Promise resolving when logout is complete
   */
  logout(): Promise<void>;

  /**
   * Get current authenticated user session
   * @returns Promise resolving to current session or null if not authenticated
   */
  getCurrentSession(): Promise<UserSession | null>;

  /**
   * Verify if user has admin privileges
   * @param session - User session to check
   * @returns boolean indicating admin status
   */
  isAdmin(session: UserSession): boolean;

  /**
   * Get user by ID (admin only)
   * @param userId - User ID to retrieve
   * @param adminSession - Admin session for authorization
   * @returns Promise resolving to user data or null
   */
  getUserById(userId: string, adminSession: UserSession): Promise<User | null>;

  /**
   * List all users (admin only)
   * @param adminSession - Admin session for authorization
   * @param limit - Optional limit for pagination
   * @param offset - Optional offset for pagination
   * @returns Promise resolving to array of users
   */
  listUsers(adminSession: UserSession, limit?: number, offset?: number): Promise<User[]>;
}

/**
 * Database Query Contracts
 * Defines the Supabase queries for authentication
 */
export interface AuthQueries {
  /**
   * Find user by email for login
   */
  findUserByEmail: {
    table: 'users';
    select: 'id, email, password_hash, role, is_active, last_login, created_at';
    where: { email: string; is_active: boolean };
  };

  /**
   * Create new user
   */
  createUser: {
    table: 'users';
    insert: {
      email: string;
      password_hash: string;
      role: 'user' | 'admin';
    };
  };

  /**
   * Update last login timestamp
   */
  updateLastLogin: {
    table: 'users';
    update: { last_login: string };
    where: { id: string };
  };

  /**
   * Get user by ID
   */
  getUserById: {
    table: 'users';
    select: 'id, email, role, is_active, last_login, created_at';
    where: { id: string; is_active: boolean };
  };

  /**
   * List all users (admin only)
   */
  listAllUsers: {
    table: 'users';
    select: 'id, email, role, is_active, last_login, created_at';
    where: { is_active: boolean };
    order: { created_at: 'desc' };
    limit?: number;
    offset?: number;
  };
}

/**
 * Expected Response Types
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