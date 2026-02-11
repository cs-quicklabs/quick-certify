import { expect, type Locator, type Page } from '@playwright/test';

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
  async openUrl() {
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
   */
  async uploadLogo(filePath: string) {
    // Wait for file input to be available
    await this.locator_logoFileInput.waitFor({ state: 'attached', timeout: 5000 });
    await this.locator_logoFileInput.setInputFiles(filePath);
    // Wait for upload to start
    await this.page.waitForTimeout(500);
  }

  /**
   * Upload favicon image
   */
  async uploadFavicon(filePath: string) {
    // Wait for file input to be available
    await this.locator_faviconFileInput.waitFor({ state: 'attached', timeout: 5000 });
    await this.locator_faviconFileInput.setInputFiles(filePath);
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
}
