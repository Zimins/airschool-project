/**
 * Password Hashing Utility
 * T022: Password hashing implementation using crypto-js SHA-256 + salt
 */

import CryptoJS from 'crypto-js';
import { AuthError, AuthErrorType } from '../types/auth';

export class CryptoError extends Error {
  public type: AuthErrorType = AuthErrorType.DATABASE_ERROR;
  
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'CryptoError';
  }
}

/**
 * Crypto utility for password hashing and verification
 */
export class CryptoUtils {
  // Static salt for prototype - in production, use per-user salt
  private static readonly SALT = 'airschool_salt_2025';
  
  /**
   * Hash password with SHA-256 + salt
   * @param password Plain text password
   * @returns SHA-256 hash string
   */
  static hashPassword(password: string): string {
    if (!password) {
      throw new CryptoError('Password is required for hashing');
    }

    try {
      // Combine password with salt
      const saltedPassword = password + this.SALT;
      
      // Generate SHA-256 hash
      const hash = CryptoJS.SHA256(saltedPassword);
      
      // Convert to hex string
      return hash.toString(CryptoJS.enc.Hex);
    } catch (error) {
      throw new CryptoError('Failed to hash password', error);
    }
  }

  /**
   * Verify password against hash
   * @param password Plain text password to verify
   * @param hash Stored password hash
   * @returns True if password matches hash
   */
  static verifyPassword(password: string, hash: string): boolean {
    if (!password || !hash) {
      return false;
    }

    try {
      const passwordHash = this.hashPassword(password);
      return passwordHash === hash;
    } catch (error) {
      console.error('Password verification failed:', error);
      return false;
    }
  }

  /**
   * Generate session token
   * @param userId User ID
   * @param email User email
   * @param timestamp Login timestamp
   * @returns Session token
   */
  static generateSessionToken(userId: string, email: string, timestamp: number): string {
    try {
      const data = `${userId}:${email}:${timestamp}:${this.SALT}`;
      const token = CryptoJS.SHA256(data);
      return token.toString(CryptoJS.enc.Hex);
    } catch (error) {
      throw new CryptoError('Failed to generate session token', error);
    }
  }

  /**
   * Verify session token
   * @param token Session token to verify
   * @param userId User ID
   * @param email User email
   * @param timestamp Login timestamp
   * @returns True if token is valid
   */
  static verifySessionToken(
    token: string, 
    userId: string, 
    email: string, 
    timestamp: number
  ): boolean {
    try {
      const expectedToken = this.generateSessionToken(userId, email, timestamp);
      return token === expectedToken;
    } catch (error) {
      console.error('Session token verification failed:', error);
      return false;
    }
  }

  /**
   * Generate unique ID (simple implementation for prototype)
   * @returns Random hex string
   */
  static generateId(): string {
    const timestamp = Date.now().toString(16);
    const random = Math.random().toString(16).substring(2);
    return `${timestamp}${random}`;
  }

  /**
   * Hash string with salt (general purpose)
   * @param input Input string to hash
   * @param customSalt Optional custom salt
   * @returns Hash string
   */
  static hashString(input: string, customSalt?: string): string {
    try {
      const salt = customSalt || this.SALT;
      const saltedInput = input + salt;
      const hash = CryptoJS.SHA256(saltedInput);
      return hash.toString(CryptoJS.enc.Hex);
    } catch (error) {
      throw new CryptoError('Failed to hash string', error);
    }
  }

  /**
   * Create admin password hash for seeding
   * Used to generate hashes for seed.sql
   */
  static createAdminPasswordHash(): string {
    return this.hashPassword('admin123');
  }

  /**
   * Create test user password hash for seeding
   */
  static createTestPasswordHash(): string {
    return this.hashPassword('password123');
  }

  /**
   * Validate hash format
   * @param hash Hash string to validate
   * @returns True if hash format is valid
   */
  static isValidHashFormat(hash: string): boolean {
    // SHA-256 hash should be 64 characters of hex
    return /^[a-fA-F0-9]{64}$/.test(hash);
  }

  /**
   * Get hash info for debugging (non-production)
   */
  static getHashInfo(password: string): any {
    if (process.env.NODE_ENV === 'production') {
      throw new CryptoError('Hash info not available in production');
    }

    return {
      password: password,
      salt: this.SALT,
      saltedPassword: password + this.SALT,
      hash: this.hashPassword(password)
    };
  }
}