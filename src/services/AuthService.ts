/**
 * Authentication Service Implementation
 * T024-T027: AuthService implementation with Supabase integration
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { 
  User, 
  UserSession, 
  UserLoginData, 
  UserCreateData, 
  DatabaseUser,
  AuthError,
  AuthErrorType 
} from '../types/auth';
import { UserModel, UserValidationError } from '../models/User';
import { CryptoUtils } from '../utils/crypto';
import { SessionManager } from '../utils/session';

export class AuthService {
  private supabase: SupabaseClient;
  
  constructor() {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing. Check environment variables.');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  /**
   * T024: Implement AuthService.login() method
   * Authenticate user with email and password
   */
  async login(credentials: UserLoginData): Promise<UserSession | null> {
    try {
      // Validate input
      UserModel.validateUserLoginData(credentials);
      
      const normalizedEmail = UserModel.normalizeEmail(credentials.email);
      
      // Query user from database
      const { data: userData, error } = await this.supabase
        .from('users')
        .select('id, email, password_hash, role, is_active, last_login, created_at')
        .eq('email', normalizedEmail)
        .eq('is_active', true)
        .single();

      if (error || !userData) {
        return null; // Invalid credentials
      }

      // Verify password
      const isValidPassword = CryptoUtils.verifyPassword(
        credentials.password, 
        userData.password_hash
      );

      if (!isValidPassword) {
        return null; // Invalid credentials
      }

      // Update last login timestamp
      await this.supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userData.id);

      // Create session
      const session = SessionManager.createSession(
        userData.id,
        userData.email,
        userData.role
      );

      // Save session
      await SessionManager.saveSession(session);

      return session;
    } catch (error) {
      if (error instanceof UserValidationError) {
        throw error;
      }
      throw new Error('Login failed');
    }
  }

  /**
   * T025: Implement AuthService.register() method
   * Create new user account
   */
  async register(userData: UserCreateData): Promise<User> {
    try {
      // Validate input
      UserModel.validateUserCreateData(userData);
      
      const normalizedEmail = UserModel.normalizeEmail(userData.email);
      
      // Check if email already exists
      const { data: existingUser } = await this.supabase
        .from('users')
        .select('id')
        .eq('email', normalizedEmail)
        .single();

      if (existingUser) {
        throw new Error('Email already exists');
      }

      // Hash password
      const passwordHash = CryptoUtils.hashPassword(userData.password);

      // Create user in database
      const { data: newUser, error } = await this.supabase
        .from('users')
        .insert([{
          email: normalizedEmail,
          password_hash: passwordHash,
          role: userData.role || 'user'
        }])
        .select('id, email, role, created_at, last_login, is_active')
        .single();

      if (error || !newUser) {
        throw new Error('Failed to create user');
      }

      return UserModel.formatUserForDisplay(newUser);
    } catch (error) {
      if (error instanceof UserValidationError) {
        throw error;
      }
      throw error;
    }
  }

  /**
   * T026: Implement AuthService admin operations
   * Admin-specific operations for user management
   */
  async getUserById(userId: string, adminSession: UserSession): Promise<User | null> {
    // Check admin permissions
    if (!SessionManager.isAdmin(adminSession)) {
      throw new Error('Admin access required');
    }

    if (!SessionManager.isAuthenticated(adminSession)) {
      throw new Error('Invalid session');
    }

    try {
      const { data: user, error } = await this.supabase
        .from('users')
        .select('id, email, role, created_at, last_login, is_active')
        .eq('id', userId)
        .eq('is_active', true)
        .single();

      if (error || !user) {
        return null;
      }

      return UserModel.formatUserForDisplay(user);
    } catch (error) {
      throw new Error('Failed to get user');
    }
  }

  async listUsers(adminSession: UserSession, limit?: number, offset?: number): Promise<User[]> {
    // Check admin permissions
    if (!SessionManager.isAdmin(adminSession)) {
      throw new Error('Admin access required');
    }

    if (!SessionManager.isAuthenticated(adminSession)) {
      throw new Error('Invalid session');
    }

    try {
      let query = this.supabase
        .from('users')
        .select('id, email, role, created_at, last_login, is_active')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.range(offset, offset + (limit || 10) - 1);
      }

      const { data: users, error } = await query;

      if (error) {
        throw new Error('Failed to list users');
      }

      return (users || []).map(user => UserModel.formatUserForDisplay(user));
    } catch (error) {
      throw error;
    }
  }

  isAdmin(session: UserSession): boolean {
    return SessionManager.isAdmin(session);
  }

  /**
   * T027: Add error handling and validation to AuthService methods
   * Logout functionality
   */
  async logout(): Promise<void> {
    try {
      await SessionManager.clearSession();
    } catch (error) {
      console.warn('Logout cleanup failed:', error);
      // Don't throw - logout should always succeed from user perspective
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<UserSession | null> {
    try {
      return await SessionManager.getSession();
    } catch (error) {
      console.warn('Failed to get current session:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const session = await this.getCurrentSession();
      return SessionManager.isAuthenticated(session);
    } catch {
      return false;
    }
  }

  /**
   * Refresh current session
   */
  async refreshSession(): Promise<UserSession | null> {
    try {
      const currentSession = await this.getCurrentSession();
      if (!currentSession) {
        return null;
      }

      return await SessionManager.refreshSession(currentSession);
    } catch (error) {
      console.warn('Failed to refresh session:', error);
      return null;
    }
  }

  /**
   * Change user password (authenticated users only)
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const session = await this.getCurrentSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    // Validate new password
    UserModel.validatePassword(newPassword);

    try {
      // Get current user data
      const { data: userData, error: fetchError } = await this.supabase
        .from('users')
        .select('id, password_hash')
        .eq('id', session.userId)
        .single();

      if (fetchError || !userData) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValidCurrentPassword = CryptoUtils.verifyPassword(
        currentPassword,
        userData.password_hash
      );

      if (!isValidCurrentPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const newPasswordHash = CryptoUtils.hashPassword(newPassword);

      // Update password in database
      const { error: updateError } = await this.supabase
        .from('users')
        .update({ password_hash: newPasswordHash })
        .eq('id', session.userId);

      if (updateError) {
        throw new Error('Failed to update password');
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deactivate user account (admin only)
   */
  async deactivateUser(userId: string, adminSession: UserSession): Promise<void> {
    if (!SessionManager.isAdmin(adminSession)) {
      throw new Error('Admin access required');
    }

    try {
      const { error } = await this.supabase
        .from('users')
        .update({ is_active: false })
        .eq('id', userId);

      if (error) {
        throw new Error('Failed to deactivate user');
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user statistics (admin only)
   */
  async getUserStats(adminSession: UserSession): Promise<any> {
    if (!SessionManager.isAdmin(adminSession)) {
      throw new Error('Admin access required');
    }

    try {
      const { data: stats, error } = await this.supabase
        .from('users')
        .select('role, is_active')
        .eq('is_active', true);

      if (error) {
        throw new Error('Failed to get user statistics');
      }

      const totalUsers = stats?.length || 0;
      const adminUsers = stats?.filter(u => u.role === 'admin').length || 0;
      const regularUsers = stats?.filter(u => u.role === 'user').length || 0;

      return {
        totalUsers,
        adminUsers,
        regularUsers,
        activeUsers: totalUsers // All returned users are active due to filter
      };
    } catch (error) {
      throw error;
    }
  }
}