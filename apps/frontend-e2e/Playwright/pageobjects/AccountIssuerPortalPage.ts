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

    
    const fileInputs = page.locator('input[type="file"]');
    this.locator_bannerFileInput = fileInputs.first();

    
    this.locator_bannerDropzone = page
      .locator('text=Banner Image')
      .locator('..')
      .locator('..')
      .locator('div[class*="border-dashed"]')
      .first();

    
    this.locator_bannerRemoveButton = page.locator('button[title="Remove image"]').first();

    
    this.locator_bannerChangeButton = page.locator('text=Change image').first();

    
    this.locator_portalEnabledCheckbox = page.locator('#portal_enabled');
    this.locator_portalEnabledLabel = page.locator('label[for="portal_enabled"]');

    
    
    
    this.locator_alertToast = page.locator('div[role="alert"][class*="border-l-4"]');

    
    this.locator_pageTitle = page.locator('h1.form-title, h1').filter({ hasText: 'Issuer Portal' });
    this.locator_pageSubtitle = page.locator('p').filter({
      hasText: 'Issuer Portal is public page where all the public events are visible to internet.',
    });

    
    this.locator_bannerError = page
      .locator('text=Banner Image')
      .locator('..')
      .locator('..')
      .locator('p.text-red-500')
      .first();
  }

  
  async openUrl() {
    await this.page.goto('/settings/account/issuer-portal');
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

  
  async uploadBanner(filePath: string) {
    
    await this.locator_bannerFileInput.waitFor({ state: 'attached', timeout: 5000 });
    await this.locator_bannerFileInput.setInputFiles(filePath);
    
    await this.page.waitForTimeout(500);
  }

  
  async clickBannerDropzone() {
    await this.locator_bannerDropzone.click();
  }

  
  async removeBanner() {
    if (await this.locator_bannerRemoveButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.locator_bannerRemoveButton.click();
      await this.page.waitForTimeout(1000);
    }
  }

  
  async isBannerDisplayed(): Promise<boolean> {
    return await this.page
      .locator('text=Banner Image')
      .locator('..')
      .locator('..')
      .locator('img[alt="Banner Image"]')
      .isVisible({ timeout: 2000 })
      .catch(() => false);
  }

  
  async isPortalEnabled(): Promise<boolean> {
    return await this.locator_portalEnabledCheckbox.isChecked();
  }

  
  async setPortalEnabled(enabled: boolean) {
    await this.locator_portalEnabledCheckbox.setChecked(enabled);
    await this.page.waitForTimeout(300);
  }

  
  async enablePortal() {
    const isChecked = await this.isPortalEnabled();
    if (!isChecked) {
      await this.locator_portalEnabledCheckbox.check();
      await this.page.waitForTimeout(500);
    }
  }

  
  async disablePortal() {
    const isChecked = await this.isPortalEnabled();
    if (isChecked) {
      await this.locator_portalEnabledCheckbox.uncheck();
      await this.page.waitForTimeout(500);
    }
  }

  
  async togglePortal() {
    await this.locator_portalEnabledCheckbox.click();
    await this.page.waitForTimeout(500);
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

  
  async validateBannerError(message: string) {
    await expect(this.locator_bannerError.first()).toBeVisible({ timeout: 5000 });
    await expect(this.locator_bannerError.first()).toContainText(message);
  }

  
  async waitForUploadComplete(timeout = 15000) {
    
    await Promise.race([
      this.locator_alertToast.first().waitFor({ state: 'visible', timeout }),
      this.page.waitForSelector('img[alt="Banner Image"]', { timeout }),
    ]).catch(() => {
      
    });
    await this.page.waitForTimeout(1000);
  }

  
  async waitForToggleComplete(timeout = 10000) {
    await this.locator_alertToast
      .first()
      .waitFor({ state: 'visible', timeout })
      .catch(() => {
        
      });
    await this.page.waitForTimeout(1000);
  }
}
