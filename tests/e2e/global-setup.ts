import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🧪 Setting up e2e test environment...');
  
  // Wait for the dev server to be ready
  // The webServer config in playwright.config.ts will handle starting the server
  
  // You could add additional setup here like:
  // - Database migrations
  // - Test data seeding
  // - Environment variable validation
  
  console.log('✅ Test environment setup complete');
}

export default globalSetup;