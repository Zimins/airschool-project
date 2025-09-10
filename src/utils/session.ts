/**
 * Session Management Utility
 * T023: Session management utility for AsyncStorage operations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSession, AuthError, AuthErrorType } from '../types/auth';
import { CryptoUtils } from './crypto';

export class SessionError extends Error {
  public type: AuthErrorType = AuthErrorType.SESSION_EXPIRED;
  
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'SessionError';
  }
}

/**
 * Session management utility for AsyncStorage
 */
export class SessionManager {
  private static readonly SESSION_KEY = 'userSession';
  private static readonly SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
  
  /**
   * Save session to AsyncStorage
   * @param session User session data
   */
  static async saveSession(session: UserSession): Promise<void> {
    try {
      const sessionData = JSON.stringify(session);
      await AsyncStorage.setItem(this.SESSION_KEY, sessionData);
    } catch (error) {
      throw new SessionError('Failed to save session', error);
    }
  }

  /**
   * Get session from AsyncStorage
   * @returns User session or null if not found/expired
   */
  static async getSession(): Promise<UserSession | null> {
    try {
      const sessionData = await AsyncStorage.getItem(this.SESSION_KEY);
      
      if (!sessionData) {
        return null;
      }

      const session: UserSession = JSON.parse(sessionData);
      
      // Check if session is expired
      if (this.isSessionExpired(session)) {
        await this.clearSession();
        return null;
      }

      // Verify session token
      if (!this.verifySessionToken(session)) {
        await this.clearSession();
        throw new SessionError('Invalid session token');
      }

      return session;
    } catch (error) {
      if (error instanceof SessionError) {
        throw error;
      }
      throw new SessionError('Failed to retrieve session', error);
    }
  }

  /**
   * Clear session from AsyncStorage
   */
  static async clearSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      throw new SessionError('Failed to clear session', error);
    }
  }

  /**
   * Check if session exists
   * @returns True if valid session exists
   */
  static async hasValidSession(): Promise<boolean> {
    try {
      const session = await this.getSession();
      return session !== null;
    } catch {
      return false;
    }
  }

  /**
   * Update session timestamp
   * @param session Current session
   */
  static async refreshSession(session: UserSession): Promise<UserSession> {
    try {
      const refreshedSession: UserSession = {
        ...session,
        loginTimestamp: Date.now(),
        token: CryptoUtils.generateSessionToken(
          session.userId,
          session.email,
          Date.now()
        )
      };

      await this.saveSession(refreshedSession);
      return refreshedSession;
    } catch (error) {
      throw new SessionError('Failed to refresh session', error);
    }
  }

  /**
   * Create new session
   * @param userId User ID
   * @param email User email
   * @param role User role
   * @returns New session object
   */
  static createSession(userId: string, email: string, role: 'user' | 'admin'): UserSession {
    const timestamp = Date.now();
    const token = CryptoUtils.generateSessionToken(userId, email, timestamp);

    return {
      userId,
      email,
      role,
      loginTimestamp: timestamp,
      token
    };
  }

  /**
   * Check if session is expired
   * @param session Session to check
   * @returns True if session is expired
   */
  static isSessionExpired(session: UserSession): boolean {
    const now = Date.now();
    const sessionAge = now - session.loginTimestamp;
    return sessionAge > this.SESSION_TIMEOUT;
  }

  /**
   * Verify session token integrity
   * @param session Session to verify
   * @returns True if token is valid
   */
  static verifySessionToken(session: UserSession): boolean {
    return CryptoUtils.verifySessionToken(
      session.token,
      session.userId,
      session.email,
      session.loginTimestamp
    );
  }

  /**
   * Get session age in minutes
   * @param session Session to check
   * @returns Age in minutes
   */
  static getSessionAge(session: UserSession): number {
    const now = Date.now();
    const ageMs = now - session.loginTimestamp;
    return Math.floor(ageMs / (1000 * 60));
  }

  /**
   * Get remaining session time in minutes
   * @param session Session to check
   * @returns Remaining time in minutes, 0 if expired
   */
  static getRemainingSessionTime(session: UserSession): number {
    const ageMs = Date.now() - session.loginTimestamp;
    const remainingMs = this.SESSION_TIMEOUT - ageMs;
    return Math.max(0, Math.floor(remainingMs / (1000 * 60)));
  }

  /**
   * Check if user is admin
   * @param session Session to check
   * @returns True if user has admin role
   */
  static isAdmin(session: UserSession | null): boolean {
    return session?.role === 'admin';
  }

  /**
   * Check if user is authenticated
   * @param session Session to check
   * @returns True if user is authenticated with valid session
   */
  static isAuthenticated(session: UserSession | null): boolean {
    if (!session) return false;
    if (this.isSessionExpired(session)) return false;
    if (!this.verifySessionToken(session)) return false;
    return true;
  }

  /**
   * Get all stored keys (for debugging)
   */
  static async getAllStoredKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      throw new SessionError('Failed to get stored keys', error);
    }
  }

  /**
   * Clear all AsyncStorage data (for testing/debugging)
   */
  static async clearAllStorage(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      throw new SessionError('Failed to clear all storage', error);
    }
  }

  /**
   * Extend session timeout (for admin users)
   * @param session Current session
   * @param additionalMinutes Additional minutes to add
   */
  static async extendSession(session: UserSession, additionalMinutes: number): Promise<UserSession> {
    if (!this.isAdmin(session)) {
      throw new SessionError('Only admin users can extend sessions');
    }

    const extendedTimestamp = session.loginTimestamp + (additionalMinutes * 60 * 1000);
    const extendedSession: UserSession = {
      ...session,
      loginTimestamp: extendedTimestamp
    };

    await this.saveSession(extendedSession);
    return extendedSession;
  }
}