import { test, expect } from '@playwright/test';

test.describe.configure({ mode: 'serial' });

test.describe('Frontend Onboarding', () => {
    const timestamp = Date.now();
    const userEmail = `frontend.user.${timestamp}@example.com`;
    const password = 'Password123!';

    test('Signup: Register a new user', async ({ page }) => {
        await page.goto('/signup');

        // Fill form
        await page.getByLabel('First Name').fill('Frontend');
        await page.getByLabel('Last Name').fill('User');
        await page.getByLabel('Your email').fill(userEmail);
        await page.getByLabel('Issuer name').fill(`Issuer ${timestamp}`);
        await page.getByLabel('Issuer Website URL').fill('https://example.com');

        // Password fields might have same label if not exact, but 'Confirm password' is distinct.
        // Using distinct labels/placeholders if labels are ambiguous.
        // 'Password' vs 'Confirm password'
        await page.getByLabel('Password', { exact: true }).fill(password);
        await page.getByLabel('Confirm password').fill(password);

        // Submit
        await page.getByRole('button', { name: 'Create New Issuer Account' }).click();

        // Expect redirect to dashboard
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('Login: Sign in with registered user', async ({ page }) => {
        await page.goto('/login');

        await page.getByLabel('Your email').fill(userEmail);
        await page.getByLabel('Password').fill(password);

        await page.getByRole('button', { name: 'Sign in', exact: true }).click();

        await expect(page).toHaveURL(/\/dashboard/);
    });
});
