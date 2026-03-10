import { expect, type Locator, type Page } from '@playwright/test';

export class ProfileSettingsPage {
  readonly page: Page;
  readonly locator_firstNameField: Locator;
  readonly locator_lastNameField: Locator;
  readonly locator_emailField: Locator;
  readonly locator_avatarUpload: Locator;
  readonly locator_saveButton: Locator;
  readonly locator_firstNameError: Locator;
  readonly locator_lastNameError: Locator;
  readonly locator_alertToast: Locator;
  readonly locator_profileSettingsLink: Locator;
  readonly locator_pageTitle: Locator;
  readonly locator_pageSubtitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.locator_firstNameField = page.locator('#firstName');
    this.locator_lastNameField = page.locator('#lastName');
    this.locator_emailField = page.locator('#email');
    this.locator_avatarUpload = page.locator('input[type="file"][name="avatarUrl"]');
    this.locator_saveButton = page.getByRole('button', { name: 'Save', exact: true });

    this.locator_firstNameError = page
      .locator('#firstName')
      .locator('..')
      .locator('..')
      .locator('p.text-red-500');
    this.locator_lastNameError = page
      .locator('#lastName')
      .locator('..')
      .locator('..')
      .locator('p.text-red-500');
    this.locator_alertToast = page.getByRole('alert');
    this.locator_profileSettingsLink = page.getByRole('link', { name: 'Profile Settings' });
    this.locator_pageTitle = page
      .locator('h1.form-title, h1')
      .filter({ hasText: 'Profile Settings' });
    this.locator_pageSubtitle = page
      .locator('p')
      .filter({ hasText: 'Change your personal profile settings' });
  }

  async openUrl() {
    await this.page.goto('/settings/profile/general');
    await this.page.waitForLoadState('networkidle');
  }

  async navigateViaHeader() {
    await this.page.waitForSelector('nav', { state: 'visible', timeout: 10000 });

    const avatarButton = this.page.locator('nav div.relative button.cursor-pointer');

    await avatarButton.waitFor({ state: 'visible', timeout: 10000 });
    await avatarButton.click();

    await this.page.waitForTimeout(500);

    await this.locator_profileSettingsLink.waitFor({ state: 'visible', timeout: 5000 });
    await this.locator_profileSettingsLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async enterFirstName(firstName: string) {
    await this.locator_firstNameField.fill(firstName);
  }

  async enterLastName(lastName: string) {
    await this.locator_lastNameField.fill(lastName);
  }

  async getFirstName(): Promise<string> {
    return await this.locator_firstNameField.inputValue();
  }

  async getLastName(): Promise<string> {
    return await this.locator_lastNameField.inputValue();
  }

  async getEmail(): Promise<string> {
    return await this.locator_emailField.inputValue();
  }

  async uploadAvatar(filePath: string) {
    await this.locator_avatarUpload.setInputFiles(filePath);

    await this.page.waitForTimeout(2000);
  }

  async clickSaveButton() {
    await this.locator_saveButton.click();
  }

  async saveProfile(firstName: string, lastName?: string) {
    await this.enterFirstName(firstName);
    if (lastName !== undefined) {
      await this.enterLastName(lastName);
    }
    await this.clickSaveButton();
  }

  async validateSuccessMessage(message?: string) {
    await expect(this.locator_alertToast.first()).toBeVisible();
    if (message) {
      await expect(this.locator_alertToast.first()).toContainText(message);
    }
  }

  async validateErrorMessage(message: string) {
    await expect(this.locator_alertToast.first()).toContainText(message);
  }

  async validateFirstNameError(message: string) {
    const errorElement = this.locator_firstNameError;
    await expect(errorElement.first()).toBeVisible({ timeout: 5000 });
    await expect(errorElement.first()).toContainText(message, { timeout: 5000 });
  }

  async validateLastNameError(message: string) {
    const errorElement = this.locator_lastNameError;
    await expect(errorElement.first()).toBeVisible({ timeout: 5000 });
    await expect(errorElement.first()).toContainText(message, { timeout: 5000 });
  }

  async validatePageLoaded() {
    await expect(this.locator_pageTitle).toBeVisible();
    await expect(this.locator_pageSubtitle).toBeVisible();
    await expect(this.locator_firstNameField).toBeVisible();
  }

  async validateFieldValues(firstName: string, lastName?: string, email?: string) {
    await expect(this.locator_firstNameField).toHaveValue(firstName);
    if (lastName !== undefined) {
      await expect(this.locator_lastNameField).toHaveValue(lastName);
    }
    if (email !== undefined) {
      await expect(this.locator_emailField).toHaveValue(email);
    }
  }

  async validateEmailFieldDisabled() {
    await expect(this.locator_emailField).toBeDisabled();
  }

  async clearFirstName() {
    await this.locator_firstNameField.clear();
  }

  async clearLastName() {
    await this.locator_lastNameField.clear();
  }

  async waitForFormReady() {
    await this.page.waitForSelector('#firstName', { state: 'visible', timeout: 10000 });

    await this.page.waitForTimeout(1000);
    await this.page.waitForLoadState('networkidle');
  }
}
