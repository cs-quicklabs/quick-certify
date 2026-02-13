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
    // Error messages are siblings of the input's parent container
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

  /**
   * Navigate to Profile Settings page
   */
  async openUrl() {
    await this.page.goto('/settings/profile/general');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Navigate to Profile Settings via header dropdown
   */
  async navigateViaHeader() {
    // Wait for nav element to be visible (header is actually a nav element)
    await this.page.waitForSelector('nav', { state: 'visible', timeout: 10000 });

    // Find the avatar button - it's a button with cursor-pointer class inside a div.relative
    // Structure: nav > div.relative.ml-2 > button.cursor-pointer
    const avatarButton = this.page.locator('nav div.relative button.cursor-pointer');

    // Wait for button to be visible and click it
    await avatarButton.waitFor({ state: 'visible', timeout: 10000 });
    await avatarButton.click();

    // Wait for dropdown menu to appear
    await this.page.waitForTimeout(500);

    // Wait for dropdown to appear and click Profile Settings link
    await this.locator_profileSettingsLink.waitFor({ state: 'visible', timeout: 5000 });
    await this.locator_profileSettingsLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Enter first name
   */
  async enterFirstName(firstName: string) {
    await this.locator_firstNameField.fill(firstName);
  }

  /**
   * Enter last name
   */
  async enterLastName(lastName: string) {
    await this.locator_lastNameField.fill(lastName);
  }

  /**
   * Get current first name value
   */
  async getFirstName(): Promise<string> {
    return await this.locator_firstNameField.inputValue();
  }

  /**
   * Get current last name value
   */
  async getLastName(): Promise<string> {
    return await this.locator_lastNameField.inputValue();
  }

  /**
   * Get current email value (read-only field)
   */
  async getEmail(): Promise<string> {
    return await this.locator_emailField.inputValue();
  }

  /**
   * Upload avatar image
   */
  async uploadAvatar(filePath: string) {
    await this.locator_avatarUpload.setInputFiles(filePath);
    // Wait for upload to complete
    await this.page.waitForTimeout(2000);
  }

  /**
   * Click Save button
   */
  async clickSaveButton() {
    await this.locator_saveButton.click();
  }

  /**
   * Save profile settings
   */
  async saveProfile(firstName: string, lastName?: string) {
    await this.enterFirstName(firstName);
    if (lastName !== undefined) {
      await this.enterLastName(lastName);
    }
    await this.clickSaveButton();
  }

  /**
   * Validate success message
   */
  async validateSuccessMessage(message?: string) {
    await expect(this.locator_alertToast.first()).toBeVisible();
    if (message) {
      await expect(this.locator_alertToast.first()).toContainText(message);
    }
  }

  /**
   * Validate error message
   */
  async validateErrorMessage(message: string) {
    await expect(this.locator_alertToast.first()).toContainText(message);
  }

  /**
   * Validate first name field error
   */
  async validateFirstNameError(message: string) {
    // Error message is a sibling paragraph element with class text-red-500
    // Structure: div > div.flex > input, then sibling p.text-red-500
    const errorElement = this.locator_firstNameError;
    await expect(errorElement.first()).toBeVisible({ timeout: 5000 });
    await expect(errorElement.first()).toContainText(message, { timeout: 5000 });
  }

  /**
   * Validate last name field error
   */
  async validateLastNameError(message: string) {
    // Error message is a sibling paragraph element with class text-red-500
    const errorElement = this.locator_lastNameError;
    await expect(errorElement.first()).toBeVisible({ timeout: 5000 });
    await expect(errorElement.first()).toContainText(message, { timeout: 5000 });
  }

  /**
   * Validate page is loaded
   */
  async validatePageLoaded() {
    await expect(this.locator_pageTitle).toBeVisible();
    await expect(this.locator_pageSubtitle).toBeVisible();
    await expect(this.locator_firstNameField).toBeVisible();
  }

  /**
   * Validate field values
   */
  async validateFieldValues(firstName: string, lastName?: string, email?: string) {
    await expect(this.locator_firstNameField).toHaveValue(firstName);
    if (lastName !== undefined) {
      await expect(this.locator_lastNameField).toHaveValue(lastName);
    }
    if (email !== undefined) {
      await expect(this.locator_emailField).toHaveValue(email);
    }
  }

  /**
   * Validate email field is disabled
   */
  async validateEmailFieldDisabled() {
    await expect(this.locator_emailField).toBeDisabled();
  }

  /**
   * Clear first name field
   */
  async clearFirstName() {
    await this.locator_firstNameField.clear();
  }

  /**
   * Clear last name field
   */
  async clearLastName() {
    await this.locator_lastNameField.clear();
  }

  /**
   * Wait for form to be ready
   */
  async waitForFormReady() {
    await this.page.waitForSelector('#firstName', { state: 'visible', timeout: 10000 });
    // Wait a bit for form to fully load with initial values
    await this.page.waitForTimeout(1000);
    await this.page.waitForLoadState('networkidle');
  }
}
