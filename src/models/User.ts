/**
 * User Model with Validation
 * T021: User model validation implementation
 */

import { UserCreateData, UserLoginData, AuthError, AuthErrorType } from '../types/auth';

export class UserValidationError extends Error {
  public type: AuthErrorType = AuthErrorType.VALIDATION_ERROR;
  
  constructor(message: string, public details?: any) {
    super(message);
    this.name = 'UserValidationError';
  }
}

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
    enum: ['user', 'admin'] as const
  }
};

export class UserModel {
  /**
   * Validate email format and requirements
   */
  static validateEmail(email: string): void {
    if (!email) {
      throw new UserValidationError('Email is required');
    }

    if (email.length < UserValidation.email.minLength) {
      throw new UserValidationError(`Email must be at least ${UserValidation.email.minLength} characters`);
    }

    if (email.length > UserValidation.email.maxLength) {
      throw new UserValidationError(`Email must be no more than ${UserValidation.email.maxLength} characters`);
    }

    if (!UserValidation.email.format.test(email)) {
      throw new UserValidationError('Invalid email format');
    }

    // Basic SQL injection prevention
    const dangerousChars = /[<>'";&=]/;
    if (dangerousChars.test(email)) {
      throw new UserValidationError('Email contains invalid characters');
    }
  }

  /**
   * Validate password requirements
   */
  static validatePassword(password: string): void {
    if (!password) {
      throw new UserValidationError('Password is required');
    }

    if (password.length < UserValidation.password.minLength) {
      throw new UserValidationError(`Password must be at least ${UserValidation.password.minLength} characters`);
    }

    if (password.length > UserValidation.password.maxLength) {
      throw new UserValidationError(`Password must be no more than ${UserValidation.password.maxLength} characters`);
    }

    if (!UserValidation.password.allowedChars.test(password)) {
      throw new UserValidationError('Password contains invalid characters');
    }
  }

  /**
   * Validate user role
   */
  static validateRole(role: string): void {
    if (!role) {
      throw new UserValidationError('Role is required');
    }

    if (!UserValidation.role.enum.includes(role as any)) {
      throw new UserValidationError(`Role must be one of: ${UserValidation.role.enum.join(', ')}`);
    }
  }

  /**
   * Validate user creation data
   */
  static validateUserCreateData(userData: UserCreateData): void {
    this.validateEmail(userData.email);
    this.validatePassword(userData.password);
    
    if (userData.role) {
      this.validateRole(userData.role);
    }
  }

  /**
   * Validate user login data
   */
  static validateUserLoginData(loginData: UserLoginData): void {
    this.validateEmail(loginData.email);
    this.validatePassword(loginData.password);
  }

  /**
   * Sanitize user data for API responses (remove sensitive fields)
   */
  static sanitizeUserData(user: any): any {
    const { password_hash, ...sanitized } = user;
    return sanitized;
  }

  /**
   * Format user data for display
   */
  static formatUserForDisplay(user: any): any {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
      last_login: user.last_login,
      is_active: user.is_active
    };
  }

  /**
   * Check if email format is valid (without throwing)
   */
  static isValidEmail(email: string): boolean {
    try {
      this.validateEmail(email);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if password meets requirements (without throwing)
   */
  static isValidPassword(password: string): boolean {
    try {
      this.validatePassword(password);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generate a normalized email for consistent storage
   */
  static normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * Create a user object with validated data
   */
  static create(userData: UserCreateData) {
    this.validateUserCreateData(userData);
    
    return {
      email: this.normalizeEmail(userData.email),
      role: userData.role || 'user',
      is_active: true
    };
  }
}