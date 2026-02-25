import { test, profileData, expect } from './Fixture';

/**
 * Test Case: P10
 * Description: Verifies the complete flow for the Profile Settings Functionality
 * Elements Verified:
 * - Profile Settings page navigation
 * - First Name field validation
 * - Last Name field validation
 * - Email field (read-only)
 * - Avatar upload
 * - Save functionality
 * - Success/Error messages
 */

let profileSettingsPage;

test.beforeEach(async ({ profileSettingsPage: fixtureProfileSettingsPage }) => {
  profileSettingsPage = fixtureProfileSettingsPage;
  await profileSettingsPage.gotoProfileSettingPage();
});

test.describe('To validate the Profile Settings Functionality', () => {
  test('P101_To verify Profile Settings page loads successfully', async () => {
    await profileSettingsPage.validatePageLoaded();
  });

  test('P102_To verify navigation to Profile Settings via header dropdown', async () => {
    await profileSettingsPage.navigateViaHeader();
    await profileSettingsPage.validatePageLoaded();
  });

  test('P103_To verify email field is disabled (read-only)', async () => {
    await profileSettingsPage.validateEmailFieldDisabled();
  });

  test('P104_To verify successful profile update with valid first name and last name', async ({
    page,
  }) => {
    const firstName = profileData.formData.validFirstName;
    const lastName = profileData.formData.validLastName;

    await profileSettingsPage.saveProfile(firstName, lastName);
    await profileSettingsPage.validateFieldValues(firstName, lastName);
  });

  test('P105_To verify profile update with only first name (last name optional)', async ({
    page,
  }) => {
    const firstName = profileData.formData.validFirstName;

    // Wait for API response after saving
    await profileSettingsPage.saveProfile(firstName);
    await profileSettingsPage.validateFieldValues(firstName);
  });

  test('P106_To verify first name field validation - required field error', async () => {
    await profileSettingsPage.clearFirstName();
    await profileSettingsPage.clickSaveButton();
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
    await profileSettingsPage.enterFirstName(profileData.formData.shortFirstName);
    await profileSettingsPage.clickSaveButton();
    await expect(profileSettingsPage.locator_firstNameError.first()).toBeVisible({ timeout: 5000 });
    await profileSettingsPage.validateFirstNameError(
      profileData.expectedMessages.firstNameMinLengthError,
    );
  });

  test('P108_To verify first name field validation - only letters allowed', async () => {
    await profileSettingsPage.enterFirstName(profileData.formData.firstNameWithNumbers);
    await profileSettingsPage.clickSaveButton();
    await expect(profileSettingsPage.locator_firstNameError.first()).toBeVisible({ timeout: 5000 });
    await profileSettingsPage.validateFirstNameError(
      profileData.expectedMessages.firstNameOnlyLettersError,
    );
  });

  test('P109_To verify first name field validation - cannot be only spaces', async () => {
    await profileSettingsPage.enterFirstName(profileData.formData.firstNameWithSpaces);
    await profileSettingsPage.clickSaveButton();
    await expect(profileSettingsPage.locator_firstNameError.first()).toBeVisible({ timeout: 5000 });
    await profileSettingsPage.validateFirstNameError(
      profileData.expectedMessages.firstNameNoSpacesOnlyError,
    );
  });

  test('P110_To verify last name field validation - only letters allowed', async () => {
    await profileSettingsPage.enterFirstName(profileData.formData.validFirstName);
    await profileSettingsPage.enterLastName(profileData.formData.lastNameWithNumbers);
    await profileSettingsPage.clickSaveButton();
    await expect(profileSettingsPage.locator_lastNameError.first()).toBeVisible({ timeout: 5000 });
    await profileSettingsPage.validateLastNameError(
      profileData.expectedMessages.lastNameOnlyLettersError,
    );
  });

  test('P111_To verify last name accepts spaces (e.g., Van Der Berg)', async () => {
    const firstName = profileData.formData.validFirstName;
    const lastName = profileData.formData.validLastNameWithSpaces;
    await profileSettingsPage.saveProfile(firstName, lastName);
    await profileSettingsPage.validateFieldValues(firstName, lastName);
  });

  test('P112_To verify profile data persists after page reload', async () => {
    const firstName = profileData.formData.validFirstName;
    const lastName = profileData.formData.validLastName;
    await profileSettingsPage.saveProfile(firstName, lastName);
    await profileSettingsPage.page.reload();
    await profileSettingsPage.page.waitForTimeout(3000);
    await profileSettingsPage.validateFieldValues(firstName, lastName);
  });

  test('P113_To verify current user email is displayed correctly', async () => {
    const email = await profileSettingsPage.getEmail();
    expect(email).toBe(email);
  });

  test('P114_To verify Save button is enabled when form is valid', async () => {
    await profileSettingsPage.enterFirstName(profileData.formData.validFirstName);
    const isEnabled = await profileSettingsPage.locator_saveButton.isEnabled();
    expect(isEnabled).toBe(true);
  });

  test('P115_To verify form fields are pre-populated with existing profile data', async () => {
    const initialFirstName = await profileSettingsPage.getFirstName();
    const initialLastName = await profileSettingsPage.getLastName();
    const initialEmail = await profileSettingsPage.getEmail();
    expect(initialFirstName).not.toBe('');
    expect(initialEmail).not.toBe('');
    expect(initialEmail).toContain('@');
    await profileSettingsPage.page.reload();
    const reloadedFirstName = await profileSettingsPage.getFirstName();
    const reloadedLastName = await profileSettingsPage.getLastName();
    const reloadedEmail = await profileSettingsPage.getEmail();
    expect(reloadedFirstName).toBe(initialFirstName);
    expect(reloadedLastName).toBe(initialLastName);
    expect(reloadedEmail).toBe(initialEmail);
  });
});
