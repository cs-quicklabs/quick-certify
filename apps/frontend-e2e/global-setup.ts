import fs from 'fs';
import path from 'path';
import { chromium, FullConfig } from '@playwright/test';
import { LoginPage } from './Playwright/pageobjects/LoginPage';

import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function globalSetup(config: FullConfig) {
  const authFile = path.resolve(__dirname, 'auth.json');
  const forceRefresh = process.env.FORCE_AUTH === 'true';

  // If auth.json exists and not forcing refresh, skip login
  if (!forceRefresh && fs.existsSync(authFile)) {
    const stats = fs.statSync(authFile);
    if (stats.size > 0) {
      console.log(
        `Found existing auth.json at ${authFile} (size: ${stats.size} bytes). Skipping login.`,
      );
      return;
    } else {
      console.log(`auth.json exists but is empty — will re-login and overwrite.`);
    }
  } else if (!forceRefresh) {
    console.log(`auth.json not found at ${authFile}. Will perform login and create it.`);
  } else {
    console.log(`FORCE_AUTH=true — performing login to refresh auth.json.`);
  }

  // Credentials from environment variables
  const email = process.env.USER_EMAIL ?? '';
  const password = process.env.PASSWORD ?? '';

  if (!email || !password) {
    throw new Error('USER_EMAIL or USER_PASSWORD is not defined in the environment variables.');
  }

  // Launch browser, do login flow, save storageState
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const loginPage = new LoginPage(page);
  await loginPage.login(email, password);

  try {
    await page.waitForSelector('text=Logout', { timeout: 10_000 });
  } catch (err) {
    console.warn(
      'Login did not show expected logged-in indicator — continuing to save storage state anyway.',
    );
  }

  // Save authenticated state
  await context.storageState({ path: authFile });
  console.log(`Saved authenticated storage state to ${authFile}`);

  await browser.close();
}

export default globalSetup;
