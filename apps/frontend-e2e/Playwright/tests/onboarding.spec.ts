import { test, registrationData, expect } from './Fixture';

/**
 * Test Case: UR10
 * Description: Verifies the Super Admin Registration
 * Elements Verified :
 * - First Name Field
 * - Last Name Field
 * - Issuer URL Field
 * - Password Field
 * - Confirm Password Field
 * - Create New User Button
 * -
 */

test.beforeEach(async ({ registrationPage, loginPage: fixtureLoginPage }) => {
  const loginPage = fixtureLoginPage;
  await loginPage.openUrl();
  await registrationPage.clickOnSignupBtn();
});

test.describe('To validate the User Registration Functionality', () => {
  test('Setup: Register User', async ({ registrationPage }) => {
    await registrationPage.enterRegistrationFormData(
      registrationData.firstName,
      registrationData.lastName,
      registrationData.issuerURL,
      registrationData.password,
      registrationData.confirmPassword,
    );
    await registrationPage.clickOnCreateNewUserBtn();
  });
});
