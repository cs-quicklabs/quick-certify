import {
  test,
  issuerPortalData,
  expect,
  AccountIssuerPortalPage,
  sampleFilePaths,
} from './Fixture';

/**
 * Test Suite: Account Settings - Issuer Portal
 * Screen: /settings/account/issuer-portal
 *
 * Coverage:
 * - Super Admin can upload banner image
 * - Super Admin can enable portal checkbox
 * - Super Admin can disable portal checkbox
 */

/**
 * Helper function to create a minimal valid PNG image for testing
 */

let accountIssuerPortalPage: AccountIssuerPortalPage;

test.beforeEach(async ({ accountIssuerPortalPage: fixtureAccountIssuerPortalPage }) => {
  accountIssuerPortalPage = fixtureAccountIssuerPortalPage;
  await accountIssuerPortalPage.gotoAccountIssuerPortalPage();
});

test.describe('Account Settings - Issuer Portal', () => {
  test('IP01_Verify Super Admin can upload banner image', async ({ page }) => {
    await accountIssuerPortalPage.uploadAndValidateBanner(sampleFilePaths.banner);
    await accountIssuerPortalPage.waitForUploadComplete(15000);
    await accountIssuerPortalPage.validateSuccessMessage(
      issuerPortalData.expectedMessages.bannerSuccessMessage,
    );

    const isBannerDisplayed = await accountIssuerPortalPage.isBannerDisplayed();
    if (!isBannerDisplayed) {
      await page.reload();
      await accountIssuerPortalPage.waitForPageReady();
    }
  });

  test('IP02_Verify enable/disable based on current checkbox state', async ({ page }) => {
    const initialState = await accountIssuerPortalPage.isPortalEnabled();
    const targetState = !initialState;
    const responsePromise = page
      .waitForResponse(
        (resp) => resp.url().includes('/organizations/settings/portal') && resp.status() === 200,
        { timeout: 10000 },
      )
      .catch(() => {});
    await accountIssuerPortalPage.setPortalEnabled(targetState);
    await responsePromise;
    await accountIssuerPortalPage.waitForToggleComplete(10000);
    await accountIssuerPortalPage.validateSuccessMessage(
      issuerPortalData.expectedMessages.portalEnabledSuccessMessage,
    );
    if (targetState) {
      await expect(accountIssuerPortalPage.locator_portalEnabledCheckbox).toBeChecked();
    } else {
      await expect(accountIssuerPortalPage.locator_portalEnabledCheckbox).not.toBeChecked();
    }
  });
});
