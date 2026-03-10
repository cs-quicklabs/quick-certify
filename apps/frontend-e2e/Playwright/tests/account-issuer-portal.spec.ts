import { test, issuerPortalData, expect } from './Fixture';
import type { AccountIssuerPortalPage } from '../pageobjects/AccountIssuerPortalPage';
import * as fs from 'node:fs';
import * as path from 'node:path';

function createTestImage(filePath: string, sizeKB = 50): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = Buffer.alloc(25);
  ihdrChunk.writeUInt32BE(13, 0);
  ihdrChunk.write('IHDR', 4);

  ihdrChunk.writeUInt32BE(1, 8);
  ihdrChunk.writeUInt32BE(1, 12);
  ihdrChunk[16] = 8;
  ihdrChunk[17] = 2;
  ihdrChunk[18] = 0;
  ihdrChunk[19] = 0;
  ihdrChunk[20] = 0;
  const ihdrCrc = 0x12345678;
  ihdrChunk.writeUInt32BE(ihdrCrc, 21);

  const iendChunk = Buffer.from([
    0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);

  let imageData = Buffer.concat([pngSignature, ihdrChunk]);
  if (sizeKB > 1) {
    const paddingSize = (sizeKB - 1) * 1024;
    const padding = Buffer.alloc(paddingSize);
    imageData = Buffer.concat([imageData, padding]);
  }
  imageData = Buffer.concat([imageData, iendChunk]);

  fs.writeFileSync(filePath, imageData);
}

let accountIssuerPortalPage: AccountIssuerPortalPage;

test.beforeEach(
  async ({ page, loginPage, accountIssuerPortalPage: fixtureAccountIssuerPortalPage }) => {
    accountIssuerPortalPage = fixtureAccountIssuerPortalPage;

    const userName = process.env.USER_EMAIL;
    const password = process.env.USER_PASS;

    if (!userName || !password) {
      throw new Error('USER_EMAIL / USER_PASS must be set for authenticated E2E tests');
    }

    const testAssetsDir = path.join(__dirname, '..', 'test-assets');
    const bannerPath = path.join(testAssetsDir, 'banner.png');
    const largeBannerPath = path.join(testAssetsDir, 'large-banner.png');

    if (!fs.existsSync(bannerPath)) {
      createTestImage(bannerPath, 50);
    }
    if (!fs.existsSync(largeBannerPath)) {
      createTestImage(largeBannerPath, 2048);
    }

    await page.goto('/settings/account/issuer-portal');

    const currentUrl = page.url();
    if (currentUrl.includes('/login')) {
      await loginPage.enterUserEmail(userName);
      await loginPage.enterPassword(password);
      await Promise.all([
        loginPage.clickOnSigninBtn(),
        page.waitForURL(/\/(dashboard|settings)/, { timeout: 20000 }),
      ]);
      await page.goto('/settings/account/issuer-portal');
      await page.waitForLoadState('networkidle');
    } else {
      await page.waitForLoadState('networkidle');
    }
  },
);

test.describe('Account Settings - Issuer Portal', () => {
  test('IP01_Verify Super Admin can upload banner image', async ({ page }) => {
    await accountIssuerPortalPage.openUrl();
    await accountIssuerPortalPage.waitForPageReady();
    await accountIssuerPortalPage.validatePageLoaded();

    const bannerPath = path.join(__dirname, '..', 'test-assets', 'banner.png');
    const absoluteBannerPath = path.resolve(bannerPath);

    await Promise.all([
      accountIssuerPortalPage.uploadBanner(absoluteBannerPath),
      page
        .waitForResponse(
          (resp) =>
            (resp.url().includes('/organizations/settings/portal') ||
              resp.url().includes('/api/v1/files/upload')) &&
            resp.status() === 200,
          { timeout: 15000 },
        )
        .catch(() => {}),
    ]);

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
    await accountIssuerPortalPage.openUrl();
    await accountIssuerPortalPage.waitForPageReady();
    await accountIssuerPortalPage.validatePageLoaded();

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
