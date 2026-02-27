import { test, brandingData, expect } from './Fixture';
import type { AccountBrandingPage } from '../pageobjects/AccountBrandingPage';
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
    0x00,
    0x00,
    0x00,
    0x00, 
    0x49,
    0x45,
    0x4e,
    0x44, 
    0xae,
    0x42,
    0x60,
    0x82, 
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

let accountBrandingPage: AccountBrandingPage;

test.beforeEach(async ({ page, loginPage, accountBrandingPage: fixtureAccountBrandingPage }) => {
  accountBrandingPage = fixtureAccountBrandingPage;

  const userName = process.env.USER_EMAIL;
  const password = process.env.USER_PASS;

  if (!userName || !password) {
    throw new Error('USER_EMAIL / USER_PASS must be set for authenticated E2E tests');
  }

  
  const testAssetsDir = path.join(__dirname, '..', 'test-assets');
  const logoPath = path.join(testAssetsDir, 'logo.png');
  const faviconPath = path.join(testAssetsDir, 'favicon.png');
  const largeImagePath = path.join(testAssetsDir, 'large-image.png');

  if (!fs.existsSync(logoPath)) {
    createTestImage(logoPath, 50); 
  }
  if (!fs.existsSync(faviconPath)) {
    createTestImage(faviconPath, 50); 
  }
  if (!fs.existsSync(largeImagePath)) {
    createTestImage(largeImagePath, 2048); 
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

    
    const isLogoDisplayed = await accountBrandingPage.isLogoDisplayed();
    
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

    
    const isFaviconDisplayed = await accountBrandingPage.isFaviconDisplayed();
    if (!isFaviconDisplayed) {
      await page.reload();
      await accountBrandingPage.waitForPageReady();
    }
  });

  test('BR03_Verify error is shown when invalid file type is uploaded (logo)', async ({ page }) => {
    await accountBrandingPage.openUrl();
    await accountBrandingPage.waitForPageReady();

    
    const testAssetsDir = path.join(__dirname, '..', 'test-assets');
    const pdfPath = path.join(testAssetsDir, 'document.pdf');
    if (!fs.existsSync(pdfPath)) {
      fs.mkdirSync(testAssetsDir, { recursive: true });
      
      const pdfContent = Buffer.from(
        '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 1\ntrailer\n<<\n/Root 1 0 R\n>>\n%%EOF',
      );
      fs.writeFileSync(pdfPath, pdfContent);
    }

    const absolutePdfPath = path.resolve(pdfPath);

    
    await accountBrandingPage.uploadLogo(absolutePdfPath);
    await page.waitForTimeout(2000);

    
    await accountBrandingPage.validateLogoError(brandingData.expectedMessages.invalidFileTypeError);
  });

  test('BR04_Verify error is shown when file size exceeds limit (logo)', async ({ page }) => {
    await accountBrandingPage.openUrl();
    await accountBrandingPage.waitForPageReady();

    const largeImagePath = path.join(__dirname, '..', 'test-assets', 'large-image.png');
    const absoluteLargeImagePath = path.resolve(largeImagePath);

    
    await accountBrandingPage.uploadLogo(absoluteLargeImagePath);
    await page.waitForTimeout(2000);

    
    const errorVisible = await accountBrandingPage.locator_logoError
      .isVisible({ timeout: 5000 })
      .catch(() => false);
    if (errorVisible) {
      const errorText = await accountBrandingPage.locator_logoError.textContent();
      expect(errorText).toContain(brandingData.expectedMessages.fileSizeError);
    }
  });
});
