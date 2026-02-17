import { test, registrationData } from './Fixture';

/** Test Case: UR10
 * Description: Verifies the Super Admin Registration * Elements Verified :
 * User Registration with Valid data
 * First Name field
 * Last Name field
 * Email field
 * Issuer Name field
 * Issuer Url field
 * Password Field
 * Confirm Password Field
 * Create New User Button
 * */

let email: string;
let issuerUrl: string;
let issuerName: string;
let password: string;

test.describe('Validate Registration Form', () => {
  test.beforeAll(async ({ randomDataGenerator }) => {
    email = randomDataGenerator.generateRandomEmail();
    issuerUrl = randomDataGenerator.generateRandomUrl();
    issuerName = randomDataGenerator.generateRandomName();

    if (!process.env.USER_PASS) {
      throw new Error('USER_PASS is not defined in environment variables');
    }
    password = process.env.USER_PASS;
  });

  test.beforeEach(async ({ loginPage, registrationPage }) => {
    await loginPage.openUrl();
    await registrationPage.clickOnSignupBtn();
  });

  test.describe('Valid Registration', () => {
    test('UR101_Verify: Registration with valid data', async ({ registrationPage }) => {
      console.log('Starting test: UR101_Verify : Registration with valid data');
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.validFirstName,
        registrationData.globalValue.validLastName,
        email,
        issuerName,
        issuerUrl,
        password,
        password,
      );
      await registrationPage.validateUserRegistration();
    });

    test('UR102_Verify: Registration after leaving last name field blank', async ({
      registrationPage,
    }) => {
      console.log('Starting test: UR102_Verify : Registration after leaving last name field blank');
      await registrationPage.enterFirstName(registrationData.globalValue.validFirstName);
      await registrationPage.enterUserEmail(email);
      await registrationPage.enterIssuerName(issuerName);
      await registrationPage.enterIssuerWebsiteURL(issuerUrl);
      await registrationPage.enterPassword(password);
      await registrationPage.enterConfirmPassword(password);
      await registrationPage.clickOnCreateNewUserBtn();
    });
  });
  test.describe('First Name field validation Test', () => {
    test('UR103_Verify: Numerical value validation', async ({ registrationPage }) => {
      console.log('Starting test: UR103_Verify: Numerical value validation in First Name field');
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.numericalValue,
        registrationData.globalValue.validLastName,
        email,
        issuerName,
        issuerUrl,
        password,
        password,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateFieldErrors(
        registrationData.registrationFields.firstName,
        registrationData.fieldErrors.firstName.invalid,
      );
    });
    test('UR104_Verify: Special character value validation', async ({ registrationPage }) => {
      console.log(
        'Starting test: UR104_Verify: Special character value validation in First Name field',
      );
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.specialCharacterValue,
        registrationData.globalValue.validLastName,
        email,
        issuerName,
        issuerUrl,
        password,
        password,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateFieldErrors(
        registrationData.registrationFields.firstName,
        registrationData.fieldErrors.firstName.invalid,
      );
    });
    test('UR105_Verify: Less than 2 character validation', async ({ registrationPage }) => {
      console.log('Starting test: UR105_Verify less than 2 character validation');
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.lessCharacterValue,
        registrationData.globalValue.validLastName,
        email,
        issuerName,
        issuerUrl,
        password,
        password,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateFieldErrors(
        registrationData.registrationFields.firstName,
        registrationData.fieldErrors.firstName.tooShort,
      );
    });

    test.fixme('UR106_Verify: More than 50 character validation', async ({ registrationPage }) => {
      console.log('Starting test: UR106_Verify: More than 50 character validation');
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.maxCharacterValue,
        registrationData.globalValue.validLastName,
        email,
        issuerName,
        issuerUrl,
        password,
        password,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateFieldErrors(
        registrationData.registrationFields.firstName,
        registrationData.fieldErrors.firstName.tooLong,
      );
    });
    test('UR107_Verify: Mandatory Field validation', async ({ registrationPage }) => {
      console.log('Starting test: UR107_Verify: Mandatory Field validation');
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.blankValue,
        registrationData.globalValue.validLastName,
        email,
        issuerName,
        issuerUrl,
        password,
        password,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateFieldErrors(
        registrationData.registrationFields.firstName,
        registrationData.fieldErrors.firstName.required,
      );
    });
  });
  test.describe('Last Name field validation Test', () => {
    test('UR108_Verify: Numerical value validation', async ({ registrationPage }) => {
      console.log('Starting test: UR108_Verify: Numerical value validation');
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.validFirstName,
        registrationData.globalValue.numericalValue,
        email,
        issuerName,
        issuerUrl,
        password,
        password,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateFieldErrors(
        registrationData.registrationFields.lastName,
        registrationData.fieldErrors.lastName.invalid,
      );
    });
    test('UR109_Verify: Special Character validation', async ({ registrationPage }) => {
      console.log('Starting test: UR109_Verify: Special Character validation');
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.validFirstName,
        registrationData.globalValue.specialCharacterValue,
        email,
        issuerName,
        issuerUrl,
        password,
        password,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateFieldErrors(
        registrationData.registrationFields.lastName,
        registrationData.fieldErrors.lastName.invalid,
      );
    });
    test.fixme('UR110_Verify: More than 50 character validation', async ({ registrationPage }) => {
      console.log('Starting test: UR110_Verify: More than 50 character validation');
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.validFirstName,
        registrationData.globalValue.maxCharacterValue,
        email,
        issuerName,
        issuerUrl,
        password,
        password,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateFieldErrors(
        registrationData.registrationFields.lastName,
        registrationData.fieldErrors.lastName.tooLong,
      );
    });
  });

  test.describe('Email field validation Test', () => {
    test('UR111_Verify: Existing Email validation', async ({ registrationPage }) => {
      console.log('Starting test: UR111_Verify: Existing Email validation');
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.validFirstName,
        registrationData.globalValue.validLastName,
        email,
        issuerName,
        issuerUrl,
        password,
        password,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateAlertMessages(
        registrationData.fieldErrors.email.exists,
        registrationData.httpCodes.conflict,
      );
    });

    test('UR112_Verify: Invalid Email validation', async ({ registrationPage }) => {
      console.log('Starting test: UR112_Verify: Invalid Email validation');
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.validFirstName,
        registrationData.globalValue.validLastName,
        registrationData.globalValue.invalidEmailValue,
        issuerName,
        issuerUrl,
        password,
        password,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateFieldErrors(
        registrationData.registrationFields.email,
        registrationData.fieldErrors.email.invalid,
      );
    });
    test('UR113_Verify: Mandatory Field validation', async ({ registrationPage }) => {
      console.log('Starting test: UR113_Verify: Mandatory Field validation');
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.validFirstName,
        registrationData.globalValue.validLastName,
        registrationData.globalValue.blankValue,
        issuerName,
        issuerUrl,
        password,
        password,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateFieldErrors(
        registrationData.registrationFields.email,
        registrationData.fieldErrors.email.required,
      );
    });
  });

  test.describe('Issuer Name validation Test', () => {
    test('UR114_Verify: Existing Issuer Name validation', async ({
      registrationPage,
      randomDataGenerator,
    }) => {
      console.log('Starting test: UR114_Verify: Existing Issuer Name validation');
      const newEmail = randomDataGenerator.generateRandomEmail();
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.validFirstName,
        registrationData.globalValue.validLastName,
        newEmail,
        issuerName,
        issuerUrl,
        password,
        password,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateAlertMessages(
        registrationData.fieldErrors.issuerName.exists,
        registrationData.httpCodes.conflict,
      );
    });

    test('UR115_Verify: Less than 2 character validation', async ({ registrationPage }) => {
      console.log('Starting test: UR115_Verify: Less than 2 character validation');
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.validFirstName,
        registrationData.globalValue.validLastName,
        email,
        registrationData.globalValue.lessCharacterValue,
        issuerUrl,
        password,
        password,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateFieldErrors(
        registrationData.registrationFields.issuerName,
        registrationData.fieldErrors.issuerName.tooShort,
      );
    });

    test.fixme('UR116_Verify: More than 50 character validation', async ({ registrationPage }) => {
      console.log('Starting test: UR116_Verify: More than 50 character validation');
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.validFirstName,
        registrationData.globalValue.validLastName,
        email,
        registrationData.globalValue.maxCharacterValue,
        issuerUrl,
        password,
        password,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateFieldErrors(
        registrationData.registrationFields.issuerName,
        registrationData.fieldErrors.issuerName.tooLong,
      );
    });

    test('UR117_Verify: Mandatory field validation', async ({ registrationPage }) => {
      console.log('Starting test: UR117_Verify: Mandatory field validation');
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.validFirstName,
        registrationData.globalValue.validLastName,
        email,
        registrationData.globalValue.blankValue,
        issuerUrl,
        password,
        password,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateFieldErrors(
        registrationData.registrationFields.issuerName,
        registrationData.fieldErrors.issuerName.required,
      );
    });
  });

  test.describe('Issuer URL validation Test', () => {
    test('UR118_Verify: Existing Issuer URL validation', async ({
      registrationPage,
      randomDataGenerator,
    }) => {
      console.log('Starting test: UR118_Verify: Existing Issuer URL validation');
      const newEmail = randomDataGenerator.generateRandomEmail();
      const newIssuerName = randomDataGenerator.generateRandomName();
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.validFirstName,
        registrationData.globalValue.validLastName,
        newEmail,
        newIssuerName,
        issuerUrl,
        password,
        password,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateAlertMessages(
        registrationData.fieldErrors.issuerWebsite.exists,
        registrationData.httpCodes.conflict,
      );
    });

    test('UR119_Verify: Invalid URL validation', async ({
      registrationPage,
      randomDataGenerator,
    }) => {
      console.log('Starting test: UR119_Verify: Invalid URL validation');
      const newEmail = randomDataGenerator.generateRandomEmail();
      const newIssuerName = randomDataGenerator.generateRandomName();
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.validFirstName,
        registrationData.globalValue.validLastName,
        newEmail,
        newIssuerName,
        registrationData.globalValue.invalidURL,
        password,
        password,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateAlertMessages(
        registrationData.fieldErrors.issuerWebsite.invalidUrl,
        registrationData.httpCodes.unprocessableContent,
      );
    });

    test('UR120_Verify: Mandatory Field validation', async ({
      registrationPage,
      randomDataGenerator,
    }) => {
      console.log('Starting test: UR120_Verify: Mandatory Field validation');
      const newEmail = randomDataGenerator.generateRandomEmail();
      const newIssuerName = randomDataGenerator.generateRandomName();
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.validFirstName,
        registrationData.globalValue.validLastName,
        newEmail,
        newIssuerName,
        registrationData.globalValue.blankValue,
        password,
        password,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateFieldErrors(
        registrationData.registrationFields.issuerWebsite,
        registrationData.fieldErrors.issuerWebsite.required,
      );
    });
  });

  test.describe('Password & Confirm field validation Test', () => {
    test('UR121_Verify: Upper case validation', async ({
      registrationPage,
      randomDataGenerator,
    }) => {
      console.log('Starting test: UR121_Verify: Upper case validation');
      const newEmail = randomDataGenerator.generateRandomEmail();
      const newIssuerName = randomDataGenerator.generateRandomName();
      const newIssuerUrl = randomDataGenerator.generateRandomUrl();
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.validFirstName,
        registrationData.globalValue.validLastName,
        newEmail,
        newIssuerName,
        newIssuerUrl,
        registrationData.passwordValues.noUpperCaseValue,
        registrationData.passwordValues.noUpperCaseValue,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateFieldErrors(
        registrationData.registrationFields.password,
        registrationData.fieldErrors.password.noUpperCase,
      );
    });

    test('UR122_Verify: Less than 8 password value validation', async ({
      registrationPage,
      randomDataGenerator,
    }) => {
      console.log('Starting test: UR122_Verify: Less than 8 password value validation');
      const newEmail = randomDataGenerator.generateRandomEmail();
      const newIssuerName = randomDataGenerator.generateRandomName();
      const newIssuerUrl = randomDataGenerator.generateRandomUrl();
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.validFirstName,
        registrationData.globalValue.validLastName,
        newEmail,
        newIssuerName,
        newIssuerUrl,
        registrationData.globalValue.lessCharacterValue,
        registrationData.globalValue.lessCharacterValue,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateFieldErrors(
        registrationData.registrationFields.password,
        registrationData.fieldErrors.password.tooShort,
      );
    });

    test('UR123_Verify: Special character value validation', async ({
      registrationPage,
      randomDataGenerator,
    }) => {
      console.log('Starting test: UR123_Verify: Special character value validation');
      const newEmail = randomDataGenerator.generateRandomEmail();
      const newIssuerName = randomDataGenerator.generateRandomName();
      const newIssuerUrl = randomDataGenerator.generateRandomUrl();
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.validFirstName,
        registrationData.globalValue.validLastName,
        newEmail,
        newIssuerName,
        newIssuerUrl,
        registrationData.passwordValues.alphaNumericalValue,
        registrationData.passwordValues.alphaNumericalValue,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateAlertMessages(
        registrationData.fieldErrors.password.noSpecial,
        registrationData.httpCodes.unprocessableContent,
      );
    });

    test('UR124_Verify: Numerical value validation', async ({
      registrationPage,
      randomDataGenerator,
    }) => {
      console.log('Starting test: UR124_Verify: Numerical value validation');
      const newEmail = randomDataGenerator.generateRandomEmail();
      const newIssuerName = randomDataGenerator.generateRandomName();
      const newIssuerUrl = randomDataGenerator.generateRandomUrl();
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.validFirstName,
        registrationData.globalValue.validLastName,
        newEmail,
        newIssuerName,
        newIssuerUrl,
        registrationData.passwordValues.noNumbericalValue,
        registrationData.passwordValues.noNumbericalValue,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateFieldErrors(
        registrationData.registrationFields.password,
        registrationData.fieldErrors.password.noNumerical,
      );
    });

    test('UR125_Verify: Lower case validation', async ({
      registrationPage,
      randomDataGenerator,
    }) => {
      console.log('Starting test: UR125_Verify: Lower case validation');
      const newEmail = randomDataGenerator.generateRandomEmail();
      const newIssuerName = randomDataGenerator.generateRandomName();
      const newIssuerUrl = randomDataGenerator.generateRandomUrl();
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.validFirstName,
        registrationData.globalValue.validLastName,
        newEmail,
        newIssuerName,
        newIssuerUrl,
        registrationData.passwordValues.noLowerCaseValue,
        registrationData.passwordValues.noLowerCaseValue,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateFieldErrors(
        registrationData.registrationFields.password,
        registrationData.fieldErrors.password.noLowerCase,
      );
    });

    test('UR126_Verify: Mandatory Field validation', async ({
      registrationPage,
      randomDataGenerator,
    }) => {
      console.log('Starting test: UR126_Verify: Mandatory Field validation');
      const newEmail = randomDataGenerator.generateRandomEmail();
      const newIssuerName = randomDataGenerator.generateRandomName();
      const newIssuerUrl = randomDataGenerator.generateRandomUrl();
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.validFirstName,
        registrationData.globalValue.validLastName,
        newEmail,
        newIssuerName,
        newIssuerUrl,
        registrationData.globalValue.blankValue,
        registrationData.passwordValues.noLowerCaseValue,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateFieldErrors(
        registrationData.registrationFields.password,
        registrationData.fieldErrors.password.required,
      );
    });

    test.fixme('UR127_Verify: More than 50 character validation', async ({
      registrationPage,
      randomDataGenerator,
    }) => {
      console.log('Starting test: UR127_Verify: More than 50 character validation');
      const newEmail = randomDataGenerator.generateRandomEmail();
      const newIssuerName = randomDataGenerator.generateRandomName();
      const newIssuerUrl = randomDataGenerator.generateRandomUrl();
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.validFirstName,
        registrationData.globalValue.validLastName,
        newEmail,
        newIssuerName,
        newIssuerUrl,
        registrationData.globalValue.maxCharacterValue,
        registrationData.globalValue.maxCharacterValue,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateFieldErrors(
        registrationData.registrationFields.password,
        registrationData.fieldErrors.password.tooLong,
      );
    });

    test('UR128_Verify: Mandatory confirm password field validation', async ({
      registrationPage,
      randomDataGenerator,
    }) => {
      console.log('Starting test: UR128_Verify: Mandatory confirm password field validation');
      const newEmail = randomDataGenerator.generateRandomEmail();
      const newIssuerName = randomDataGenerator.generateRandomName();
      const newIssuerUrl = randomDataGenerator.generateRandomUrl();
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.validFirstName,
        registrationData.globalValue.validLastName,
        newEmail,
        newIssuerName,
        newIssuerUrl,
        password,
        registrationData.globalValue.blankValue,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateFieldErrors(
        registrationData.registrationFields.confirmPassword,
        registrationData.fieldErrors.password.confirmRequired,
      );
    });

    test('UR129_Verify: Password Mismatch validation', async ({
      registrationPage,
      randomDataGenerator,
    }) => {
      console.log('Starting test: UR129_Verify: Password Mismatch validation');
      const newEmail = randomDataGenerator.generateRandomEmail();
      const newIssuerName = randomDataGenerator.generateRandomName();
      const newIssuerUrl = randomDataGenerator.generateRandomUrl();
      await registrationPage.fillRegistrationFormData(
        registrationData.globalValue.validFirstName,
        registrationData.globalValue.validLastName,
        newEmail,
        newIssuerName,
        newIssuerUrl,
        password,
        registrationData.globalValue.numericalValue,
      );
      await registrationPage.clickOnCreateNewUserBtn();
      await registrationPage.validateFieldErrors(
        registrationData.registrationFields.confirmPassword,
        registrationData.fieldErrors.password.mismatch,
      );
    });
  });
});
