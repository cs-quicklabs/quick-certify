import { chromium, FullConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function globalTeardown(config: FullConfig) {
  const authFile = path.resolve(__dirname, 'auth.json');
  const baseURL = process.env.BASE_URL;
  const fs = await import('fs');

  // Only navigate to dashboard if auth file exists (user was authenticated)
  if (!baseURL || !fs.existsSync(authFile)) {
    return;
  }

  try {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      baseURL,
      storageState: authFile, // Use stored authentication
    });

    const page = await context.newPage();
    
    // Navigate to dashboard after all tests complete
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Save the updated state (in case any cookies/session data changed)
    await context.storageState({ path: authFile });
    
    await browser.close();
  } catch (error) {
    // Silently fail if auth file doesn't exist or navigation fails
    // This is expected for login tests that don't use auth.json
    console.log('Global teardown: Could not navigate to dashboard (this is expected for login tests)');
  }
}

export default globalTeardown;
