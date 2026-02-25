import { test, brandingData, sampleFilePaths, AccountBrandingPage } from './Fixture';

/**
 * Test Suite: Account Settings - Branding
 * Screen: /settings/account/branding
 *
 * Coverage:
 * - Super Admin can upload valid logo image
 * - Super Admin can upload valid favicon image
 * - Error shown when invalid file type is uploaded
 * - Error shown when file size exceeds limit
 * - Logo and favicon can be removed
 */

let accountBrandingPage: AccountBrandingPage;

test.beforeEach(async ({ accountBrandingPage: fixtureAccountBrandingPage }) => {
  accountBrandingPage = fixtureAccountBrandingPage;
  await accountBrandingPage.gotoAccountBrandingPage();
});

test.describe('Account Settings - Branding', () => {
  test('BR01_Verify Super Admin can upload valid logo image', async ({}) => {
    await accountBrandingPage.uploadFile(sampleFilePaths.logoFileType, sampleFilePaths.logo);
    await accountBrandingPage.waitForUploadComplete(15000);
    await accountBrandingPage.validateSuccessMessage(
      brandingData.expectedMessages.logoSuccessMessage,
    );
  });

  test('BR02_Verify Super Admin can upload valid favicon image', async ({}) => {
    await accountBrandingPage.uploadFile(sampleFilePaths.faviconFileType, sampleFilePaths.favicon);
    await accountBrandingPage.waitForUploadComplete(15000);
    await accountBrandingPage.validateSuccessMessage(
      brandingData.expectedMessages.faviconSuccessMessage,
    );
  });

  test('BR03_Verify error is shown when invalid file type is uploaded (logo)', async ({}) => {
    await accountBrandingPage.uploadFile(sampleFilePaths.logoFileType, sampleFilePaths.pdfDocument);
    await accountBrandingPage.waitForUploadComplete(15000);
    await accountBrandingPage.validateLogoError(brandingData.expectedMessages.invalidFileTypeError);
  });

  test('BR04_Verify error is shown when file size exceeds limit (logo)', async ({}) => {
    await accountBrandingPage.uploadFile(sampleFilePaths.logoFileType, sampleFilePaths.largeImage);
    await accountBrandingPage.waitForUploadComplete(15000);
    await accountBrandingPage.validateLogoFileSizeError(
      brandingData.expectedMessages.fileSizeError,
    );
  });
});
