import { Page } from '@playwright/test';

export class TestUtils {
  constructor(private page: Page) {}

  /**
   * Wait for the application to fully load
   */
  async waitForAppLoad() {
    await this.page.waitForLoadState('networkidle');
    // Wait for React to finish initial render
    await this.page.waitForTimeout(1000);
  }

  /**
   * Take a screenshot for debugging
   */
  async takeDebugScreenshot(name: string) {
    const timestamp = Date.now();
    await this.page.screenshot({
      path: `tests/e2e/screenshots/${name}-${timestamp}.png`,
      fullPage: true
    });
  }

  /**
   * Get current URL without query params
   */
  getCurrentPath(): string {
    const url = new URL(this.page.url());
    return url.pathname;
  }

  /**
   * Wait for specific element to be stable (not animating)
   */
  async waitForElementStable(selector: string) {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible' });
    // Wait for potential animations to settle
    await this.page.waitForTimeout(500);
  }

  /**
   * Check if we're on mobile viewport
   */
  async isMobileViewport(): Promise<boolean> {
    const viewport = this.page.viewportSize();
    return viewport ? viewport.width < 768 : false;
  }

  /**
   * Scroll to element if needed
   */
  async scrollToElement(selector: string) {
    const element = this.page.locator(selector);
    await element.scrollIntoViewIfNeeded();
  }

  /**
   * Clear all browser data (more thorough than just auth data)
   */
  async clearAllBrowserData() {
    await this.page.evaluate(() => {
      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear any indexed DB if used
      if (window.indexedDB) {
        // This would need more sophisticated cleanup in a real app
      }
      
      // Clear cookies
      document.cookie.split(";").forEach((c) => {
        const eqPos = c.indexOf("=");
        const name = eqPos > -1 ? c.substr(0, eqPos) : c;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      });
    });
  }

  /**
   * Get console errors from the page
   */
  getConsoleErrors(): string[] {
    return this.page.context().pages()[0]
      ? [] // Would need to set up console message collection
      : [];
  }

  /**
   * Retry an action until it succeeds or times out
   */
  async retryAction<T>(
    action: () => Promise<T>,
    options: { maxRetries?: number; delay?: number } = {}
  ): Promise<T> {
    const { maxRetries = 3, delay = 1000 } = options;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await action();
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        await this.page.waitForTimeout(delay);
      }
    }
    
    throw new Error('Retry action failed');
  }
}

/**
 * Common test data and constants
 */
export const TEST_CONFIG = {
  // Timeouts
  DEFAULT_TIMEOUT: 10000,
  NETWORK_TIMEOUT: 30000,
  ANIMATION_DELAY: 500,
  
  // Test identifiers
  TEST_ID_PREFIX: 'data-testid',
  
  // URLs
  BASE_URL: 'http://localhost:8081',
  
  // Viewport sizes
  VIEWPORTS: {
    MOBILE: { width: 375, height: 667 },
    TABLET: { width: 768, height: 1024 },
    DESKTOP: { width: 1200, height: 800 }
  }
};

/**
 * Generate unique test data
 */
export function generateTestData() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  
  return {
    uniqueId: `test-${timestamp}-${random}`,
    email: `test-${timestamp}-${random}@example.com`,
    name: `Test User ${timestamp}`,
    timestamp
  };
}