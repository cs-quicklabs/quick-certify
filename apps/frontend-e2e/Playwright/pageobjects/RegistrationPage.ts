import { expect, type Locator, type Page } from '@playwright/test';

export class RegistrationPage {
  readonly page: Page;
  readonly locator_signupBtn: Locator;
  readonly locator_firstNameField: Locator;
  readonly locator_lastNameField: Locator;
  readonly locator_emailField: Locator;
  readonly locator_issuerNameField: Locator;
  readonly locator_issuerWebsiteURLField: Locator;
  readonly locator_passwordField: Locator;
  readonly locator_confirmPasswordField: Locator;
  readonly locator_createNewUserBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.locator_signupBtn = page.getByRole('link', { name: 'Sign up' });
    this.locator_firstNameField = page.locator(`#first-name`);
    this.locator_lastNameField = page.locator(`#last-name`);
    this.locator_emailField = page.locator(`#your-email`);
    this.locator_issuerNameField = page.locator(`#issuer-name`);
    this.locator_issuerWebsiteURLField = page.locator(`#issuer-website-url`);
    this.locator_passwordField = page.locator(`#password`);
    this.locator_confirmPasswordField = page.locator(`#confirm-password`);
    this.locator_createNewUserBtn = page.getByRole(`button`, { name: 'Create New Issuer Account' });
  }

  async clickOnSignupBtn() {
    await this.locator_signupBtn.click();
  }

  async enterUserEmail(email: string) {
    await this.locator_emailField.fill(email);
  }

  async enterPassword(password: string) {
    await this.locator_passwordField.fill(password);
  }

  async enterConfirmPassword(password: string) {
    await this.locator_confirmPasswordField.fill(password);
  }

  async enterFirstName(firstName: string) {
    await this.locator_firstNameField.fill(firstName);
  }

  async enterLastName(lastName: string) {
    await this.locator_lastNameField.fill(lastName);
  }

  async enterIssuerName(issuerName: string) {
    await this.locator_issuerNameField.fill(issuerName);
  }

  async enterIssuerWebsiteURL(issuerURL: string) {
    await this.locator_issuerWebsiteURLField.fill(issuerURL);
  }

  async clickOnCreateNewUserBtn() {
    await this.locator_createNewUserBtn.click();
  }

  async validateUserRegistration() {
    await expect(this.page).toHaveURL(/\/dashboard/);
  }

  async fillRegistrationFormData(
    firstName: string,
    lastName: string,
    email: string,
    issuerName: string,
    issuerUrl: string,
    password: string,
    confirmPassword: string,
  ) {
    await this.enterFirstName(firstName);
    await this.enterLastName(lastName);
    await this.enterUserEmail(email);
    await this.enterIssuerName(issuerName);
    await this.enterIssuerWebsiteURL(issuerUrl);
    await this.enterPassword(password);
    await this.enterConfirmPassword(confirmPassword);
  }
}
