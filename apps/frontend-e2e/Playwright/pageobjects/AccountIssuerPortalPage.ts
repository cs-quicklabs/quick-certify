import { expect, type Locator, type Page } from '@playwright/test';

export class AccountIssuerPortalPage {
  readonly page: Page;

  readonly locator_bannerFileInput: Locator;
  readonly locator_bannerDropzone: Locator;
  readonly locator_bannerRemoveButton: Locator;
  readonly locator_bannerChangeButton: Locator;
  readonly locator_portalEnabledCheckbox: Locator;
  readonly locator_portalEnabledLabel: Locator;
  readonly locator_alertToast: Locator;
  readonly locator_pageTitle: Locator;
  readonly locator_pageSubtitle: Locator;
  readonly locator_bannerError: Locator;

  constructor(page: Page) {
    this.page = page;

    // File input for banner (hidden, accessed via ref)
    const fileInputs = page.locator('input[type="file"]');
    this.locator_bannerFileInput = fileInputs.first();

    // Dropzone (clickable area)
    this.locator_bannerDropzone = page
      .locator('text=Banner Image')
      .locator('..')
      .locator('..')
      .locator('div[class*="border-dashed"]')
      .first();

    // Remove button (X button on existing banner)
    this.locator_bannerRemoveButton = page.locator('button[title="Remove image"]').first();

    // Change image button
    this.locator_bannerChangeButton = page.locator('text=Change image').first();

    // Portal enabled checkbox
    this.locator_portalEnabledCheckbox = page.locator('#portal_enabled');
    this.locator_portalEnabledLabel = page.locator('label[for="portal_enabled"]');

    // Alert messages
    // Next.js also renders an empty route announcer with role="alert" (id="__next-route-announcer__").
    // Our app alerts have the Alert component styling including `border-l-4`, so filter on that.
    this.locator_alertToast = page.locator('div[role="alert"][class*="border-l-4"]');

    // Page elements
    this.locator_pageTitle = page.locator('h1.form-title, h1').filter({ hasText: 'Issuer Portal' });
    this.locator_pageSubtitle = page
      .locator('p')
      .filter({
        hasText:
          'Issuer Portal is public page where all the public events are visible to internet.',
      });

    // Error message (under banner dropzone)
    this.locator_bannerError = page
      .locator('text=Banner Image')
      .locator('..')
      .locator('..')
      .locator('p.text-red-500')
      .first();
  }

  /**
   * Navigate to Account Settings - Issuer Portal page
   */
  async openUrl() {
    await this.page.goto('/settings/account/issuer-portal');
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
   * Upload banner image
   */
  async uploadBanner(filePath: string) {
    // Wait for file input to be available
    await this.locator_bannerFileInput.waitFor({ state: 'attached', timeout: 5000 });
    await this.locator_bannerFileInput.setInputFiles(filePath);
    // Wait for upload to start
    await this.page.waitForTimeout(500);
  }

  /**
   * Click banner dropzone to trigger file picker
   */
  async clickBannerDropzone() {
    await this.locator_bannerDropzone.click();
  }

  /**
   * Remove banner (click X button)
   */
  async removeBanner() {
    if (
      (await this.locator_bannerRemoveButton.isVisible({ timeout: 2000 }).catch(() => false))
    ) {
      await this.locator_bannerRemoveButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  /**
   * Check if banner image is displayed
   */
  async isBannerDisplayed(): Promise<boolean> {
    return await this.page
      .locator('text=Banner Image')
      .locator('..')
      .locator('..')
      .locator('img[alt="Banner Image"]')
      .isVisible({ timeout: 2000 })
      .catch(() => false);
  }

  /**
   * Get portal enabled checkbox state
   */
  async isPortalEnabled(): Promise<boolean> {
    return await this.locator_portalEnabledCheckbox.isChecked();
  }

  /**
   * Set portal enabled state deterministically
   */
  async setPortalEnabled(enabled: boolean) {
    await this.locator_portalEnabledCheckbox.setChecked(enabled);
    await this.page.waitForTimeout(300);
  }

  /**
   * Enable portal (check the checkbox)
   */
  async enablePortal() {
    const isChecked = await this.isPortalEnabled();
    if (!isChecked) {
      await this.locator_portalEnabledCheckbox.check();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Disable portal (uncheck the checkbox)
   */
  async disablePortal() {
    const isChecked = await this.isPortalEnabled();
    if (isChecked) {
      await this.locator_portalEnabledCheckbox.uncheck();
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Toggle portal enabled state
   */
  async togglePortal() {
    await this.locator_portalEnabledCheckbox.click();
    await this.page.waitForTimeout(500);
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
   * Validate banner field error
   */
  async validateBannerError(message: string) {
    await expect(this.locator_bannerError.first()).toBeVisible({ timeout: 5000 });
    await expect(this.locator_bannerError.first()).toContainText(message);
  }

  /**
   * Wait for upload to complete (check for success message or image display)
   */
  async waitForUploadComplete(timeout: number = 15000) {
    // Wait for either success message or image to appear
    await Promise.race([
      this.locator_alertToast.first().waitFor({ state: 'visible', timeout }),
      this.page.waitForSelector('img[alt="Banner Image"]', { timeout }),
    ]).catch(() => {
      // Ignore timeout, continue
    });
    await this.page.waitForTimeout(1000);
  }

  /**
   * Wait for portal toggle to complete (check for success message)
   */
  async waitForToggleComplete(timeout: number = 10000) {
    await this.locator_alertToast.first().waitFor({ state: 'visible', timeout }).catch(() => {
      // Ignore timeout, continue
    });
    await this.page.waitForTimeout(1000);
  }
}
