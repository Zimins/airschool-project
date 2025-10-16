/**
 * Authentication Service Implementation
 * T024-T027: AuthService implementation with Supabase integration
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
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
import { SessionManager } from '../utils/session';

export class AuthService {
  public supabase: SupabaseClient;
  
  constructor() {
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration missing. Check environment variables.');
    }
    
    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  /**
   * T024: Implement AuthService.login() method using Supabase Auth
   * Authenticate user with email and password using Supabase Auth
   */
  async login(credentials: UserLoginData): Promise<UserSession | null> {
    try {
      // Validate input
      UserModel.validateUserLoginData(credentials);

      const normalizedEmail = UserModel.normalizeEmail(credentials.email);

      // Use Supabase Auth for authentication
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password: credentials.password,
      });

      if (error || !data.user || !data.session) {
        console.error('Supabase Auth error:', error?.message);
        return null; // Invalid credentials
      }

      // Get user role from user metadata or default to 'user'
      const userRole = data.user.user_metadata?.role || 'user';

      // Fetch additional user data from profiles table (including nickname)
      let nickname: string | undefined;
      try {
        const { data: profileData, error: profileError } = await this.supabase
          .from('profiles')
          .select('nickname')
          .eq('id', data.user.id)
          .single();

        if (!profileError && profileData) {
          nickname = profileData.nickname;
        }
      } catch (profileError) {
        console.warn('Failed to fetch profile data:', profileError);
        // Continue with login even if profile fetch fails
      }

      // Create our internal session format with nickname
      const session: UserSession = {
        userId: data.user.id,
        email: data.user.email || normalizedEmail,
        role: userRole as 'user' | 'admin',
        nickname, // Add nickname to session
        loginTimestamp: Date.now(),
        token: data.session.access_token,
        supabaseSession: data.session // Store the full Supabase session
      };

      // Save session to AsyncStorage
      await SessionManager.saveSession(session);

      return session;
    } catch (error) {
      if (error instanceof UserValidationError) {
        throw error;
      }
      console.error('Login error:', error);
      throw new Error('Login failed');
    }
  }

  /**
   * T025: Implement AuthService.register() method using Supabase Auth
   * Create new user account using Supabase Auth
   */
  async register(userData: UserCreateData): Promise<any> {
    try {
      // Validate input
      UserModel.validateUserCreateData(userData);

      const normalizedEmail = UserModel.normalizeEmail(userData.email);

      // Create user with Supabase Auth
      const { data, error } = await this.supabase.auth.signUp({
        email: normalizedEmail,
        password: userData.password,
        options: {
          data: {
            role: userData.role || 'user'
          }
        }
      });

      if (error) {
        console.error('Supabase Auth signup error:', error?.message);
        throw new Error(error?.message || 'Failed to create user');
      }

      // If user was created successfully and we have a nickname, upsert profile
      // Use exponential backoff retry logic to wait for database triggers
      if (data.user && userData.nickname) {
        try {
          // Retry up to 3 times with exponential backoff (500ms, 1s, 2s)
          for (let i = 0; i < 3; i++) {
            const delay = 500 * Math.pow(2, i);
            await new Promise(resolve => setTimeout(resolve, delay));

            // Check if profile was created by trigger
            const { data: existingProfile } = await this.supabase
              .from('profiles')
              .select('id')
              .eq('id', data.user.id)
              .single();

            if (existingProfile) {
              if (__DEV__) {
                console.log('✅ Profile trigger completed, upserting nickname');
              }
              break;
            }

            if (__DEV__ && i < 2) {
              console.log(`⏳ Waiting for profile trigger (attempt ${i + 1}/3)...`);
            }
          }

          // Upsert profile with nickname
          const { error: profileError } = await this.supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              nickname: userData.nickname,
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'id' // Update if profile already exists
            })
            .select();

          if (profileError) {
            if (__DEV__) {
              console.error('❌ Failed to upsert profile:', profileError.message);
            }
          } else if (__DEV__) {
            console.log('✅ Profile upserted successfully');
          }
        } catch (profileError) {
          if (__DEV__) {
            console.error('❌ Profile upsert error:', profileError);
          }
          // Continue without throwing - user account is already created
        }
      }

      // Return the full Supabase Auth response so caller can handle different scenarios
      return data;
    } catch (error) {
      if (error instanceof UserValidationError) {
        throw error;
      }
      console.error('Registration error:', error);
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
   * Logout functionality using Supabase Auth
   */
  async logout(): Promise<void> {
    try {
      // Sign out from Supabase Auth
      await this.supabase.auth.signOut();
      // Clear local session
      await SessionManager.clearSession();
    } catch (error) {
      console.warn('Logout cleanup failed:', error);
      // Still clear local session even if Supabase logout fails
      await SessionManager.clearSession();
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
   * Get current Supabase Auth session
   */
  async getCurrentSupabaseSession(): Promise<any> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      if (error) {
        console.warn('Supabase session error:', error.message);
        return null;
      }
      return session;
    } catch (error) {
      console.warn('Failed to get Supabase session:', error);
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
   * Uses Supabase Auth to update password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const session = await this.getCurrentSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    // Validate new password
    UserModel.validatePassword(newPassword);

    try {
      // First, verify current password by trying to sign in
      const { data: signInData, error: signInError } = await this.supabase.auth.signInWithPassword({
        email: session.email,
        password: currentPassword,
      });

      if (signInError || !signInData.user) {
        throw new Error('Current password is incorrect');
      }

      // If current password is correct, update to new password
      const { error: updateError } = await this.supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error('Supabase update password error:', updateError?.message);
        throw new Error(updateError?.message || 'Failed to update password');
      }

      console.log('✅ Password updated successfully');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to change password');
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

  /**
   * Delete user account
   * Removes the user from Supabase Auth and clears session
   */
  async deleteAccount(session: UserSession): Promise<void> {
    if (!session || !session.userId) {
      throw new Error('No active session found');
    }

    try {
      console.log('🗑️ Deleting account for user:', session.userId);

      // Delete the currently authenticated user from Supabase Auth
      // This works because the user is deleting their own account
      const { error: deleteError } = await this.supabase.rpc('delete_user');

      if (deleteError) {
        console.error('Failed to delete account:', deleteError);
        throw new Error('Failed to delete account. Please try again.');
      }

      console.log('✅ Account deleted from database');

      // Clear local session only (no need to call signOut since user is already deleted)
      await SessionManager.clearSession();

      console.log('✅ Account deletion completed');
    } catch (error) {
      console.error('Delete account error:', error);

      // If deletion fails, try to clean up session anyway
      try {
        await SessionManager.clearSession();
      } catch (clearError) {
        console.error('Session clear error:', clearError);
      }

      throw error instanceof Error ? error : new Error('Failed to delete account. Please try again or contact support.');
    }
  }

  /**
   * Update user role
   * Changes the user's role in user_metadata
   */
  async updateUserRole(newRole: 'user' | 'admin'): Promise<void> {
    try {
      console.log('🔄 Starting role update to:', newRole);

      // Get current Supabase session directly
      const { data: { session: supabaseSession }, error: sessionError } = await this.supabase.auth.getSession();

      if (sessionError || !supabaseSession) {
        console.error('❌ No active Supabase session:', sessionError);
        throw new Error('Not authenticated');
      }

      console.log('✅ Found Supabase session for user:', supabaseSession.user.email);

      const { data, error } = await this.supabase.auth.updateUser({
        data: {
          role: newRole,
          role_changed_at: new Date().toISOString(),
          role_change_count: (supabaseSession.user.user_metadata?.role_change_count || 0) + 1,
        },
      });

      if (error) {
        console.error('❌ Supabase updateUser error:', error);
        throw new Error(error.message || 'Failed to update role');
      }

      console.log('✅ Supabase updateUser success, new role:', data?.user?.user_metadata?.role);

      // Refresh session to get latest metadata
      const { data: refreshData, error: refreshError } = await this.supabase.auth.refreshSession();

      if (refreshError) {
        console.warn('⚠️ Session refresh warning:', refreshError);
      } else {
        console.log('🔄 Session refreshed, metadata:', refreshData.user?.user_metadata);
      }

      // Update local session with new role
      const localSession = await this.getCurrentSession();
      if (localSession) {
        const updatedSession: UserSession = {
          ...localSession,
          role: newRole,
          supabaseSession: refreshData?.session || localSession.supabaseSession,
        };
        await SessionManager.saveSession(updatedSession);
        console.log('✅ Local session updated with new role:', newRole);
      }

      return;
    } catch (error) {
      console.error('❌ updateUserRole error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to update role');
    }
  }

  /**
   * Send password reset email
   * Uses Supabase Auth to send password reset link
   */
  async resetPasswordEmail(email: string): Promise<void> {
    try {
      const normalizedEmail = UserModel.normalizeEmail(email);

      // Get redirect URL based on platform
      const redirectTo = Platform.OS === 'web'
        ? (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:19006')
        : 'airschool://reset-password'; // Deep link for mobile

      const { error } = await this.supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo,
      });

      if (error) {
        if (__DEV__) {
          console.error('Supabase reset password error:', error?.message);
        }
        throw new Error(error?.message || 'Failed to send reset email');
      }

      if (__DEV__) {
        console.log('✅ Password reset email sent successfully');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to send reset email');
    }
  }

}