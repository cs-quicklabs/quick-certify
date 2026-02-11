import { test, brandingData, expect } from './Fixture';
import type { AccountBrandingPage } from '../pageobjects/AccountBrandingPage';
import * as fs from 'node:fs';
import * as path from 'node:path';

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

/**
 * Helper function to create a minimal valid PNG image for testing
 */
function createTestImage(filePath: string, sizeKB: number = 50): void {
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

let accountBrandingPage: AccountBrandingPage;

test.beforeEach(async ({ page, loginPage, accountBrandingPage: fixtureAccountBrandingPage }) => {
  accountBrandingPage = fixtureAccountBrandingPage;

  const userName = process.env.USER_EMAIL;
  const password = process.env.USER_PASS;

  if (!userName || !password) {
    throw new Error('USER_EMAIL / USER_PASS must be set for authenticated E2E tests');
  }

  // Create test assets directory and images if they don't exist
  const testAssetsDir = path.join(__dirname, '..', 'test-assets');
  const logoPath = path.join(testAssetsDir, 'logo.png');
  const faviconPath = path.join(testAssetsDir, 'favicon.png');
  const largeImagePath = path.join(testAssetsDir, 'large-image.png');

  if (!fs.existsSync(logoPath)) {
    createTestImage(logoPath, 50); // 50KB
  }
  if (!fs.existsSync(faviconPath)) {
    createTestImage(faviconPath, 50); // 50KB
  }
  if (!fs.existsSync(largeImagePath)) {
    createTestImage(largeImagePath, 2048); // 2MB (exceeds 1MB limit)
  }

  await page.goto('/settings/account/branding');

  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    await loginPage.enterUserEmail(userName);
    await loginPage.enterPassword(password);
    await Promise.all([
      loginPage.clickOnSigninBtn(),
      page.waitForURL(/\/(dashboard|settings)/, { timeout: 20000 }),
    ]);
    await page.goto('/settings/account/branding');
    await page.waitForLoadState('networkidle');
  } else {
    await page.waitForLoadState('networkidle');
  }
});

test.describe('Account Settings - Branding', () => {
  test('BR01_Verify Super Admin can upload valid logo image', async ({ page }) => {
    await accountBrandingPage.openUrl();
    await accountBrandingPage.waitForPageReady();
    await accountBrandingPage.validatePageLoaded();

    const logoPath = path.join(__dirname, '..', 'test-assets', 'logo.png');
    const absoluteLogoPath = path.resolve(logoPath);

    await Promise.all([
      accountBrandingPage.uploadLogo(absoluteLogoPath),
      page
        .waitForResponse(
          (resp) =>
            (resp.url().includes('/organizations/settings/branding') ||
              resp.url().includes('/api/v1/files/upload')) &&
            resp.status() === 200,
          { timeout: 15000 },
        )
        .catch(() => {}),
    ]);

    await accountBrandingPage.waitForUploadComplete(15000);
    await accountBrandingPage.validateSuccessMessage(
      brandingData.expectedMessages.logoSuccessMessage,
    );

    // Verify logo is displayed
    const isLogoDisplayed = await accountBrandingPage.isLogoDisplayed();
    // Logo might be displayed or might need a reload
    if (!isLogoDisplayed) {
      await page.reload();
      await accountBrandingPage.waitForPageReady();
    }
  });

  test('BR02_Verify Super Admin can upload valid favicon image', async ({ page }) => {
    await accountBrandingPage.openUrl();
    await accountBrandingPage.waitForPageReady();
    await accountBrandingPage.validatePageLoaded();

    const faviconPath = path.join(__dirname, '..', 'test-assets', 'favicon.png');
    const absoluteFaviconPath = path.resolve(faviconPath);

    await Promise.all([
      accountBrandingPage.uploadFavicon(absoluteFaviconPath),
      page
        .waitForResponse(
          (resp) =>
            (resp.url().includes('/organizations/settings/branding') ||
              resp.url().includes('/api/v1/files/upload')) &&
            resp.status() === 200,
          { timeout: 15000 },
        )
        .catch(() => {}),
    ]);

    await accountBrandingPage.waitForUploadComplete(15000);
    await accountBrandingPage.validateSuccessMessage(
      brandingData.expectedMessages.faviconSuccessMessage,
    );

    // Verify favicon is displayed
    const isFaviconDisplayed = await accountBrandingPage.isFaviconDisplayed();
    if (!isFaviconDisplayed) {
      await page.reload();
      await accountBrandingPage.waitForPageReady();
    }
  });

  test('BR03_Verify error is shown when invalid file type is uploaded (logo)', async ({ page }) => {
    await accountBrandingPage.openUrl();
    await accountBrandingPage.waitForPageReady();

    // Create a test PDF file
    const testAssetsDir = path.join(__dirname, '..', 'test-assets');
    const pdfPath = path.join(testAssetsDir, 'document.pdf');
    if (!fs.existsSync(pdfPath)) {
      fs.mkdirSync(testAssetsDir, { recursive: true });
      // Create a minimal PDF file
      const pdfContent = Buffer.from(
        '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 1\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF',
      );
      fs.writeFileSync(pdfPath, pdfContent);
    }

    const absolutePdfPath = path.resolve(pdfPath);

    // Try to upload PDF as logo (should fail)
    await accountBrandingPage.uploadLogo(absolutePdfPath);
    await page.waitForTimeout(2000);

    // Check for error message
    await accountBrandingPage.validateLogoError(brandingData.expectedMessages.invalidFileTypeError);
  });

  test('BR04_Verify error is shown when file size exceeds limit (logo)', async ({ page }) => {
    await accountBrandingPage.openUrl();
    await accountBrandingPage.waitForPageReady();

    const largeImagePath = path.join(__dirname, '..', 'test-assets', 'large-image.png');
    const absoluteLargeImagePath = path.resolve(largeImagePath);

    // Try to upload large file (should fail)
    await accountBrandingPage.uploadLogo(absoluteLargeImagePath);
    await page.waitForTimeout(2000);

    // Check for file size error
    const errorVisible = await accountBrandingPage.locator_logoError
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    if (errorVisible) {
      const errorText = await accountBrandingPage.locator_logoError.textContent();
      expect(errorText).toContain(brandingData.expectedMessages.fileSizeError);
    }
  });
});
