import { expect, type Locator, type Page } from '@playwright/test';

export class AccountGeneralInfoPage {
  readonly page: Page;
  readonly locator_nameField: Locator;
  readonly locator_descriptionField: Locator;
  readonly locator_supportEmailField: Locator;
  readonly locator_sloganField: Locator;
  readonly locator_linkedinCompanyIdField: Locator;
  readonly locator_saveButton: Locator;
  readonly locator_alertToast: Locator;
  readonly locator_pageTitle: Locator;
  readonly locator_pageSubtitle: Locator;
  readonly locator_verifiedAlert: Locator;
  readonly locator_unverifiedAlert: Locator;

  constructor(page: Page) {
    this.page = page;
    this.locator_nameField = page.locator('#name');
    this.locator_descriptionField = page.locator('#description');
    this.locator_supportEmailField = page.locator('#support_email');
    this.locator_sloganField = page.locator('#slogan');
    this.locator_linkedinCompanyIdField = page.locator('#linkedin_company_id');
    this.locator_saveButton = page.getByRole('button', { name: 'Save', exact: true });
    this.locator_alertToast = page.getByRole('alert');
    this.locator_pageTitle = page
      .locator('h1.form-title, h1')
      .filter({ hasText: 'General Information' });
    this.locator_pageSubtitle = page
      .locator('p')
      .filter({ hasText: 'Add more details about the organisation or the certificate issuer' });
    this.locator_verifiedAlert = page.locator('[role="alert"]').filter({ hasText: 'verified' });
    this.locator_unverifiedAlert = page.locator('[role="alert"]').filter({ hasText: 'unverified' });
  }

  /**
   * Navigate to Account General Information page
   */
  async openUrl() {
    await this.page.goto('/settings/account/general-information');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for form to be ready
   */
  async waitForFormReady() {
    await this.page.waitForSelector('#name', { state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(1000);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Validate page is loaded
   */
  async validatePageLoaded() {
    await expect(this.locator_pageTitle).toBeVisible();
    await expect(this.locator_pageSubtitle).toBeVisible();
    await expect(this.locator_nameField).toBeVisible();
  }

  async enterName(name: string) {
    await this.locator_nameField.fill(name);
  }

  async enterDescription(description: string) {
    await this.locator_descriptionField.fill(description);
  }

  async enterSupportEmail(email: string) {
    await this.locator_supportEmailField.fill(email);
  }

  async enterSlogan(slogan: string) {
    await this.locator_sloganField.fill(slogan);
  }

  async enterLinkedInCompanyId(id: string) {
    await this.locator_linkedinCompanyIdField.fill(id);
  }

  async clickSaveButton() {
    await this.locator_saveButton.click();
  }

  async clearName() {
    await this.locator_nameField.clear();
  }

  async clearDescription() {
    await this.locator_descriptionField.clear();
  }

  async clearSupportEmail() {
    await this.locator_supportEmailField.clear();
  }

  async getName(): Promise<string> {
    return this.locator_nameField.inputValue();
  }

  async getDescription(): Promise<string> {
    return this.locator_descriptionField.inputValue();
  }

  async getSupportEmail(): Promise<string> {
    return this.locator_supportEmailField.inputValue();
  }

  async getSlogan(): Promise<string> {
    return this.locator_sloganField.inputValue();
  }

  async getLinkedInCompanyId(): Promise<string> {
    return this.locator_linkedinCompanyIdField.inputValue();
  }

  /**
   * Get field error element (sibling p.text-red-500)
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
    name?: string;
    description?: string;
    support_email?: string;
    slogan?: string;
    linkedin_company_id?: string;
  }) {
    if (data.name !== undefined) await expect(this.locator_nameField).toHaveValue(data.name);
    if (data.description !== undefined)
      await expect(this.locator_descriptionField).toHaveValue(data.description);
    if (data.support_email !== undefined)
      await expect(this.locator_supportEmailField).toHaveValue(data.support_email);
    if (data.slogan !== undefined) await expect(this.locator_sloganField).toHaveValue(data.slogan);
    if (data.linkedin_company_id !== undefined)
      await expect(this.locator_linkedinCompanyIdField).toHaveValue(data.linkedin_company_id);
  }

  async validateSuccessMessage(message?: string) {
    await expect(this.locator_alertToast.first()).toBeVisible();
    if (message) await expect(this.locator_alertToast.first()).toContainText(message);
  }

  /**
   * Verify that success message does NOT appear (validation prevented submission)
   */
  async validateNoSuccessMessage() {
    // Wait a bit to ensure no success message appears
    await this.page.waitForTimeout(1000);
    const successMessages = this.page
      .locator('[role="alert"]')
      .filter({ hasText: /saved successfully|success/i });
    const count = await successMessages.count();
    // Success message should not be visible
    expect(count).toBe(0);
  }

  /**
   * Save general info with provided fields
   */
  async saveGeneralInfo(data: {
    name: string;
    description?: string;
    support_email?: string;
    slogan?: string;
    linkedin_company_id?: string;
  }) {
    await this.enterName(data.name);
    if (data.description !== undefined) await this.enterDescription(data.description);
    if (data.support_email !== undefined) await this.enterSupportEmail(data.support_email);
    if (data.slogan !== undefined) await this.enterSlogan(data.slogan);
    if (data.linkedin_company_id !== undefined)
      await this.enterLinkedInCompanyId(data.linkedin_company_id);
    await this.clickSaveButton();
  }
}
