import { expect, type Locator, type Page } from '@playwright/test';

export class AccountSocialLinksPage {
  readonly page: Page;

  readonly locator_linkedinUrlField: Locator;
  readonly locator_facebookUrlField: Locator;
  readonly locator_twitterUrlField: Locator;
  readonly locator_websiteField: Locator;
  readonly locator_saveButton: Locator;
  readonly locator_alertToast: Locator;
  readonly locator_pageTitle: Locator;
  readonly locator_pageSubtitle: Locator;

  constructor(page: Page) {
    this.page = page;

    this.locator_linkedinUrlField = page.locator('#linkedin_url');
    this.locator_facebookUrlField = page.locator('#facebook_url');
    this.locator_twitterUrlField = page.locator('#twitter_url');
    this.locator_websiteField = page.locator('#website');

    this.locator_saveButton = page.getByRole('button', { name: 'Save', exact: true });
    this.locator_alertToast = page.getByRole('alert');

    this.locator_pageTitle = page.locator('h1.form-title, h1').filter({ hasText: 'Social Links' });
    this.locator_pageSubtitle = page.locator('p').filter({
      hasText:
        'Add social links to your issuer profile. These are shown on various public pages to help users connect with you.',
    });
  }

  /**
   * Navigate to Account Settings - Social Links page
   */
  async gotoAccountSocialLinkPage() {
    await this.page.goto('/settings/account/social-links');
  }

  /**
   * Wait for form to be ready (initial values loaded)
   */
  async waitForFormReady() {
    await this.page.waitForSelector('#linkedin_url', { state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(1000);
    await this.page.waitForLoadState('networkidle');
  }

  async validatePageLoaded() {
    await expect(this.locator_pageTitle).toBeVisible();
    await expect(this.locator_pageSubtitle).toBeVisible();
    await expect(this.locator_linkedinUrlField).toBeVisible();
  }

  async enterLinkedInUrl(url: string) {
    await this.locator_linkedinUrlField.fill(url);
  }

  async enterFacebookUrl(url: string) {
    await this.locator_facebookUrlField.fill(url);
  }

  async enterTwitterUrl(url: string) {
    await this.locator_twitterUrlField.fill(url);
  }

  async enterWebsite(url: string) {
    await this.locator_websiteField.fill(url);
  }

  async clickSaveButton() {
    await this.locator_saveButton.click();
  }

  async clearLinkedInUrl() {
    await this.locator_linkedinUrlField.clear();
  }

  async clearFacebookUrl() {
    await this.locator_facebookUrlField.clear();
  }

  async clearTwitterUrl() {
    await this.locator_twitterUrlField.clear();
  }

  async clearWebsite() {
    await this.locator_websiteField.clear();
  }

  async getLinkedInUrl(): Promise<string> {
    return this.locator_linkedinUrlField.inputValue();
  }

  async getFacebookUrl(): Promise<string> {
    return this.locator_facebookUrlField.inputValue();
  }

  async getTwitterUrl(): Promise<string> {
    return this.locator_twitterUrlField.inputValue();
  }

  async getWebsite(): Promise<string> {
    return this.locator_websiteField.inputValue();
  }

  /**
   * Field error is rendered as <p class="text-red-500 ..."> under the field container.
   */
  getFieldErrorLocator(fieldId: string): Locator {
    return this.page.locator(`#${fieldId}`).locator('..').locator('..').locator('p.text-red-500');
  }

  async validateFieldError(fieldId: string, message: string) {
    const errorEl = this.getFieldErrorLocator(fieldId);
    await expect(errorEl.first()).toBeVisible({ timeout: 5000 });
    await expect(errorEl.first()).toContainText(message, { timeout: 5000 });
  }

  async validateFieldValues(data: {
    linkedin_url?: string;
    facebook_url?: string;
    twitter_url?: string;
    website?: string;
  }) {
    if (data.linkedin_url !== undefined)
      await expect(this.locator_linkedinUrlField).toHaveValue(data.linkedin_url);
    if (data.facebook_url !== undefined)
      await expect(this.locator_facebookUrlField).toHaveValue(data.facebook_url);
    if (data.twitter_url !== undefined)
      await expect(this.locator_twitterUrlField).toHaveValue(data.twitter_url);
    if (data.website !== undefined)
      await expect(this.locator_websiteField).toHaveValue(data.website);
  }

  async validateSuccessMessage(message?: string) {
    await expect(this.locator_alertToast.first()).toBeVisible({ timeout: 5000 });
    if (message) {
      await expect(this.locator_alertToast.first()).toContainText(message);
    }
  }

  /**
   * Verify that success message does NOT appear (validation prevented submission)
   */
  async validateNoSuccessMessage() {
    await this.page.waitForTimeout(1000);
    const successMessages = this.page
      .locator('[role="alert"]')
      .filter({ hasText: /changes saved successfully/i });
    const count = await successMessages.count();
    expect(count).toBe(0);
  }

  /**
   * Save social links with provided fields
   */
  async saveSocialLinks(data: {
    linkedin_url?: string;
    facebook_url?: string;
    twitter_url?: string;
    website?: string;
  }) {
    if (data.linkedin_url !== undefined) await this.enterLinkedInUrl(data.linkedin_url);
    if (data.facebook_url !== undefined) await this.enterFacebookUrl(data.facebook_url);
    if (data.twitter_url !== undefined) await this.enterTwitterUrl(data.twitter_url);
    if (data.website !== undefined) await this.enterWebsite(data.website);
    await Promise.all([
      await this.clickSaveButton(),
      this.page
        .waitForResponse(
          (resp) => resp.url().includes('organizations/settings') && resp.status() === 200,
          { timeout: 2000 },
        )
        .catch(() => {}),
    ]);
  }
}
