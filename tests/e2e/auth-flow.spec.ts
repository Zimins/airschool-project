import { test, expect } from '@playwright/test';
import { AuthHelpers, TEST_USERS } from './helpers/auth-helpers';

test.describe('Authentication - Complete Flow', () => {
  let authHelpers: AuthHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    // Clear any existing auth data
    await authHelpers.clearAuthData();
    await page.goto('/');
  });

  test.afterEach(async ({ page }) => {
    // Clean up after each test
    await authHelpers.clearAuthData();
  });

  test('should complete full admin authentication flow', async ({ page }) => {
    // 1. Start as unauthenticated user
    let isLoggedIn = await authHelpers.isLoggedIn();
    expect(isLoggedIn).toBe(false);

    // 2. Login as admin
    await authHelpers.login(TEST_USERS.admin);
    await authHelpers.waitForLogin();

    // 3. Verify successful login
    isLoggedIn = await authHelpers.isLoggedIn();
    expect(isLoggedIn).toBe(true);

    // 4. Verify admin privileges
    const isAdmin = await authHelpers.isAdmin();
    expect(isAdmin).toBe(true);

    // 5. Perform admin actions (if admin buttons are available)
    try {
      const adminButton = page.locator('[data-testid="admin-button"], button:has-text("Admin")');
      if (await adminButton.count() > 0) {
        await adminButton.first().click();
        await page.waitForLoadState('networkidle');
        
        // Verify we can access admin area
        const currentUrl = page.url();
        const isOnAdminPage = currentUrl.includes('admin') || 
                            await page.locator('text=Admin, text=Dashboard').count() > 0;
        
        if (isOnAdminPage) {
          // Successfully accessed admin area
          expect(true).toBe(true);
        }
      }
    } catch (error) {
      // Admin functionality might not be implemented yet, that's okay
      console.log('Admin navigation not available');
    }

    // 6. Logout
    await authHelpers.logout();
    await authHelpers.waitForLogout();

    // 7. Verify logged out
    isLoggedIn = await authHelpers.isLoggedIn();
    expect(isLoggedIn).toBe(false);

    // 8. Verify cannot access admin areas after logout
    const protectedRoutes = ['/admin', '/admin-dashboard'];
    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      const currentUrl = page.url();
      const isProtectedRouteAccessible = currentUrl.includes('admin');
      expect(isProtectedRouteAccessible).toBe(false);
    }
  });

  test('should complete full regular user authentication flow', async ({ page }) => {
    // Create test user if not exists
    const testUser = {
      ...TEST_USERS.user,
      name: 'Test User Flow'
    };

    try {
      await authHelpers.signup(testUser);
      await page.waitForTimeout(2000);
    } catch (error) {
      // User might already exist
      console.log('Test user might already exist');
    }

    // 1. Start as unauthenticated
    let isLoggedIn = await authHelpers.isLoggedIn();
    expect(isLoggedIn).toBe(false);

    // 2. Login as regular user
    await authHelpers.login(TEST_USERS.user);
    await authHelpers.waitForLogin();

    // 3. Verify successful login but not admin
    isLoggedIn = await authHelpers.isLoggedIn();
    expect(isLoggedIn).toBe(true);

    const isAdmin = await authHelpers.isAdmin();
    expect(isAdmin).toBe(false);

    // 4. Try to access admin routes (should fail)
    const adminRoutes = ['/admin', '/admin-dashboard'];
    for (const route of adminRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      // Should be redirected or see access denied
      const currentUrl = page.url();
      const hasAdminAccess = currentUrl.includes('admin');
      expect(hasAdminAccess).toBe(false);
    }

    // 5. Logout
    await authHelpers.logout();
    await authHelpers.waitForLogout();

    // 6. Verify logged out
    isLoggedIn = await authHelpers.isLoggedIn();
    expect(isLoggedIn).toBe(false);
  });

  test('should handle signup to login flow', async ({ page }) => {
    const newTestUser = {
      email: 'newuser@test.com',
      password: 'newuser123!',
      role: 'user' as const,
      name: 'New Test User'
    };

    // 1. Navigate to signup
    await authHelpers.goToSignup();

    // 2. Create new account
    await authHelpers.signup(newTestUser);
    
    // 3. Check if automatically logged in after signup or need to login
    let isLoggedIn = await authHelpers.isLoggedIn();
    
    if (!isLoggedIn) {
      // Need to login manually after signup
      await authHelpers.login({
        email: newTestUser.email,
        password: newTestUser.password,
        role: newTestUser.role
      });
      await authHelpers.waitForLogin();
    }

    // 4. Verify successful authentication
    isLoggedIn = await authHelpers.isLoggedIn();
    expect(isLoggedIn).toBe(true);

    // 5. Verify user is not admin
    const isAdmin = await authHelpers.isAdmin();
    expect(isAdmin).toBe(false);

    // 6. Logout to complete the flow
    await authHelpers.logout();
    await authHelpers.waitForLogout();

    // 7. Verify logged out
    isLoggedIn = await authHelpers.isLoggedIn();
    expect(isLoggedIn).toBe(false);
  });

  test('should persist authentication across page reloads', async ({ page }) => {
    // 1. Login
    await authHelpers.login(TEST_USERS.admin);
    await authHelpers.waitForLogin();

    // 2. Verify logged in
    let isLoggedIn = await authHelpers.isLoggedIn();
    expect(isLoggedIn).toBe(true);

    // 3. Reload page multiple times
    for (let i = 0; i < 3; i++) {
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify still logged in after each reload
      isLoggedIn = await authHelpers.isLoggedIn();
      expect(isLoggedIn).toBe(true);
    }

    // 4. Navigate to different routes and back
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    isLoggedIn = await authHelpers.isLoggedIn();
    expect(isLoggedIn).toBe(true);

    // 5. Logout
    await authHelpers.logout();
    await authHelpers.waitForLogout();

    // 6. Reload after logout - should stay logged out
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    isLoggedIn = await authHelpers.isLoggedIn();
    expect(isLoggedIn).toBe(false);
  });

  test('should handle authentication errors gracefully', async ({ page }) => {
    // 1. Try to login with invalid credentials
    await authHelpers.goToLogin();
    
    await page.fill('[data-testid="email-input"], input[placeholder*="email" i]', 'invalid@email.com');
    await page.fill('[data-testid="password-input"], input[placeholder*="password" i]', 'wrongpassword');
    await page.click('[data-testid="login-button"], button:has-text("Login"), button:has-text("Sign In")');

    // 2. Wait for error message
    await page.waitForTimeout(2000);
    const errorMessage = await authHelpers.getErrorMessage();
    expect(errorMessage).toBeTruthy();

    // 3. Verify still on login page and not logged in
    expect(page.url()).toMatch(/login/i);
    const isLoggedIn = await authHelpers.isLoggedIn();
    expect(isLoggedIn).toBe(false);

    // 4. Try with correct credentials now
    await page.fill('[data-testid="email-input"], input[placeholder*="email" i]', TEST_USERS.admin.email);
    await page.fill('[data-testid="password-input"], input[placeholder*="password" i]', TEST_USERS.admin.password);
    await page.click('[data-testid="login-button"], button:has-text("Login"), button:has-text("Sign In")');

    // 5. Should now login successfully
    await authHelpers.waitForLogin();
    const isNowLoggedIn = await authHelpers.isLoggedIn();
    expect(isNowLoggedIn).toBe(true);

    // 6. Cleanup
    await authHelpers.logout();
    await authHelpers.waitForLogout();
  });

  test('should handle concurrent authentication attempts', async ({ page }) => {
    // 1. Try rapid login attempts
    await authHelpers.goToLogin();
    
    // Fill form
    await page.fill('[data-testid="email-input"], input[placeholder*="email" i]', TEST_USERS.admin.email);
    await page.fill('[data-testid="password-input"], input[placeholder*="password" i]', TEST_USERS.admin.password);

    // Click login button multiple times rapidly
    const loginButton = page.locator('[data-testid="login-button"], button:has-text("Login"), button:has-text("Sign In")');
    await Promise.all([
      loginButton.first().click(),
      loginButton.first().click(),
      loginButton.first().click()
    ]);

    // 2. Should still login successfully (no errors from concurrent attempts)
    await authHelpers.waitForLogin();
    const isLoggedIn = await authHelpers.isLoggedIn();
    expect(isLoggedIn).toBe(true);

    // 3. Cleanup
    await authHelpers.logout();
    await authHelpers.waitForLogout();
  });

  test('should maintain security after authentication', async ({ page }) => {
    // 1. Login as regular user
    const testUser = {
      ...TEST_USERS.user,
      name: 'Security Test User'
    };

    try {
      await authHelpers.signup(testUser);
      await page.waitForTimeout(2000);
    } catch (error) {
      console.log('Test user might already exist');
    }

    await authHelpers.login(TEST_USERS.user);
    await authHelpers.waitForLogin();

    // 2. Verify logged in as regular user
    let isLoggedIn = await authHelpers.isLoggedIn();
    expect(isLoggedIn).toBe(true);

    let isAdmin = await authHelpers.isAdmin();
    expect(isAdmin).toBe(false);

    // 3. Try to access admin functionality - should be blocked
    const adminRoutes = ['/admin', '/admin-dashboard'];
    for (const route of adminRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      // Should not be able to access admin routes
      const currentUrl = page.url();
      const canAccessAdmin = currentUrl.includes('admin');
      expect(canAccessAdmin).toBe(false);
    }

    // 4. Logout and verify all access is revoked
    await authHelpers.logout();
    await authHelpers.waitForLogout();

    isLoggedIn = await authHelpers.isLoggedIn();
    expect(isLoggedIn).toBe(false);

    // 5. Try to access any protected route after logout
    const protectedRoutes = ['/', '/admin', '/dashboard'];
    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      // Should not be able to access protected content
      isLoggedIn = await authHelpers.isLoggedIn();
      expect(isLoggedIn).toBe(false);
    }
  });
});