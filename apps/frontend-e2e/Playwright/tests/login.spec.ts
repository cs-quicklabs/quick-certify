import { test, registrationData, expect } from './Fixture';

/**
 * Test Case: UR10
 * Description: Verifies the Super Admin Login
 * Elements Verified :
 * email Field
 * password Field
 * -
 */

// test.beforeEach(async ({ registrationPage, loginPage: fixtureLoginPage }) => {
//     const loginPage = fixtureLoginPage;
//     await loginPage.openUrl();

// });
test.only('Verify user is already logged in via global setup', async ({ page }) => {
    await page.goto('/dashboard');
    // protected route

});