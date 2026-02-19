import { expect, type Locator, type Page } from '@playwright/test';
import * as path from 'node:path';
import * as fs from 'node:fs';

export class AccountBrandingPage {
  readonly page: Page;

  readonly locator_logoFileInput: Locator;
  readonly locator_faviconFileInput: Locator;
  readonly locator_logoDropzone: Locator;
  readonly locator_faviconDropzone: Locator;
  readonly locator_logoRemoveButton: Locator;
  readonly locator_faviconRemoveButton: Locator;
  readonly locator_logoChangeButton: Locator;
  readonly locator_faviconChangeButton: Locator;
  readonly locator_alertToast: Locator;
  readonly locator_pageTitle: Locator;
  readonly locator_pageSubtitle: Locator;
  readonly locator_logoError: Locator;
  readonly locator_faviconError: Locator;

  constructor(page: Page) {
    this.page = page;

    // File inputs (hidden, accessed via ref)
    // Logo accepts: image/png,image/jpg,image/jpeg
    // Favicon accepts: image/svg+xml,image/png,image/jpg,image/jpeg
    // Find all file inputs and use index (logo is first, favicon is second)
    const fileInputs = page.locator('input[type="file"]');
    this.locator_logoFileInput = fileInputs.first();
    this.locator_faviconFileInput = fileInputs.nth(1);

    // Dropzones (clickable areas)
    this.locator_logoDropzone = page
      .locator('text=Issuer Logo')
      .locator('..')
      .locator('..')
      .locator('div[class*="border-dashed"]')
      .first();
    this.locator_faviconDropzone = page
      .locator('text=Favicon')
      .locator('..')
      .locator('..')
      .locator('div[class*="border-dashed"]')
      .first();

    // Remove buttons (X button on existing images)
    this.locator_logoRemoveButton = page.locator('button[title="Remove image"]').first();
    this.locator_faviconRemoveButton = page.locator('button[title="Remove image"]').last();

    // Change image buttons
    this.locator_logoChangeButton = page.locator('text=Change image').first();
    this.locator_faviconChangeButton = page.locator('text=Change image').last();

    // Alert messages
    this.locator_alertToast = page.getByRole('alert');

    // Page elements
    this.locator_pageTitle = page.locator('h1.form-title, h1').filter({ hasText: 'Branding' });
    this.locator_pageSubtitle = page
      .locator('p')
      .filter({ hasText: 'Add issuer logo and other brand related information' });

    // Error messages (under each dropzone)
    this.locator_logoError = page
      .locator('text=Issuer Logo')
      .locator('..')
      .locator('..')
      .locator('p.text-red-500')
      .first();
    this.locator_faviconError = page
      .locator('text=Favicon')
      .locator('..')
      .locator('..')
      .locator('p.text-red-500')
      .first();
  }

  /**
   * Navigate to Account Settings - Branding page
   */
  async gotoAccountBrandingPage() {
    await this.page.goto('/settings/account/branding');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for page to be ready
   */
  async waitForPageReady() {
    await this.page.waitForSelector('h1.form-title', { state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(1000);
    await this.page.waitForLoadState('networkidle');
  }

  async validatePageLoaded() {
    await expect(this.locator_pageTitle).toBeVisible();
    await expect(this.locator_pageSubtitle).toBeVisible();
  }

  /**
   * Upload logo image
   * @param filePath - Absolute path or relative path (relative to Playwright directory)
   */
  async uploadLogo(filePath: string) {
    // Resolve relative paths to absolute paths
    // __dirname in compiled JS points to Playwright/pageobjects/, so '..' goes to Playwright/
    let absolutePath: string;
    if (path.isAbsolute(filePath)) {
      absolutePath = filePath;
    } else {
      // Resolve relative to Playwright directory
      absolutePath = path.resolve(__dirname, '..', filePath);
    }

    // Verify file exists
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath} (resolved from: ${filePath})`);
    }

    // Wait for file input to be available
    await this.locator_logoFileInput.waitFor({ state: 'attached', timeout: 5000 });
    await this.locator_logoFileInput.setInputFiles(absolutePath);
    // Wait for upload to start
    await this.page.waitForTimeout(500);
  }

  /**
   * Upload favicon image
   * @param filePath - Absolute path or relative path (relative to Playwright directory)
   */
  async uploadFavicon(filePath: string) {
    // Resolve relative paths to absolute paths
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(__dirname, '..', filePath);

    // Wait for file input to be available
    await this.locator_faviconFileInput.waitFor({ state: 'attached', timeout: 5000 });
    await this.locator_faviconFileInput.setInputFiles(absolutePath);
    // Wait for upload to start
    await this.page.waitForTimeout(500);
  }

  /**
   * Click logo dropzone to trigger file picker
   */
  async clickLogoDropzone() {
    await this.locator_logoDropzone.click();
  }

  /**
   * Click favicon dropzone to trigger file picker
   */
  async clickFaviconDropzone() {
    await this.locator_faviconDropzone.click();
  }

  /**
   * Check if logo image is displayed
   */
  async isLogoDisplayed(): Promise<boolean> {
    return await this.page
      .locator('text=Issuer Logo')
      .locator('..')
      .locator('..')
      .locator('img[alt="Issuer Logo"]')
      .isVisible({ timeout: 2000 })
      .catch(() => false);
  }

  /**
   * Check if favicon image is displayed
   */
  async isFaviconDisplayed(): Promise<boolean> {
    return await this.page
      .locator('text=Favicon')
      .locator('..')
      .locator('..')
      .locator('img[alt="Favicon"]')
      .isVisible({ timeout: 2000 })
      .catch(() => false);
  }

  /**
   * Validate success message
   */
  async validateSuccessMessage(message?: string) {
    await expect(this.locator_alertToast.first()).toBeVisible({ timeout: 10000 });
    if (message) {
      await expect(this.locator_alertToast.first()).toContainText(message);
    }
  }

  /**
   * Validate error message
   */
  async validateErrorMessage(message: string) {
    await expect(this.locator_alertToast.first()).toBeVisible({ timeout: 5000 });
    await expect(this.locator_alertToast.first()).toContainText(message);
  }

  /**
   * Validate logo field error
   */
  async validateLogoError(message: string) {
    await expect(this.locator_logoError.first()).toBeVisible({ timeout: 5000 });
    await expect(this.locator_logoError.first()).toContainText(message);
  }

  /**
   * Validate favicon field error
   */
  async validateFaviconError(message: string) {
    await expect(this.locator_faviconError.first()).toBeVisible({ timeout: 5000 });
    await expect(this.locator_faviconError.first()).toContainText(message);
  }

  /**
   * Validate file size error for logo
   * @param expectedMessage - Expected error message (partial match)
   */
  async validateLogoFileSizeError(expectedMessage: string) {
    const errorVisible = await this.locator_logoError
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    if (errorVisible) {
      const errorText = await this.locator_logoError.textContent();
      expect(errorText).toContain(expectedMessage);
    } else {
      throw new Error('Logo file size error was not visible');
    }
  }

  /**
   * Wait for upload to complete (check for success message or image display)
   */
  async waitForUploadComplete(timeout: number = 15000) {
    // Wait for either success message or image to appear
    await Promise.race([
      this.locator_alertToast.first().waitFor({ state: 'visible', timeout }),
      this.page.waitForSelector('img[alt="Issuer Logo"], img[alt="Favicon"]', { timeout }),
    ]).catch(() => {
      // Ignore timeout, continue
    });
    await this.page.waitForTimeout(1000);
  }

  /**
   * Upload file by file type (logo or favicon)
   * @param fileType - 'logo' | 'favicon'
   * @param filePath - Absolute path or relative path (relative to Playwright directory)
   * @param waitForApiResponse - Optional: wait for API response (default: false)
   */
  async uploadFile(fileType: string, filePath: string, waitForApiResponse: boolean = false) {
    const fileTypeMap: Record<string, Locator> = {
      logo: this.locator_logoFileInput,
      favicon: this.locator_faviconFileInput,
    };

    const normalizedFileType = fileType.toLowerCase();
    const selectedFileInput = fileTypeMap[normalizedFileType];

    if (!selectedFileInput) {
      throw new Error(`Invalid file type: ${fileType}. Valid types are: logo, favicon`);
    }

    // Resolve relative paths to absolute paths
    const absolutePath = path.isAbsolute(filePath)
      ? filePath
      : path.resolve(__dirname, '..', filePath);

    // Verify file exists
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`File not found: ${absolutePath} (resolved from: ${filePath})`);
    }

    // Wait for file input to be available
    await selectedFileInput.waitFor({ state: 'attached', timeout: 5000 });

    // Upload file and optionally wait for API response
    if (waitForApiResponse) {
      await Promise.all([
        selectedFileInput.setInputFiles(absolutePath),
        this.page
          .waitForResponse(
            (resp) =>
              (resp.url().includes('/organizations/settings/branding') ||
                resp.url().includes('/api/v1/files/upload')) &&
              resp.status() === 200,
            { timeout: 15000 },
          )
          .catch(() => {}),
      ]);
    } else {
      await selectedFileInput.setInputFiles(absolutePath);
    }

    // Wait for upload to start
    await this.page.waitForTimeout(500);
  }
}
