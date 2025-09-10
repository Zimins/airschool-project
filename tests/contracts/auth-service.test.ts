/**
 * Contract Tests for AuthService
 * T010-T012: These tests MUST FAIL initially (TDD Red phase)
 */

import { AuthService } from '../../src/services/AuthService';
import { UserLoginData, UserCreateData, UserSession, User } from '../../src/types/auth';

describe('AuthService Contract Tests', () => {
  let authService: AuthService;

  beforeEach(() => {
    // This will fail until AuthService is implemented
    authService = new AuthService();
  });

  describe('T010: AuthService.login() contract', () => {
    it('should authenticate user with valid credentials', async () => {
      const credentials: UserLoginData = {
        email: 'admin@airschool.com',
        password: 'admin123'
      };

      const result = await authService.login(credentials);

      expect(result).toBeTruthy();
      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('email', 'admin@airschool.com');
      expect(result).toHaveProperty('role', 'admin');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('loginTimestamp');
      expect(typeof result.loginTimestamp).toBe('number');
    });

    it('should return null for invalid credentials', async () => {
      const credentials: UserLoginData = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      };

      const result = await authService.login(credentials);

      expect(result).toBeNull();
    });

    it('should update last_login timestamp on successful login', async () => {
      const credentials: UserLoginData = {
        email: 'admin@airschool.com',
        password: 'admin123'
      };

      const beforeLogin = Date.now();
      const result = await authService.login(credentials);
      const afterLogin = Date.now();

      expect(result).toBeTruthy();
      expect(result!.loginTimestamp).toBeGreaterThanOrEqual(beforeLogin);
      expect(result!.loginTimestamp).toBeLessThanOrEqual(afterLogin);
    });
  });

  describe('T011: AuthService.register() contract', () => {
    it('should create new user with valid data', async () => {
      const userData: UserCreateData = {
        email: 'newuser@example.com',
        password: 'newpassword123',
        role: 'user'
      };

      const result = await authService.register(userData);

      expect(result).toBeTruthy();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email', 'newuser@example.com');
      expect(result).toHaveProperty('role', 'user');
      expect(result).toHaveProperty('is_active', true);
      expect(result).toHaveProperty('created_at');
      expect(result).toHaveProperty('last_login', null);
    });

    it('should throw error for duplicate email', async () => {
      const userData: UserCreateData = {
        email: 'admin@airschool.com', // Already exists in seed data
        password: 'password123',
        role: 'user'
      };

      await expect(authService.register(userData))
        .rejects
        .toThrow('Email already exists');
    });

    it('should hash password before storage', async () => {
      const userData: UserCreateData = {
        email: 'hashtest@example.com',
        password: 'plainpassword123',
        role: 'user'
      };

      const result = await authService.register(userData);
      
      // Password should not be stored in plain text
      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('password_hash');
      
      // Should be able to login with original password
      const loginResult = await authService.login({
        email: 'hashtest@example.com',
        password: 'plainpassword123'
      });
      expect(loginResult).toBeTruthy();
    });
  });

  describe('T012: AuthService admin operations contract', () => {
    let adminSession: UserSession;

    beforeEach(async () => {
      // Login as admin for testing admin operations
      const adminLogin = await authService.login({
        email: 'admin@airschool.com',
        password: 'admin123'
      });
      adminSession = adminLogin!;
    });

    it('should allow admin to get user by ID', async () => {
      const testUserId = 'some-user-id'; // This will need to be a real ID in implementation

      const result = await authService.getUserById(testUserId, adminSession);

      expect(result).toBeTruthy();
      expect(result).toHaveProperty('id', testUserId);
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('role');
      expect(result).not.toHaveProperty('password_hash'); // Sensitive data excluded
    });

    it('should allow admin to list all users', async () => {
      const result = await authService.listUsers(adminSession);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      
      // Check first user structure
      const user = result[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('role');
      expect(user).toHaveProperty('is_active');
      expect(user).not.toHaveProperty('password_hash'); // Sensitive data excluded
    });

    it('should support pagination in user listing', async () => {
      const page1 = await authService.listUsers(adminSession, 2, 0);
      const page2 = await authService.listUsers(adminSession, 2, 2);

      expect(page1.length).toBeLessThanOrEqual(2);
      expect(page2.length).toBeLessThanOrEqual(2);
      
      // Pages should be different (if we have more than 2 users)
      if (page1.length === 2 && page2.length > 0) {
        expect(page1[0].id).not.toBe(page2[0].id);
      }
    });

    it('should correctly identify admin users', () => {
      const isAdminResult = authService.isAdmin(adminSession);
      expect(isAdminResult).toBe(true);

      const userSession: UserSession = {
        ...adminSession,
        role: 'user'
      };
      const isUserResult = authService.isAdmin(userSession);
      expect(isUserResult).toBe(false);
    });

    it('should deny admin operations to regular users', async () => {
      const userSession: UserSession = {
        ...adminSession,
        role: 'user'
      };

      await expect(authService.getUserById('some-id', userSession))
        .rejects
        .toThrow('Admin access required');

      await expect(authService.listUsers(userSession))
        .rejects
        .toThrow('Admin access required');
    });
  });

  describe('Session and utility methods', () => {
    it('should provide logout functionality', async () => {
      await expect(authService.logout()).resolves.toBeUndefined();
    });

    it('should get current session', async () => {
      const result = await authService.getCurrentSession();
      // Should return null if no session, UserSession if logged in
      expect(result === null || typeof result === 'object').toBe(true);
    });
  });
});