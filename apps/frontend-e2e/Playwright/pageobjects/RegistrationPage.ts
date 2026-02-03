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
  readonly locator_firstNameFieldError: Locator;
  readonly locator_lastNameFieldError: Locator;
  readonly locator_emailFieldError: Locator;
  readonly locator_issuerNameFieldError: Locator;
  readonly locator_issuerWebsiteFieldError: Locator;
  readonly locator_passwordFieldError: Locator;
  readonly locator_confirmPasswordFieldError: Locator;
  readonly locator_alert: Locator;

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
    this.locator_firstNameFieldError = page.locator(`#first-name-error`);
    this.locator_lastNameFieldError = page.locator(`#last-name-error`);
    this.locator_emailFieldError = page.locator(`#your-email-error`);
    this.locator_issuerNameFieldError = page.locator(`#issuer-name-error`);
    this.locator_issuerWebsiteFieldError = page.locator(`#issuer-website-url-error`);
    this.locator_passwordFieldError = page.locator(`#password-error`);
    this.locator_confirmPasswordFieldError = page.locator(`#confirm-password-error`);
    this.locator_alert = page.getByRole(`alert`);
  }

  async validateFieldErrors(fieldName: string, expectedError: string) {
    const fieldMap: Record<string, Locator> = {
      firstName: this.locator_firstNameFieldError,
      lastName: this.locator_lastNameFieldError,
      email: this.locator_emailFieldError,
      issuerName: this.locator_issuerNameFieldError,
      issuerWebsite: this.locator_issuerWebsiteFieldError,
      password: this.locator_passwordFieldError,
      confirmPassword: this.locator_confirmPasswordFieldError,
    };
    const validatedField = fieldMap[fieldName];
    if (!validatedField) {
      throw new Error(
        `Please select a valid field name to validate the error message : ${fieldName}`,
      );
    }
    expect(validatedField).toContainText(expectedError);
  }

  async validateAlertMessages(expectedMsg: string) {
    await Promise.all([
      expect(this.locator_alert.first()).toContainText(expectedMsg),
      this.page.waitForResponse((resp) => resp.url().includes('register') && resp.status() === 422),
    ]);
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
    await Promise.all([
      this.clickOnCreateNewUserBtn(),
      this.page.waitForResponse((resp) => resp.url().includes('register') && resp.status() === 201),
    ]);
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
