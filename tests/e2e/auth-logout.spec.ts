import { test, expect } from '@playwright/test';
import { AuthHelpers, TEST_USERS } from './helpers/auth-helpers';

test.describe('Authentication - Logout', () => {
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

  test('should successfully logout admin user', async ({ page }) => {
    // First login as admin
    await authHelpers.login(TEST_USERS.admin);
    await authHelpers.waitForLogin();

    // Verify logged in
    let isLoggedIn = await authHelpers.isLoggedIn();
    expect(isLoggedIn).toBe(true);

    // Perform logout
    await authHelpers.logout();
    await authHelpers.waitForLogout();

    // Verify logged out
    isLoggedIn = await authHelpers.isLoggedIn();
    expect(isLoggedIn).toBe(false);

    // Verify redirected away from protected pages
    const currentUrl = page.url();
    expect(currentUrl).not.toMatch(/admin|dashboard/i);
  });

  test('should successfully logout regular user', async ({ page }) => {
    // Create and login as regular user
    const testUser = {
      ...TEST_USERS.user,
      name: 'Test User'
    };

    try {
      // Try to create the user
      await authHelpers.signup(testUser);
      await page.waitForTimeout(2000);
    } catch (error) {
      // User might already exist
      console.log('Test user might already exist');
    }

    // Login
    await authHelpers.login(TEST_USERS.user);
    await authHelpers.waitForLogin();

    // Verify logged in
    let isLoggedIn = await authHelpers.isLoggedIn();
    expect(isLoggedIn).toBe(true);

    // Perform logout
    await authHelpers.logout();
    await authHelpers.waitForLogout();

    // Verify logged out
    isLoggedIn = await authHelpers.isLoggedIn();
    expect(isLoggedIn).toBe(false);
  });

  test('should clear session data after logout', async ({ page }) => {
    // Login
    await authHelpers.login(TEST_USERS.admin);
    await authHelpers.waitForLogin();

    // Check that session data exists
    const sessionDataBefore = await page.evaluate(() => {
      return {
        localStorage: Object.keys(localStorage).length,
        sessionStorage: Object.keys(sessionStorage).length
      };
    });

    // Logout
    await authHelpers.logout();
    await authHelpers.waitForLogout();

    // Check that session data is cleared
    const sessionDataAfter = await page.evaluate(() => {
      const localStorageKeys = Object.keys(localStorage);
      const sessionStorageKeys = Object.keys(sessionStorage);
      
      // Look for auth-related keys
      const authKeys = [
        ...localStorageKeys.filter(key => 
          key.toLowerCase().includes('auth') || 
          key.toLowerCase().includes('session') || 
          key.toLowerCase().includes('token') ||
          key.toLowerCase().includes('user')
        ),
        ...sessionStorageKeys.filter(key => 
          key.toLowerCase().includes('auth') || 
          key.toLowerCase().includes('session') || 
          key.toLowerCase().includes('token') ||
          key.toLowerCase().includes('user')
        )
      ];
      
      return {
        localStorage: localStorageKeys.length,
        sessionStorage: sessionStorageKeys.length,
        authKeys: authKeys
      };
    });

    // Verify auth-related data is cleared
    expect(sessionDataAfter.authKeys.length).toBe(0);
  });

  test('should redirect to login page after logout', async ({ page }) => {
    // Login
    await authHelpers.login(TEST_USERS.admin);
    await authHelpers.waitForLogin();

    // Navigate to a protected page (if available)
    try {
      if (await authHelpers.isAdmin()) {
        // Try to access admin dashboard or similar
        const adminButtons = page.locator('[data-testid="admin-button"], button:has-text("Admin")');
        if (await adminButtons.count() > 0) {
          await adminButtons.first().click();
          await page.waitForLoadState('networkidle');
        }
      }
    } catch (error) {
      // Continue with test even if admin navigation fails
    }

    // Logout
    await authHelpers.logout();
    await authHelpers.waitForLogout();

    // Verify redirected appropriately
    const currentUrl = page.url();
    
    // Should either be on home page, login page, or at least not on protected pages
    const isOnProtectedPage = currentUrl.match(/admin|dashboard|profile/i);
    expect(isOnProtectedPage).toBeFalsy();
  });

  test('should show login button after logout', async ({ page }) => {
    // Login
    await authHelpers.login(TEST_USERS.admin);
    await authHelpers.waitForLogin();

    // Logout
    await authHelpers.logout();
    await authHelpers.waitForLogout();

    // Verify login button is visible
    const loginButton = page.locator('button:has-text("Login"), button:has-text("Sign In"), text="Login", text="Sign In"');
    await expect(loginButton.first()).toBeVisible();

    // Verify logout button is not visible
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Log out")');
    if (await logoutButton.count() > 0) {
      await expect(logoutButton.first()).not.toBeVisible();
    }
  });

  test('should prevent access to protected routes after logout', async ({ page }) => {
    // Login as admin
    await authHelpers.login(TEST_USERS.admin);
    await authHelpers.waitForLogin();

    // Logout
    await authHelpers.logout();
    await authHelpers.waitForLogout();

    // Try to access admin routes directly via URL
    const protectedRoutes = ['/admin', '/dashboard', '/admin-dashboard'];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');
      
      // Should be redirected to login or home, not able to access protected route
      const currentUrl = page.url();
      const isOnLoginPage = currentUrl.includes('login');
      const isOnHomePage = currentUrl === page.context().request().storageState() || currentUrl.endsWith('/');
      
      expect(isOnLoginPage || isOnHomePage).toBe(true);
    }
  });

  test('should handle logout when not logged in gracefully', async ({ page }) => {
    // Ensure not logged in
    await authHelpers.clearAuthData();
    await page.goto('/');

    // Try to logout when not logged in
    try {
      await authHelpers.logout();
      // If no error thrown, that's fine - just means logout button wasn't found
    } catch (error) {
      // This is expected - logout button shouldn't be visible when not logged in
      expect(error.message).toContain('Logout button not found');
    }

    // Verify still on a reasonable page
    const currentUrl = page.url();
    expect(currentUrl).toBeTruthy();
  });

  test('should maintain logout state across page refreshes', async ({ page }) => {
    // Login
    await authHelpers.login(TEST_USERS.admin);
    await authHelpers.waitForLogin();

    // Logout
    await authHelpers.logout();
    await authHelpers.waitForLogout();

    // Verify logged out
    let isLoggedIn = await authHelpers.isLoggedIn();
    expect(isLoggedIn).toBe(false);

    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify still logged out after refresh
    isLoggedIn = await authHelpers.isLoggedIn();
    expect(isLoggedIn).toBe(false);
  });

  test('should handle concurrent logout attempts', async ({ page }) => {
    // Login
    await authHelpers.login(TEST_USERS.admin);
    await authHelpers.waitForLogin();

    // Find logout button
    const logoutButton = page.locator('[data-testid="logout-button"], button:has-text("Logout"), button:has-text("Log out")').first();
    
    if (await logoutButton.count() > 0) {
      // Click logout multiple times quickly
      await Promise.all([
        logoutButton.click(),
        logoutButton.click(),
        logoutButton.click()
      ]);

      // Wait for logout to complete
      await authHelpers.waitForLogout();

      // Verify logged out (and no errors occurred)
      const isLoggedIn = await authHelpers.isLoggedIn();
      expect(isLoggedIn).toBe(false);
    }
  });
});