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

    const fileInputs = page.locator('input[type="file"]');
    this.locator_logoFileInput = fileInputs.first();
    this.locator_faviconFileInput = fileInputs.nth(1);

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

    this.locator_logoRemoveButton = page.locator('button[title="Remove image"]').first();
    this.locator_faviconRemoveButton = page.locator('button[title="Remove image"]').last();

    this.locator_logoChangeButton = page.locator('text=Change image').first();
    this.locator_faviconChangeButton = page.locator('text=Change image').last();

    this.locator_alertToast = page.getByRole('alert');

    this.locator_pageTitle = page.locator('h1.form-title, h1').filter({ hasText: 'Branding' });
    this.locator_pageSubtitle = page
      .locator('p')
      .filter({ hasText: 'Add issuer logo and other brand related information' });

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

  async openUrl() {
    await this.page.goto('/settings/account/branding');
    await this.page.waitForLoadState('networkidle');
  }

  async waitForPageReady() {
    await this.page.waitForSelector('h1.form-title', { state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(1000);
    await this.page.waitForLoadState('networkidle');
  }

  async validatePageLoaded() {
    await expect(this.locator_pageTitle).toBeVisible();
    await expect(this.locator_pageSubtitle).toBeVisible();
  }

  async uploadLogo(filePath: string) {
    await this.locator_logoFileInput.waitFor({ state: 'attached', timeout: 5000 });
    await this.locator_logoFileInput.setInputFiles(filePath);

    await this.page.waitForTimeout(500);
  }

  async uploadFavicon(filePath: string) {
    await this.locator_faviconFileInput.waitFor({ state: 'attached', timeout: 5000 });
    await this.locator_faviconFileInput.setInputFiles(filePath);

    await this.page.waitForTimeout(500);
  }

  async clickLogoDropzone() {
    await this.locator_logoDropzone.click();
  }

  async clickFaviconDropzone() {
    await this.locator_faviconDropzone.click();
  }

  async isLogoDisplayed(): Promise<boolean> {
    return await this.page
      .locator('text=Issuer Logo')
      .locator('..')
      .locator('..')
      .locator('img[alt="Issuer Logo"]')
      .isVisible({ timeout: 2000 })
      .catch(() => false);
  }

  async isFaviconDisplayed(): Promise<boolean> {
    return await this.page
      .locator('text=Favicon')
      .locator('..')
      .locator('..')
      .locator('img[alt="Favicon"]')
      .isVisible({ timeout: 2000 })
      .catch(() => false);
  }

  async validateSuccessMessage(message?: string) {
    await expect(this.locator_alertToast.first()).toBeVisible({ timeout: 10000 });
    if (message) {
      await expect(this.locator_alertToast.first()).toContainText(message);
    }
  }

  async validateErrorMessage(message: string) {
    await expect(this.locator_alertToast.first()).toBeVisible({ timeout: 5000 });
    await expect(this.locator_alertToast.first()).toContainText(message);
  }

  async validateLogoError(message: string) {
    await expect(this.locator_logoError.first()).toBeVisible({ timeout: 5000 });
    await expect(this.locator_logoError.first()).toContainText(message);
  }

  async validateFaviconError(message: string) {
    await expect(this.locator_faviconError.first()).toBeVisible({ timeout: 5000 });
    await expect(this.locator_faviconError.first()).toContainText(message);
  }

  async waitForUploadComplete(timeout = 15000) {
    await Promise.race([
      this.locator_alertToast.first().waitFor({ state: 'visible', timeout }),
      this.page.waitForSelector('img[alt="Issuer Logo"], img[alt="Favicon"]', { timeout }),
    ]).catch(() => {});
    await this.page.waitForTimeout(1000);
  }
}
