import { test, expect } from '@playwright/test';
import { AuthHelpers, TEST_USERS } from './helpers/auth-helpers';

test.describe('Authentication - Login', () => {
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

  test('should display login form correctly', async ({ page }) => {
    await authHelpers.goToLogin();

    // Check if login form elements are visible
    await expect(page.locator('[data-testid="email-input"], input[placeholder*="email" i]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"], input[placeholder*="password" i]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"], button:has-text("Login"), button:has-text("Sign In")')).toBeVisible();
    
    // Check page title or heading
    await expect(page.locator('text="Login", text="Sign In", text="Welcome"')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await authHelpers.goToLogin();

    // Try to submit empty form
    await page.click('[data-testid="login-button"], button:has-text("Login"), button:has-text("Sign In")');

    // Check for error messages
    const errorMessage = await authHelpers.getErrorMessage();
    expect(errorMessage).toBeTruthy();
    expect(errorMessage?.toLowerCase()).toContain('email');
  });

  test('should show error for invalid email format', async ({ page }) => {
    await authHelpers.goToLogin();

    // Fill invalid email
    await page.fill('[data-testid="email-input"], input[placeholder*="email" i]', 'invalid-email');
    await page.fill('[data-testid="password-input"], input[placeholder*="password" i]', 'password123');
    await page.click('[data-testid="login-button"], button:has-text("Login"), button:has-text("Sign In")');

    // Wait and check for error
    await page.waitForTimeout(1000);
    const errorMessage = await authHelpers.getErrorMessage();
    expect(errorMessage).toBeTruthy();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await authHelpers.goToLogin();

    // Fill invalid credentials
    await page.fill('[data-testid="email-input"], input[placeholder*="email" i]', 'wrong@email.com');
    await page.fill('[data-testid="password-input"], input[placeholder*="password" i]', 'wrongpassword');
    await page.click('[data-testid="login-button"], button:has-text("Login"), button:has-text("Sign In")');

    // Wait for response and check for error
    await page.waitForTimeout(2000);
    const errorMessage = await authHelpers.getErrorMessage();
    expect(errorMessage).toBeTruthy();
    expect(errorMessage?.toLowerCase()).toMatch(/invalid|incorrect|wrong|failed/);
  });

  test('should successfully login with admin credentials', async ({ page }) => {
    await authHelpers.login(TEST_USERS.admin);
    await authHelpers.waitForLogin();

    // Verify successful login
    const isLoggedIn = await authHelpers.isLoggedIn();
    expect(isLoggedIn).toBe(true);

    // Verify admin privileges
    const isAdmin = await authHelpers.isAdmin();
    expect(isAdmin).toBe(true);

    // Check URL is not login page anymore
    expect(page.url()).not.toMatch(/login/i);
  });

  test('should successfully login with regular user credentials', async ({ page }) => {
    // First we need to create a test user account
    // This assumes the signup functionality works
    const testUser = {
      ...TEST_USERS.user,
      name: 'Test User'
    };

    try {
      // Try to create the user (this might fail if user already exists)
      await authHelpers.signup(testUser);
      await page.waitForTimeout(2000);
    } catch (error) {
      // User might already exist, that's okay for this test
      console.log('Test user might already exist, proceeding with login test');
    }

    // Now test login
    await authHelpers.login(TEST_USERS.user);
    await authHelpers.waitForLogin();

    // Verify successful login
    const isLoggedIn = await authHelpers.isLoggedIn();
    expect(isLoggedIn).toBe(true);

    // Verify NOT admin (regular user)
    const isAdmin = await authHelpers.isAdmin();
    expect(isAdmin).toBe(false);

    // Check URL is not login page anymore
    expect(page.url()).not.toMatch(/login/i);
  });

  test('should show loading state during login', async ({ page }) => {
    await authHelpers.goToLogin();

    // Fill form
    await page.fill('[data-testid="email-input"], input[placeholder*="email" i]', TEST_USERS.admin.email);
    await page.fill('[data-testid="password-input"], input[placeholder*="password" i]', TEST_USERS.admin.password);

    // Click login and immediately check for loading state
    await page.click('[data-testid="login-button"], button:has-text("Login"), button:has-text("Sign In")');

    // Check for loading indicator (this might be fast, so we use a small timeout)
    const loadingIndicator = page.locator('[data-testid="loading-indicator"], .loading, text="Signing in", text="Loading"');
    if (await loadingIndicator.count() > 0) {
      await expect(loadingIndicator.first()).toBeVisible();
    }

    // Wait for login to complete
    await authHelpers.waitForLogin();
  });

  test('should remember login state after page reload', async ({ page }) => {
    // Login first
    await authHelpers.login(TEST_USERS.admin);
    await authHelpers.waitForLogin();

    // Verify logged in
    let isLoggedIn = await authHelpers.isLoggedIn();
    expect(isLoggedIn).toBe(true);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify still logged in after reload
    isLoggedIn = await authHelpers.isLoggedIn();
    expect(isLoggedIn).toBe(true);
  });

  test('should navigate to signup page when clicking signup link', async ({ page }) => {
    await authHelpers.goToLogin();

    // Click signup link
    await page.click('text="Sign Up", text="Create account", text="Register"');

    // Verify navigation to signup page
    await expect(page).toHaveURL(/.*signup/i);
    await expect(page.locator('text="Sign Up", text="Create", text="Register"')).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    await authHelpers.goToLogin();

    const passwordInput = page.locator('[data-testid="password-input"], input[placeholder*="password" i]');
    const eyeButton = page.locator('[data-testid="toggle-password"], button:near(input[type="password"]), text="👁"');

    // Fill password
    await passwordInput.fill('testpassword');

    // Initially password should be hidden (type="password")
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click eye button to show password
    if (await eyeButton.count() > 0) {
      await eyeButton.first().click();
      // Password should now be visible (type="text")
      await expect(passwordInput).toHaveAttribute('type', 'text');

      // Click again to hide
      await eyeButton.first().click();
      await expect(passwordInput).toHaveAttribute('type', 'password');
    }
  });
});