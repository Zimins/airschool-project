import { Page, expect } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  role: 'user' | 'admin';
}

export const TEST_USERS = {
  admin: {
    email: 'admin@airschool.com',
    password: 'admin123!',
    role: 'admin' as const
  },
  user: {
    email: 'test@user.com',
    password: 'testuser123!',
    role: 'user' as const
  }
};

export class AuthHelpers {
  constructor(private page: Page) {}

  /**
   * Navigate to login page
   */
  async goToLogin() {
    await this.page.goto('/');
    
    // Try different login button selectors
    const loginSelectors = [
      '[data-testid="login-button"]',
      'text="Login"', 
      'text="Sign In"',
      'button:has-text("Login")',
      'button:has-text("Sign In")'
    ];
    
    let clicked = false;
    for (const selector of loginSelectors) {
      try {
        const element = this.page.locator(selector);
        if (await element.count() > 0 && await element.first().isVisible()) {
          await element.first().click();
          clicked = true;
          break;
        }
      } catch (error) {
        // Try next selector
        continue;
      }
    }
    
    if (!clicked) {
      throw new Error('Could not find login button');
    }
    
    await expect(this.page).toHaveURL(/.*login/i);
  }

  /**
   * Navigate to signup page  
   */
  async goToSignup() {
    await this.page.goto('/');
    await this.page.click('text="Sign Up"');
    await expect(this.page).toHaveURL(/.*signup/i);
  }

  /**
   * Fill login form and submit
   */
  async login(user: TestUser) {
    await this.goToLogin();
    
    // Fill login form
    await this.page.fill('[data-testid="email-input"], input[name="email"], input[placeholder*="email" i]', user.email);
    await this.page.fill('[data-testid="password-input"], input[name="password"], input[placeholder*="password" i]', user.password);
    
    // Submit form
    await this.page.click('[data-testid="login-button"], button:has-text("Login"), button:has-text("Sign In")');
    
    // Wait for navigation or success indicator
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill signup form and submit
   */
  async signup(user: TestUser & { name?: string }) {
    await this.goToSignup();
    
    // Fill signup form
    if (user.name) {
      await this.page.fill('[data-testid="name-input"], input[name="name"], input[placeholder*="name" i]', user.name);
    }
    await this.page.fill('[data-testid="email-input"], input[name="email"], input[placeholder*="email" i]', user.email);
    await this.page.fill('[data-testid="password-input"], input[name="password"]:not([placeholder*="confirm" i]), input[placeholder*="password" i]:not([placeholder*="confirm" i])', user.password);
    await this.page.fill('[data-testid="confirm-password-input"], input[placeholder*="confirm" i], input[placeholder*="re-enter" i]', user.password);
    
    // Agree to terms if checkbox exists
    const termsCheckbox = this.page.locator('input[type="checkbox"], [role="checkbox"]');
    if (await termsCheckbox.count() > 0) {
      await termsCheckbox.first().check();
    }
    
    // Submit form
    await this.page.click('[data-testid="signup-button"], button:has-text("Sign Up")');
    
    // Wait for navigation or success
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Logout user
   */
  async logout() {
    // Look for logout button/icon
    const logoutSelectors = [
      '[data-testid="logout-button"]',
      'button:has-text("Logout")',
      'button:has-text("Log out")',
      '[data-testid="profile-button"]', // Profile button that might contain logout
      'button[aria-label*="logout" i]',
      'text="Sign out"',
      'text="Logout"'
    ];

    let clicked = false;
    for (const selector of logoutSelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0 && await element.first().isVisible()) {
        await element.first().click();
        clicked = true;
        break;
      }
    }

    if (!clicked) {
      throw new Error('Logout button not found. User might not be logged in.');
    }

    // Wait for navigation to complete
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    // Look for indicators that user is logged in
    const loggedInIndicators = [
      '[data-testid="user-profile"]',
      '[data-testid="logout-button"]', 
      'button:has-text("Logout")',
      'text="Welcome,"',
      '[data-testid="admin-button"]'
    ];

    for (const selector of loggedInIndicators) {
      const element = this.page.locator(selector);
      if (await element.count() > 0 && await element.first().isVisible()) {
        return true;
      }
    }

    // Check URL - if on login/signup page, probably not logged in
    const url = this.page.url();
    if (url.includes('login') || url.includes('signup')) {
      return false;
    }

    return false;
  }

  /**
   * Check if user is admin
   */
  async isAdmin(): Promise<boolean> {
    const adminIndicators = [
      '[data-testid="admin-button"]',
      'button:has-text("Admin")',
      'text="Admin Dashboard"'
    ];

    for (const selector of adminIndicators) {
      const element = this.page.locator(selector);
      if (await element.count() > 0 && await element.first().isVisible()) {
        return true;
      }
    }
    return false;
  }

  /**
   * Wait for login to complete
   */
  async waitForLogin() {
    // Wait for one of these to appear: welcome message, profile button, or navigation away from login
    await Promise.race([
      this.page.waitForSelector('[data-testid="user-profile"]', { timeout: 10000 }),
      this.page.waitForSelector('text="Welcome"', { timeout: 10000 }),
      this.page.waitForURL(url => !url.includes('login'), { timeout: 10000 })
    ]).catch(() => {
      // If none of the above happen, check if we're still on login page with error
      // This is not necessarily a failure
    });
  }

  /**
   * Wait for logout to complete  
   */
  async waitForLogout() {
    // Wait for navigation to login page or login button to appear
    await Promise.race([
      this.page.waitForSelector('button:has-text("Login")', { timeout: 10000 }),
      this.page.waitForSelector('text="Sign In"', { timeout: 10000 }),
      this.page.waitForURL(url => url.includes('login') || !url.includes('admin'), { timeout: 10000 })
    ]);
  }

  /**
   * Clear all local storage and session data
   */
  async clearAuthData() {
    await this.page.evaluate(() => {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.clear();
        }
      } catch (error) {
        // Handle SecurityError in headless browsers
        console.log('LocalStorage access denied, skipping clear');
      }
      
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.clear();
        }
      } catch (error) {
        // Handle SecurityError in headless browsers  
        console.log('SessionStorage access denied, skipping clear');
      }
    });
  }

  /**
   * Get error message from page
   */
  async getErrorMessage(): Promise<string | null> {
    const errorSelectors = [
      '[data-testid="error-message"]',
      '.error-message',
      '.error',
      'text="Invalid email or password"',
      'text="Login failed"',
      'text="Email already exists"'
    ];

    for (const selector of errorSelectors) {
      const element = this.page.locator(selector);
      if (await element.count() > 0 && await element.first().isVisible()) {
        return await element.first().textContent();
      }
    }
    return null;
  }
}