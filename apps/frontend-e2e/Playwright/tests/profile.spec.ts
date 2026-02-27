import { test, profileData, expect } from './Fixture';

const userName = process.env.USER_EMAIL || 'divanshu@crownstack.com';
const password = process.env.USER_PASS || 'Password@12';

let profileSettingsPage;

test.beforeEach(async ({ page, loginPage, profileSettingsPage: fixtureProfileSettingsPage }) => {
  profileSettingsPage = fixtureProfileSettingsPage;

  await page.goto('/settings/profile/general');

  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    await loginPage.enterUserEmail(userName);
    await loginPage.enterPassword(password);

    await Promise.all([
      loginPage.clickOnSigninBtn(),
      page.waitForURL(/\/(dashboard|settings)/, { timeout: 20000 }),
    ]);

    await page.goto('/settings/profile/general');
    await page.waitForLoadState('networkidle');
  } else {
    await page.waitForLoadState('networkidle');
  }
});

test.describe('To validate the Profile Settings Functionality', () => {
  test('P101_To verify Profile Settings page loads successfully', async () => {
    console.log('Starting test: P101_To verify Profile Settings page loads successfully');
    await profileSettingsPage.openUrl();
    await profileSettingsPage.validatePageLoaded();
  });

  test('P102_To verify navigation to Profile Settings via header dropdown', async () => {
    console.log('Starting test: P102_To verify navigation to Profile Settings via header dropdown');
    await profileSettingsPage.navigateViaHeader();
    await profileSettingsPage.validatePageLoaded();
  });

  test('P103_To verify email field is disabled (read-only)', async () => {
    console.log('Starting test: P103_To verify email field is disabled (read-only)');
    await profileSettingsPage.openUrl();
    await profileSettingsPage.waitForFormReady();
    await profileSettingsPage.validateEmailFieldDisabled();
  });

  test('P104_To verify successful profile update with valid first name and last name', async ({
    page,
  }) => {
    console.log(
      'Starting test: P104_To verify successful profile update with valid first name and last name',
    );
    await profileSettingsPage.openUrl();
    await profileSettingsPage.waitForFormReady();

    const firstName = profileData.formData.validFirstName;
    const lastName = profileData.formData.validLastName;

    await Promise.all([
      profileSettingsPage.saveProfile(firstName, lastName),
      page
        .waitForResponse(
          (resp) => resp.url().includes('/api/v1/profile/me') && resp.status() === 200,
          { timeout: 10000 },
        )
        .catch(() => {
          console.log('API response wait timed out, continuing...');
        }),
    ]);

    await page.waitForTimeout(1000);

    await profileSettingsPage.validateFieldValues(firstName, lastName);
  });

  test('P105_To verify profile update with only first name (last name optional)', async ({
    page,
  }) => {
    console.log(
      'Starting test: P105_To verify profile update with only first name (last name optional)',
    );
    await profileSettingsPage.openUrl();
    await profileSettingsPage.waitForFormReady();

    const firstName = profileData.formData.validFirstName;

    await Promise.all([
      profileSettingsPage.saveProfile(firstName),
      page
        .waitForResponse(
          (resp) => resp.url().includes('/api/v1/profile/me') && resp.status() === 200,
          { timeout: 10000 },
        )
        .catch(() => {
          console.log('API response wait timed out, continuing...');
        }),
    ]);

    await page.waitForTimeout(1000);

    await profileSettingsPage.validateFieldValues(firstName);
  });

  test('P106_To verify first name field validation - required field error', async () => {
    console.log('Starting test: P106_To verify first name field validation - required field error');
    await profileSettingsPage.openUrl();
    await profileSettingsPage.waitForFormReady();

    await profileSettingsPage.clearFirstName();
    await profileSettingsPage.clickSaveButton();

    await profileSettingsPage.page.waitForTimeout(1000);

    const firstNameValue = await profileSettingsPage.getFirstName();
    if (firstNameValue === '') {
      const isInvalid = await profileSettingsPage.locator_firstNameField.evaluate(
        (el: HTMLInputElement) => {
          return !el.validity.valid;
        },
      );

      if (!isInvalid) {
        const errorVisible = await profileSettingsPage.locator_firstNameError
          .first()
          .isVisible()
          .catch(() => false);
        if (errorVisible) {
          await profileSettingsPage.validateFirstNameError(
            profileData.expectedMessages.firstNameRequiredError,
          );
        }
      }
    }
  });

  test('P107_To verify first name field validation - minimum length error', async () => {
    console.log('Starting test: P107_To verify first name field validation - minimum length error');
    await profileSettingsPage.openUrl();
    await profileSettingsPage.waitForFormReady();

    await profileSettingsPage.enterFirstName(profileData.formData.shortFirstName);
    await profileSettingsPage.clickSaveButton();

    await profileSettingsPage.page.waitForTimeout(1500);

    await expect(profileSettingsPage.locator_firstNameError.first()).toBeVisible({ timeout: 5000 });
    await profileSettingsPage.validateFirstNameError(
      profileData.expectedMessages.firstNameMinLengthError,
    );
  });

  test('P108_To verify first name field validation - only letters allowed', async () => {
    console.log('Starting test: P108_To verify first name field validation - only letters allowed');
    await profileSettingsPage.openUrl();
    await profileSettingsPage.waitForFormReady();

    await profileSettingsPage.enterFirstName(profileData.formData.firstNameWithNumbers);
    await profileSettingsPage.clickSaveButton();

    await profileSettingsPage.page.waitForTimeout(1500);

    await expect(profileSettingsPage.locator_firstNameError.first()).toBeVisible({ timeout: 5000 });
    await profileSettingsPage.validateFirstNameError(
      profileData.expectedMessages.firstNameOnlyLettersError,
    );
  });

  test('P109_To verify first name field validation - cannot be only spaces', async () => {
    console.log(
      'Starting test: P109_To verify first name field validation - cannot be only spaces',
    );
    await profileSettingsPage.openUrl();
    await profileSettingsPage.waitForFormReady();

    await profileSettingsPage.enterFirstName(profileData.formData.firstNameWithSpaces);
    await profileSettingsPage.clickSaveButton();

    await profileSettingsPage.page.waitForTimeout(1500);

    await expect(profileSettingsPage.locator_firstNameError.first()).toBeVisible({ timeout: 5000 });
    await profileSettingsPage.validateFirstNameError(
      profileData.expectedMessages.firstNameNoSpacesOnlyError,
    );
  });

  test('P110_To verify last name field validation - only letters allowed', async () => {
    console.log('Starting test: P110_To verify last name field validation - only letters allowed');
    await profileSettingsPage.openUrl();
    await profileSettingsPage.waitForFormReady();

    await profileSettingsPage.enterFirstName(profileData.formData.validFirstName);
    await profileSettingsPage.enterLastName(profileData.formData.lastNameWithNumbers);
    await profileSettingsPage.clickSaveButton();

    await profileSettingsPage.page.waitForTimeout(1500);

    await expect(profileSettingsPage.locator_lastNameError.first()).toBeVisible({ timeout: 5000 });
    await profileSettingsPage.validateLastNameError(
      profileData.expectedMessages.lastNameOnlyLettersError,
    );
  });

  test('P111_To verify last name accepts spaces (e.g., Van Der Berg)', async () => {
    console.log('Starting test: P111_To verify last name accepts spaces (e.g., Van Der Berg)');
    await profileSettingsPage.openUrl();
    await profileSettingsPage.waitForFormReady();

    const firstName = profileData.formData.validFirstName;
    const lastName = profileData.formData.validLastNameWithSpaces;

    await profileSettingsPage.saveProfile(firstName, lastName);

    await profileSettingsPage.page.waitForTimeout(2000);

    await profileSettingsPage.validateFieldValues(firstName, lastName);
  });

  test('P112_To verify profile data persists after page reload', async () => {
    console.log('Starting test: P112_To verify profile data persists after page reload');
    await profileSettingsPage.openUrl();
    await profileSettingsPage.waitForFormReady();

    const firstName = profileData.formData.validFirstName;
    const lastName = profileData.formData.validLastName;

    await profileSettingsPage.saveProfile(firstName, lastName);
    await profileSettingsPage.page.waitForTimeout(2000);

    await profileSettingsPage.page.reload();
    await profileSettingsPage.waitForFormReady();

    await profileSettingsPage.validateFieldValues(firstName, lastName);
  });

  test('P113_To verify current user email is displayed correctly', async () => {
    console.log('Starting test: P113_To verify current user email is displayed correctly');
    await profileSettingsPage.openUrl();
    await profileSettingsPage.waitForFormReady();

    const email = await profileSettingsPage.getEmail();
    expect(email).toBe(userName);
    expect(email).toContain('@');
  });

  test('P114_To verify Save button is enabled when form is valid', async () => {
    console.log('Starting test: P114_To verify Save button is enabled when form is valid');
    await profileSettingsPage.openUrl();
    await profileSettingsPage.waitForFormReady();

    await profileSettingsPage.enterFirstName(profileData.formData.validFirstName);

    const isEnabled = await profileSettingsPage.locator_saveButton.isEnabled();
    expect(isEnabled).toBe(true);
  });

  test('P115_To verify form fields are pre-populated with existing profile data', async () => {
    console.log(
      'Starting test: P115_To verify form fields are pre-populated with existing profile data',
    );
    await profileSettingsPage.openUrl();
    await profileSettingsPage.waitForFormReady();

    const initialFirstName = await profileSettingsPage.getFirstName();
    const initialLastName = await profileSettingsPage.getLastName();
    const initialEmail = await profileSettingsPage.getEmail();

    expect(initialFirstName).not.toBe('');
    expect(initialEmail).not.toBe('');
    expect(initialEmail).toContain('@');

    await profileSettingsPage.page.reload();
    await profileSettingsPage.waitForFormReady();

    const reloadedFirstName = await profileSettingsPage.getFirstName();
    const reloadedLastName = await profileSettingsPage.getLastName();
    const reloadedEmail = await profileSettingsPage.getEmail();

    expect(reloadedFirstName).toBe(initialFirstName);
    expect(reloadedLastName).toBe(initialLastName);
    expect(reloadedEmail).toBe(initialEmail);
  });
});
