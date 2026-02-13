import path from 'path';
import { chromium, FullConfig } from '@playwright/test';
import { LoginPage } from './Playwright/pageobjects/LoginPage';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '.env') });

async function globalSetup(config: FullConfig) {
  const authFile = path.resolve(__dirname, 'auth.json');

  const email = process.env.USER_EMAIL ?? '';
  const password = process.env.USER_PASS ?? '';
  const baseURL = process.env.BASE_URL;

  if (!email || !password) {
    throw new Error('USER_EMAIL or USER_PASSWORD is not defined');
  }

  if (!baseURL) {
    throw new Error('BASE_URL is not defined');
  }

  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    baseURL, // ✅ CRITICAL
  });

  const page = await context.newPage();

  const loginPage = new LoginPage(page);
  await loginPage.login(email, password);

  // Wait for navigation to dashboard after login
  await page.waitForURL(/\/(dashboard|settings)/, { timeout: 20000 });
  
  // Navigate to dashboard to ensure session is established
  await page.goto('/dashboard');
  await page.waitForLoadState('networkidle');

  // Save authentication state
  await context.storageState({ path: authFile });
  await browser.close();
}

export default globalSetup;
