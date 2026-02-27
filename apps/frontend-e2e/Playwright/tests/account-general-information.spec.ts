import { test, accountGeneralInfoData, expect } from './Fixture';
import type { AccountGeneralInfoPage } from '../pageobjects/AccountGeneralInfoPage';

const userName = process.env.USER_EMAIL;
const password = process.env.USER_PASS;

if (!userName || !password) {
  throw new Error('USER_EMAIL / USER_PASS must be set for authenticated E2E tests');
}

let accountGeneralInfoPage: AccountGeneralInfoPage;

test.beforeEach(
  async ({ page, loginPage, accountGeneralInfoPage: fixtureAccountGeneralInfoPage }) => {
    accountGeneralInfoPage = fixtureAccountGeneralInfoPage;

    await page.goto('/settings/account/general-information');

    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      await loginPage.enterUserEmail(userName);
      await loginPage.enterPassword(password);
      await Promise.all([
        loginPage.clickOnSigninBtn(),
        page.waitForURL(/\/(dashboard|settings)/, { timeout: 20000 }),
      ]);
      await page.goto('/settings/account/general-information');
      await page.waitForLoadState('networkidle');
    } else {
      await page.waitForLoadState('networkidle');
    }
  },
);

test.describe('Account Settings - General Information', () => {
  test('A101_Verify General Information page loads successfully', async () => {
    await accountGeneralInfoPage.openUrl();
    await accountGeneralInfoPage.validatePageLoaded();
  });

  test('A102_Verify all form fields are visible', async () => {
    await accountGeneralInfoPage.openUrl();
    await accountGeneralInfoPage.waitForFormReady();

    await accountGeneralInfoPage.validatePageLoaded();
    await accountGeneralInfoPage.page.waitForSelector('#name', { state: 'visible' });
    await accountGeneralInfoPage.page.waitForSelector('#description', { state: 'visible' });
    await accountGeneralInfoPage.page.waitForSelector('#support_email', { state: 'visible' });
    await accountGeneralInfoPage.page.waitForSelector('#slogan', { state: 'visible' });
    await accountGeneralInfoPage.page.waitForSelector('#linkedin_company_id', { state: 'visible' });
    await accountGeneralInfoPage.page.waitForSelector('button:has-text("Save")', {
      state: 'visible',
    });
  });

  test('A103_Verify successful save with valid data', async ({ page }) => {
    await accountGeneralInfoPage.openUrl();
    await accountGeneralInfoPage.waitForFormReady();

    const data = {
      name: accountGeneralInfoData.formData.validName,
      description: accountGeneralInfoData.formData.validDescription,
      support_email: accountGeneralInfoData.formData.validSupportEmail,
      slogan: accountGeneralInfoData.formData.validSlogan,
      linkedin_company_id: accountGeneralInfoData.formData.validLinkedInId,
    };

    await Promise.all([
      accountGeneralInfoPage.saveGeneralInfo(data),
      page.waitForResponse(
        (resp) => resp.url().includes('organizations/settings') && resp.status() === 200,
        { timeout: 10000 },
      ),
    ]);

    await page.waitForTimeout(1000);
    await accountGeneralInfoPage.validateFieldValues(data);
  });

  test('A104_Verify save with only required name field', async ({ page }) => {
    await accountGeneralInfoPage.openUrl();
    await accountGeneralInfoPage.waitForFormReady();

    const name = accountGeneralInfoData.formData.validName;
    await Promise.all([
      accountGeneralInfoPage.saveGeneralInfo({ name }),
      page.waitForResponse(
        (resp) => resp.url().includes('organizations/settings') && resp.status() === 200,
        { timeout: 10000 },
      ),
    ]);

    await page.waitForTimeout(1000);
    await accountGeneralInfoPage.validateFieldValues({ name });
  });

  test('A105_Verify name required validation', async () => {
    await accountGeneralInfoPage.openUrl();
    await accountGeneralInfoPage.waitForFormReady();

    await accountGeneralInfoPage.clearName();
    await accountGeneralInfoPage.clickSaveButton();
    await accountGeneralInfoPage.page.waitForTimeout(1500);

    await accountGeneralInfoPage.validateNoSuccessMessage();
  });

  test('A106_Verify name must not be only spaces', async () => {
    await accountGeneralInfoPage.openUrl();
    await accountGeneralInfoPage.waitForFormReady();

    await accountGeneralInfoPage.enterName(accountGeneralInfoData.formData.nameOnlySpaces);
    await accountGeneralInfoPage.clickSaveButton();
    await accountGeneralInfoPage.page.waitForTimeout(1500);

    await accountGeneralInfoPage.validateFieldError(
      'name',
      accountGeneralInfoData.expectedMessages.nameNotOnlySpaces,
    );

    await accountGeneralInfoPage.validateNoSuccessMessage();
  });

  test('A107_Verify support email validation - invalid email', async () => {
    await accountGeneralInfoPage.openUrl();
    await accountGeneralInfoPage.waitForFormReady();

    await accountGeneralInfoPage.enterName(accountGeneralInfoData.formData.validName);
    await accountGeneralInfoPage.enterSupportEmail(
      accountGeneralInfoData.formData.invalidSupportEmail,
    );
    await accountGeneralInfoPage.clickSaveButton();
    await accountGeneralInfoPage.page.waitForTimeout(1500);

    await accountGeneralInfoPage.validateNoSuccessMessage();
  });

  test('A108_Verify LinkedIn Company ID must be numeric and up to 10 digits', async () => {
    await accountGeneralInfoPage.openUrl();
    await accountGeneralInfoPage.waitForFormReady();

    await accountGeneralInfoPage.enterName(accountGeneralInfoData.formData.validName);
    await accountGeneralInfoPage.enterLinkedInCompanyId(
      accountGeneralInfoData.formData.invalidLinkedInId,
    );
    await accountGeneralInfoPage.clickSaveButton();
    await accountGeneralInfoPage.page.waitForTimeout(1500);

    await accountGeneralInfoPage.validateFieldError(
      'linkedin_company_id',
      accountGeneralInfoData.expectedMessages.linkedInIdInvalid,
    );

    await accountGeneralInfoPage.validateNoSuccessMessage();
  });

  test('A109_Verify Save button is enabled when form has valid name', async () => {
    await accountGeneralInfoPage.openUrl();
    await accountGeneralInfoPage.waitForFormReady();

    await accountGeneralInfoPage.enterName(accountGeneralInfoData.formData.validName);
    await expect(accountGeneralInfoPage.locator_saveButton).toBeEnabled();
  });

  test('A110_Verify form fields are pre-populated after reload', async () => {
    await accountGeneralInfoPage.openUrl();
    await accountGeneralInfoPage.waitForFormReady();

    const name = await accountGeneralInfoPage.getName();
    const description = await accountGeneralInfoPage.getDescription();
    const supportEmail = await accountGeneralInfoPage.getSupportEmail();

    await accountGeneralInfoPage.page.reload();
    await accountGeneralInfoPage.waitForFormReady();

    await expect(accountGeneralInfoPage.locator_nameField).toHaveValue(name);
    await expect(accountGeneralInfoPage.locator_descriptionField).toHaveValue(description);
    await expect(accountGeneralInfoPage.locator_supportEmailField).toHaveValue(supportEmail);
  });

  test('A111_Verify description and slogan optional fields accept input', async ({ page }) => {
    await accountGeneralInfoPage.openUrl();
    await accountGeneralInfoPage.waitForFormReady();

    const data = {
      name: accountGeneralInfoData.formData.validName,
      description: accountGeneralInfoData.formData.validDescription,
      slogan: accountGeneralInfoData.formData.validSlogan,
    };

    await Promise.all([
      accountGeneralInfoPage.saveGeneralInfo(data),
      page.waitForResponse(
        (resp) => resp.url().includes('organizations/settings') && resp.status() === 200,
        { timeout: 10000 },
      ),
    ]);

    await page.waitForTimeout(1000);
    await accountGeneralInfoPage.validateFieldValues({
      name: data.name,
      description: data.description,
      slogan: data.slogan,
    });
  });
});
