import { expect, type Locator, type Page } from '@playwright/test';

export class RegistrationPage {
  readonly page: Page;
  readonly xpath_signupBtn: Locator;
  readonly xpath_firstNameField: Locator;
  readonly xpath_lastNameField: Locator;
  readonly xpath_emailField: Locator;
  readonly xpath_issuerNameField: Locator;
  readonly xpath_issuerWebsiteURLField: Locator;
  readonly xpath_passwordField: Locator;
  readonly xpath_confirmPasswordField: Locator;
  readonly xpath_createNewUserBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.xpath_signupBtn = page.getByRole('link', { name: 'Sign up' });
    this.xpath_firstNameField = page.locator(`#first-name`);
    this.xpath_lastNameField = page.locator(`#last-name`);
    this.xpath_emailField = page.locator(`#your-email`);
    this.xpath_issuerNameField = page.locator(`#issuer-name`);
    this.xpath_issuerWebsiteURLField = page.locator(`#issuer-website-url`);
    this.xpath_passwordField = page.locator(`#password`);
    this.xpath_confirmPasswordField = page.locator(`#confirm-password`);
    this.xpath_createNewUserBtn = page.getByRole(`button`, { name: 'Create New Issuer Account' });
  }

  async clickOnSignupBtn() {
    await this.xpath_signupBtn.click();
  }

  generateRandomEmail(): string {
    const random4Digit = Math.floor(1000 + Math.random() * 9000);
    return `test_${random4Digit}@test.com`;
  }

  generateRandomName(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomSuffix = '';
    for (let i = 0; i < 4; i++) {
      randomSuffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `test_${randomSuffix}issuer`;
  }

  async enterUserEmail() {
    const email = this.generateRandomEmail();
    await this.xpath_emailField.fill(email);
  }

  async enterPassword(password: string) {
    await this.xpath_passwordField.fill(password);
  }

  async enterConfirmPassword(password: string) {
    await this.xpath_confirmPasswordField.fill(password);
  }

  async enterFirstName(firstName: string) {
    await this.xpath_firstNameField.fill(firstName);
  }

  async enterLastName(lastName: string) {
    await this.xpath_lastNameField.fill(lastName);
  }

  async enterIssuerName() {
    const issuerName = this.generateRandomName();
    await this.xpath_issuerNameField.fill(issuerName);
  }

  async enterIssuerWebsiteURL(issuerURL: string) {
    await this.xpath_issuerWebsiteURLField.fill(issuerURL);
  }

  async clickOnCreateNewUserBtn() {
    await this.xpath_createNewUserBtn.click();
  }

  async validateUserRegistration() {
    await expect(this.page).toHaveURL(/\/dashboard/);
  }

  async enterRegistrationFormData(
    firstName: string,
    lastName: string,
    issuerURL: string,
    password: string,
    confirmPassword: string,
  ) {
    await this.enterFirstName(firstName);
    await this.enterLastName(lastName);
    await this.enterUserEmail();
    await this.enterIssuerName();
    await this.enterIssuerWebsiteURL(issuerURL);
    await this.enterPassword(password);
    await this.enterConfirmPassword(confirmPassword);
  }
}
