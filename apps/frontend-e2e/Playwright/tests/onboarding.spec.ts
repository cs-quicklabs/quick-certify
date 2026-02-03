import { test, registrationData, expect } from './Fixture';

/**
 * Test Case: UR10
 * Description: Verifies the Super Admin Registration
 * Elements Verified :
 * - User Registration with Valid data
 * - First Name field
 * - Last Name field
 * - Email field
 * - Issuer Name field
 * - Issuer Url field
 * - Password Field
 * - Confirm Password Field
 * - Create New User Button
 */

let registrationPage;
let randomDataGenerator;
let email: string;
let issuerUrl: string;
let issuerName: string;
let password: string;

test.beforeAll(async ({ randomDataGenerator }) => {
  email = randomDataGenerator.generateRandomEmail();
  issuerUrl = randomDataGenerator.generateRandomUrl();
  issuerName = randomDataGenerator.generateRandomName();
  if (!process.env.USER_PASS) {
    throw new Error('USER_PASS is not defined in environment variables');
  }
  password = process.env.USER_PASS;
});

test.beforeEach(async ({ registrationPage, loginPage: fixtureLoginPage }) => {
  const loginPage = fixtureLoginPage;
  await loginPage.openUrl();
  await registrationPage.clickOnSignupBtn();
});

test.describe('To validate the User Registration Functionality', () => {
  test.skip('UR101_To verify the functionality of user registration after entering all valid data', async () => {
    console.log(
      'Starting test: UR101_To verify the functionality of user registration after entering all valid data',
    );
    await registrationPage.fillRegistrationFormData(
      registrationData.validData.firstName,
      registrationData.validData.lastName,
      email,
      issuerName,
      issuerUrl,
      password,
      password,
    );
    await registrationPage.clickOnCreateNewUserBtn();
  });
  test('UR102_To verify the functionality of user registration after entering invalid first name', async () => {
    console.log(
      'Starting test: UR102_To verify the functionality of user registration after entering invalid first name',
    );
    await registrationPage.fillRegistrationFormData(
      registrationData.invalidData.firstName,
      registrationData.validData.lastName,
      email,
      issuerName,
      issuerUrl,
      password,
      password,
    );
    await registrationPage.clickOnCreateNewUserBtn();
  });

  test('UR103_To verify the functionality of user registration after entering invalid last name', async () => {
    console.log(
      'Starting test: UR103_To verify the functionality of user registration after entering invalid last name',
    );
    await registrationPage.fillRegistrationFormData(
      registrationData.validData.firstName,
      registrationData.invalidData.lastName,
      email,
      issuerName,
      issuerUrl,
      password,
      password,
    );
    await registrationPage.clickOnCreateNewUserBtn();
  });

  test.skip('UR104_To verify the functionality of user registration after leaving last name field blank', async () => {
    console.log(
      'Starting test: UR104_To verify the functionality of user registration after leaving last name field blank',
    );
    const email = randomDataGenerator.generateRandomEmail();
    const issuerUrl = randomDataGenerator.generateRandomUrl();
    const issuerName = randomDataGenerator.generateRandomName();
    await registrationPage.enterFirstName(registrationData.validData.firstName);
    await registrationPage.enterUserEmail(email);
    await registrationPage.enterIssuerName(issuerName);
    await registrationPage.enterIssuerWebsiteURL(issuerUrl);
    await registrationPage.enterPassword(password);
    await registrationPage.enterConfirmPassword(password);
    await registrationPage.clickOnCreateNewUserBtn();
  });

  test('UR105_To verify the functionality of user registration after entering existing email', async () => {
    console.log(
      'Starting test: UR105_To verify the functionality of user registration after entering existing email',
    );
    await registrationPage.fillRegistrationFormData(
      registrationData.validData.firstName,
      registrationData.validData.lastName,
      email,
      issuerName,
      issuerUrl,
      password,
      password,
    );
    await registrationPage.clickOnCreateNewUserBtn();
  });

  test('UR106_To verify the functionality of user registration after entering invalid email', async () => {
    console.log(
      'Starting test: UR106_To verify the functionality of user registration after entering invalid email',
    );
    await registrationPage.fillRegistrationFormData(
      registrationData.validData.firstName,
      registrationData.validData.lastName,
      registrationData.invalidData.email,
      issuerName,
      issuerUrl,
      password,
      password,
    );
    await registrationPage.clickOnCreateNewUserBtn();
  });

  test('UR107_To verify the functionality of user registration after entering existing issuer name', async () => {
    console.log(
      'Starting test: UR107_To verify the functionality of user registration after entering existing issuer name',
    );
    const email = randomDataGenerator.generateRandomEmail();
    await registrationPage.fillRegistrationFormData(
      registrationData.validData.firstName,
      registrationData.validData.lastName,
      email,
      issuerName,
      issuerUrl,
      password,
      password,
    );
    await registrationPage.clickOnCreateNewUserBtn();
  });

  test('UR108_To verify the functionality of user registration after entering existing issuer url', async () => {
    console.log(
      'Starting test: UR108_To verify the functionality of user registration after entering existing issuer url',
    );
    const email = randomDataGenerator.generateRandomEmail();
    const issuerName = randomDataGenerator.generateRandomName();
    await registrationPage.fillRegistrationFormData(
      registrationData.validData.firstName,
      registrationData.validData.lastName,
      email,
      issuerName,
      issuerUrl,
      password,
      password,
    );
    await registrationPage.clickOnCreateNewUserBtn();
  });

  test('UR109_To verify the functionality of user registration after entering invalid issuer url', async () => {
    console.log(
      'Starting test: UR109_To verify the functionality of user registration after entering invalid issuer url',
    );
    const email = randomDataGenerator.generateRandomEmail();
    const issuerName = randomDataGenerator.generateRandomName();
    await registrationPage.fillRegistrationFormData(
      registrationData.validData.firstName,
      registrationData.validData.lastName,
      email,
      issuerName,
      registrationData.invalidData.issuerURL,
      password,
      password,
    );
    await registrationPage.clickOnCreateNewUserBtn();
  });

  test('UR110_To verify the functionality of user registration after entering invalid password', async () => {
    console.log(
      'Starting test: UR110_To verify the functionality of user registration after entering invalid password',
    );
    const email = randomDataGenerator.generateRandomEmail();
    const issuerName = randomDataGenerator.generateRandomName();
    const issuerUrl = randomDataGenerator.generateRandomUrl();
    await registrationPage.fillRegistrationFormData(
      registrationData.validData.firstName,
      registrationData.validData.lastName,
      email,
      issuerName,
      issuerUrl,
      registrationData.invalidData.password,
      registrationData.invalidData.password,
    );
    await registrationPage.clickOnCreateNewUserBtn();
  });

  test('UR111_To verify the functionality of user registration after entering different confirm password', async () => {
    console.log(
      'Starting test: UR111_To verify the functionality of user registration after entering different confirm password',
    );
    const email = randomDataGenerator.generateRandomEmail();
    const issuerName = randomDataGenerator.generateRandomName();
    const issuerUrl = randomDataGenerator.generateRandomUrl();
    await registrationPage.fillRegistrationFormData(
      registrationData.validData.firstName,
      registrationData.validData.lastName,
      email,
      issuerName,
      issuerUrl,
      password,
      registrationData.invalidData.confirmPassword,
    );
    await registrationPage.clickOnCreateNewUserBtn();
  });
});
