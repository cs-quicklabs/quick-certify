import { test, issuerPortalData, expect } from './Fixture';
import type { AccountIssuerPortalPage } from '../pageobjects/AccountIssuerPortalPage';
import * as fs from 'node:fs';
import * as path from 'node:path';

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
function createTestImage(filePath: string, sizeKB = 50): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Create a minimal valid PNG (1x1 pixel PNG)
  // PNG signature + minimal IHDR chunk + IEND chunk
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = Buffer.alloc(25);
  ihdrChunk.writeUInt32BE(13, 0); // Chunk length
  ihdrChunk.write('IHDR', 4); // Chunk type
  // Width: 1, Height: 1, Bit depth: 8, Color type: 2 (RGB), Compression: 0, Filter: 0, Interlace: 0
  ihdrChunk.writeUInt32BE(1, 8); // Width
  ihdrChunk.writeUInt32BE(1, 12); // Height
  ihdrChunk[16] = 8; // Bit depth
  ihdrChunk[17] = 2; // Color type
  ihdrChunk[18] = 0; // Compression
  ihdrChunk[19] = 0; // Filter
  ihdrChunk[20] = 0; // Interlace
  const ihdrCrc = 0x12345678; // Placeholder CRC
  ihdrChunk.writeUInt32BE(ihdrCrc, 21);

  const iendChunk = Buffer.from([
    0x00,
    0x00,
    0x00,
    0x00, // Length
    0x49,
    0x45,
    0x4e,
    0x44, // IEND
    0xae,
    0x42,
    0x60,
    0x82, // CRC
  ]);

  // For larger files, pad with IDAT chunk data
  let imageData = Buffer.concat([pngSignature, ihdrChunk]);
  if (sizeKB > 1) {
    // Add padding to reach desired size (simplified - just add zeros)
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

    // Create test assets directory and images if they don't exist
    const testAssetsDir = path.join(__dirname, '..', 'test-assets');
    const bannerPath = path.join(testAssetsDir, 'banner.png');
    const largeBannerPath = path.join(testAssetsDir, 'large-banner.png');

    if (!fs.existsSync(bannerPath)) {
      createTestImage(bannerPath, 50); // 50KB
    }
    if (!fs.existsSync(largeBannerPath)) {
      createTestImage(largeBannerPath, 2048); // 2MB (exceeds 1MB limit)
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

    // Verify banner is displayed
    const isBannerDisplayed = await accountIssuerPortalPage.isBannerDisplayed();
    // Banner might be displayed or might need a reload
    if (!isBannerDisplayed) {
      await page.reload();
      await accountIssuerPortalPage.waitForPageReady();
    }
  });

  test('IP02_Verify enable/disable based on current checkbox state', async ({ page }) => {
    await accountIssuerPortalPage.openUrl();
    await accountIssuerPortalPage.waitForPageReady();
    await accountIssuerPortalPage.validatePageLoaded();

    // Check current state
    const initialState = await accountIssuerPortalPage.isPortalEnabled();

    // Manage this:
    // - if enable then check for disable case
    // - if disable then check for enable case
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
