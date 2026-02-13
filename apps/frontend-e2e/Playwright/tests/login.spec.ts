import { test, loginData } from './Fixture';

/**
 * Test Case: L10
 * Description: Verifies the complete flow for the Login Functionality
 * Elements Verified :
 * - Valid Login
 * - Invalid Login
 * - Blank Login
 * - Password Eye Icon
 * - Login Button
 */

let loginPage;

test.beforeEach(async ({ loginPage: fixtureLoginPage }) => {
  loginPage = fixtureLoginPage;
  await loginPage.openUrl();
});

test.describe('To validate the Login Functionality', () => {
  test('L101_To verify the functionality of user Login after entering valid email and password', async () => {
    console.log(
      'Starting test: L101_To verify the functionality of user Login after entering valid email and password',
    );
    const userName = process.env.USER_EMAIL;
    const password = process.env.USER_PASS;

    if (!userName || !password) {
      throw new Error('USER_EMAIL / USER_PASS must be set for authenticated E2E tests');
    }

    await loginPage.enterUserEmail(userName);
    await loginPage.enterPassword(password);
    await loginPage.validateUserLogin();
  });

  test('L102_To verify the functionality of user Login after entering the unregistered email and valid password', async () => {
    console.log(
      'Starting test: L102_To verify the functionality of user Login after entering the unregistered email and valid password',
    );
    const password = process.env.USER_PASS;

    if (!password) {
      throw new Error('USER_PASS must be set for authenticated E2E tests');
    }

    await loginPage.enterUserEmail(loginData.formData.unregisteredEmail);
    await loginPage.enterPassword(password);
    await loginPage.clickOnSigninBtn();
    await loginPage.validateAlertMessage(loginData.expectedMessages.invalidLoginErrorMsg);
  });

  test('L103_To verify the functionality of user Login after leaving email field blank', async () => {
    console.log(
      'Starting test: L103_To verify the functionality of user Login after leaving email field blank',
    );
    const password = process.env.USER_PASS;

    if (!password) {
      throw new Error('USER_PASS must be set for authenticated E2E tests');
    }

    await loginPage.enterPassword(password);
    await loginPage.clickOnSigninBtn();
    await loginPage.validateEmailFieldError(loginData.expectedMessages.blankEmailErrorMsg);
  });

  test('L104_To verify the functionality of user Login after entering the valid email and invalid password', async () => {
    console.log(
      'Starting test: L104_To verify the functionality of user Login after entering the valid email and invalid password',
    );
    const userName = process.env.USER_EMAIL;

    if (!userName) {
      throw new Error('USER_EMAIL must be set for authenticated E2E tests');
    }

    await loginPage.enterUserEmail(userName);
    await loginPage.enterPassword(loginData.formData.invalidPassword);
    await loginPage.clickOnSigninBtn();
    await loginPage.validateAlertMessage(loginData.expectedMessages.invalidLoginErrorMsg);
  });

  test('L105_To verify the functionality of user Login after entering less than 6 digit password', async () => {
    console.log(
      'Starting test: L105_To verify the functionality of user Login after entering less than 6 digit password',
    );
    const userName = process.env.USER_EMAIL;

    if (!userName) {
      throw new Error('USER_EMAIL must be set for authenticated E2E tests');
    }

    await loginPage.enterUserEmail(userName);
    await loginPage.enterPassword(loginData.formData.lessDigitPassword);
    await loginPage.clickOnSigninBtn();
    await loginPage.validatePasswordFieldError(
      loginData.expectedMessages.lessDigitPasswordErrorMsg,
    );
  });

  test('L106_To verify the functionality of user Login after leaving password field blank', async () => {
    console.log(
      'Starting test: L106_To verify the functionality of user Login after entering less digit password',
    );
    const userName = process.env.USER_EMAIL;

    if (!userName) {
      throw new Error('USER_EMAIL must be set for authenticated E2E tests');
    }

    await loginPage.enterUserEmail(userName);
    await loginPage.clickOnSigninBtn();
    await loginPage.validatePasswordFieldError(loginData.expectedMessages.blankPasswordErrorMsg);
  });

  test('L107_To verify the functionality of user Login after leaving email and password field blank', async () => {
    console.log(
      'Starting test: L107_To verify the functionality of user Login after leaving email and password field blank',
    );
    await loginPage.clickOnSigninBtn();
    await loginPage.validateEmailFieldError(loginData.expectedMessages.blankEmailErrorMsg);
    await loginPage.validatePasswordFieldError(loginData.expectedMessages.blankPasswordErrorMsg);
  });

  test('L108_To verify the functionality of Eye icon in password field after enabling it', async () => {
    console.log(
      'Starting test: L108_To verify the functionality of Eye icon in password field after enabling it',
    );
    const password = process.env.USER_PASS;

    if (!password) {
      throw new Error('USER_PASS must be set for authenticated E2E tests');
    }

    await loginPage.enterPassword(password);
    await loginPage.clickOnEyeIcon();
    await loginPage.validateEyeIconEnabling();
  });

  test('L109_To verify the functionality of Eye icon in password field after disabling it', async () => {
    console.log(
      'Starting test: L109_To verify the functionality of Eye icon in password field after disabling it',
    );
    const password = process.env.USER_PASS;

    if (!password) {
      throw new Error('USER_PASS must be set for authenticated E2E tests');
    }

    await loginPage.enterPassword(password);
    await loginPage.validatePasswordEncryption();
  });
});
