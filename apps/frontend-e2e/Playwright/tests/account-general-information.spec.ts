import { test, accountGeneralInfoData, expect, AccountGeneralInfoPage } from './Fixture';

/**
 * Test Case: A10
 * Description: Verifies Account Settings - General Information page
 * Elements Verified:
 * - Page load and navigation
 * - Issuer/Organisation Name (required)
 * - Issuer Description (textarea)
 * - Support Email
 * - Slogan
 * - LinkedIn Company ID
 * - Save and validation messages
 */

let accountGeneralInfoPage: AccountGeneralInfoPage;

test.beforeEach(async ({ accountGeneralInfoPage: fixtureAccountGeneralInfoPage }) => {
  accountGeneralInfoPage = fixtureAccountGeneralInfoPage;
  await accountGeneralInfoPage.gotoAccountGeneralInfoPage();
});

test.describe('Account Settings - General Information', () => {
  test('A101_Verify General Information page loads successfully', async () => {
    await accountGeneralInfoPage.validatePageLoaded();
  });

  test('A102_Verify all form fields are visible', async () => {
    await accountGeneralInfoPage.validateFormFieldsVisible();
  });

  test('A103_Verify successful save with valid data', async ({ page }) => {
    const data = {
      name: accountGeneralInfoData.formData.validName,
      description: accountGeneralInfoData.formData.validDescription,
      support_email: accountGeneralInfoData.formData.validSupportEmail,
      slogan: accountGeneralInfoData.formData.validSlogan,
      linkedin_company_id: accountGeneralInfoData.formData.validLinkedInId,
    };

    await accountGeneralInfoPage.saveGeneralInfoAndWaitForResponse(data);
    await accountGeneralInfoPage.validateFieldValues(data);
  });

  test('A104_Verify save with only required name field', async ({ page }) => {
    const name = accountGeneralInfoData.formData.validName;
    await accountGeneralInfoPage.saveGeneralInfoAndWaitForResponse({ name });
    await accountGeneralInfoPage.validateFieldValues({ name });
  });

  test('A105_Verify name required validation', async () => {
    await accountGeneralInfoPage.clearName();
    await accountGeneralInfoPage.clickSaveButton();
    await accountGeneralInfoPage.validateNoSuccessMessage();
  });

  test('A106_Verify name must not be only spaces', async () => {
    await accountGeneralInfoPage.enterName(accountGeneralInfoData.formData.nameOnlySpaces);
    await accountGeneralInfoPage.clickSaveButton();
    await accountGeneralInfoPage.validateFieldError(
      'name',
      accountGeneralInfoData.expectedMessages.nameNotOnlySpaces,
    );
    await accountGeneralInfoPage.validateNoSuccessMessage();
  });

  test('A107_Verify support email validation - invalid email', async () => {
    await accountGeneralInfoPage.enterName(accountGeneralInfoData.formData.validName);
    await accountGeneralInfoPage.enterSupportEmail(
      accountGeneralInfoData.formData.invalidSupportEmail,
    );
    await accountGeneralInfoPage.clickSaveButton();
    await accountGeneralInfoPage.validateNoSuccessMessage();
  });

  test('A108_Verify LinkedIn Company ID must be numeric and up to 10 digits', async () => {
    await accountGeneralInfoPage.enterName(accountGeneralInfoData.formData.validName);
    await accountGeneralInfoPage.enterLinkedInCompanyId(
      accountGeneralInfoData.formData.invalidLinkedInId,
    );
    await accountGeneralInfoPage.clickSaveButton();
    await accountGeneralInfoPage.validateFieldError(
      'linkedin_company_id',
      accountGeneralInfoData.expectedMessages.linkedInIdInvalid,
    );
    await accountGeneralInfoPage.validateNoSuccessMessage();
  });

  test('A109_Verify Save button is enabled when form has valid name', async () => {
    await accountGeneralInfoPage.enterName(accountGeneralInfoData.formData.validName);
    await expect(accountGeneralInfoPage.locator_saveButton).toBeEnabled();
  });

  test('A110_Verify form fields are pre-populated after reload', async () => {
    const name = await accountGeneralInfoPage.getName();
    const description = await accountGeneralInfoPage.getDescription();
    const supportEmail = await accountGeneralInfoPage.getSupportEmail();
    await accountGeneralInfoPage.page.reload();
    await expect(accountGeneralInfoPage.locator_nameField).toHaveValue(name);
    await expect(accountGeneralInfoPage.locator_descriptionField).toHaveValue(description);
    await expect(accountGeneralInfoPage.locator_supportEmailField).toHaveValue(supportEmail);
  });

  test('A111_Verify description and slogan optional fields accept input', async ({ page }) => {
    const data = {
      name: accountGeneralInfoData.formData.validName,
      description: accountGeneralInfoData.formData.validDescription,
      slogan: accountGeneralInfoData.formData.validSlogan,
    };
    await accountGeneralInfoPage.saveGeneralInfoAndWaitForResponse(data);
    await accountGeneralInfoPage.validateFieldValues({
      name: data.name,
      description: data.description,
      slogan: data.slogan,
    });
  });
});
