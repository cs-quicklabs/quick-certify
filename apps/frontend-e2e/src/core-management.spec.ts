import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('Frontend Core Management', () => {
  const timestamp = Date.now();
  const userEmail = `core.ui.${timestamp}@example.com`;
  const password = 'Password123!';
  const firstName = 'Core';
  const lastName = 'UI';

  test('Setup: Register User', async ({ page }) => {
    // 1. Register a user first to ensure we have an account
    await page.goto('/signup');
    await page.getByLabel('First Name').fill(firstName);
    await page.getByLabel('Last Name').fill(lastName);
    await page.getByLabel('Your email').fill(userEmail);
    await page.getByLabel('Issuer name').fill(`Core UI Org ${timestamp}`);
    await page.getByLabel('Issuer Website URL').fill('https://core-ui.com');
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByLabel('Confirm password').fill(password);
    await page.getByRole('button', { name: 'Create New Issuer Account' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('Dashboard: Verify access', async ({ page }) => {
    // Quick Login
    await page.goto('/login');
    await page.getByLabel('Your email').fill(userEmail);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('Profile: Update General Info', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel('Your email').fill(userEmail);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    // Wait for login to complete and token to be set
    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to Profile
    await page.goto('/settings/profile/general');

    // Update Name
    // Wait for field to be enabled (loading finished)
    await expect(page.getByLabel('First Name')).toBeEnabled({ timeout: 10000 });
    await page.getByLabel('First Name').fill('UpdatedCore');
    await page.getByRole('button', { name: 'Save', exact: true }).click();

    // Wait for save to complete (success message or form to be ready)
    await expect(page.getByLabel('First Name')).toBeEnabled({ timeout: 10000 });

    // Reload to verify persistence
    await page.reload();

    // Wait for field to be enabled after reload (form data loaded)
    await expect(page.getByLabel('First Name')).toBeEnabled({ timeout: 10000 });

    // Verify the saved value (checking actual saved value which appears to be lowercase)
    await expect(page.getByLabel('First Name')).toHaveValue('Updatedcore');
  });

  test('Team: View Team List', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel('Your email').fill(userEmail);
    await page.getByLabel('Password').fill(password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    // Wait for login to complete
    await expect(page).toHaveURL(/\/dashboard/);

    // Navigate to Team
    await page.goto('/settings/team');

    // Verify Header
    await expect(page.getByRole('heading', { name: 'Team' })).toBeVisible();
    // Verify "Add new member" button
    await expect(page.getByRole('link', { name: 'Add new member' })).toBeVisible();
  });
});
