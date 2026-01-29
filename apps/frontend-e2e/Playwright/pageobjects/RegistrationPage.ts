import { expect, type Locator, type Page } from '@playwright/test';
import { RandomDataGenerator } from '../utils/RandomDataGenerator';

export class RegistrationPage {
  readonly page: Page;
  readonly testData: RandomDataGenerator;
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
    this.testData = new RandomDataGenerator();
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

  async enterUserEmail() {
    const email = this.testData.generateRandomEmail();
    await this.locator_emailField.fill(email);
  }
  async enterexistingUserEmail(email: string) {

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

  async enterIssuerName() {
    const issuerName = this.testData.generateRandomName();
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
  async validateRegisterationwithexistingEmail(
    firstName: string,
    lastName: string,
    email: string,
    issuerURL: string,
    password: string,
    confirmPassword: string,
  ) {
    await this.enterFirstName(firstName);
    await this.enterLastName(lastName);
    await this.enterexistingUserEmail(email);
    await this.enterIssuerName();
    await this.enterIssuerWebsiteURL(issuerURL);
    await this.enterPassword(password);
    await this.enterConfirmPassword(confirmPassword);
  }
}
