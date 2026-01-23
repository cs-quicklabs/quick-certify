import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly xpath_emailField: Locator;
  readonly xpath_passwordField: Locator;
  readonly xpath_signinBtn: Locator;
  readonly xpath_eyeIcon: Locator;
  readonly xpath_rememberMeCheckBox: Locator;
  readonly xpath_alertToast: Locator;
  readonly xpath_emailFieldError: Locator;
  readonly xpath_passwordFieldError: Locator;
  readonly xpath_forgotPassowrd: Locator;

  constructor(page: Page) {
    this.page = page;
    this.xpath_emailField = page.locator(`#your-email`);
    this.xpath_passwordField = page.locator(`#password`);
    this.xpath_signinBtn = page.getByRole('button', { name: 'Sign in' });
    this.xpath_eyeIcon = page.locator('..absolute');
    this.xpath_rememberMeCheckBox = page.locator(`#remember-me`);
    this.xpath_forgotPassowrd = page.getByRole('link', { name: 'Forgot password?' });
    this.xpath_alertToast = page.getByRole('alert');
    this.xpath_emailFieldError = page.locator(`#your-email-error`);
    this.xpath_passwordFieldError = page.locator(`#password-error`);
  }

  async openUrl() {
    const url = process.env.BASE_URL;
    if (!url) {
      throw new Error('BASE_URL is not defined in the environment variables');
    }
    await this.page.goto(url);
  }

  async enterUserEmail(email: string) {
    await this.xpath_emailField.fill(email);
  }

  async enterPassword(password: string) {
    await this.xpath_passwordField.fill(password);
  }

  async clickOnEyeIcon() {
    await this.xpath_eyeIcon.click();
  }

  async checkRememberMeCheckBox() {
    await this.xpath_rememberMeCheckBox.click();
  }

  async clickOnSigninBtn() {
    await this.xpath_signinBtn.click();
  }

  async validateAlertMessage(message: string) {
    await expect(this.xpath_alertToast).toBeVisible({ timeout: 5000 });
    await expect(this.xpath_alertToast).toContainText(message);
  }

  async validateInvalidEmailError(message: string) {
    await expect(this.xpath_emailFieldError.first()).toContainText(message);
  }

  async validateInvalidPasswordError(message: string) {
    await expect(this.xpath_passwordFieldError.first()).toContainText(message);
  }

  async validateEyeIconEnabling() {
    await this.page.waitForTimeout(500);
    const inputType = this.xpath_passwordField;
    await expect(inputType).toHaveAttribute('type', 'text');
  }

  async validatePasswordEncryption() {
    await this.page.waitForTimeout(500);
    const inputType = this.xpath_passwordField;
    await expect(inputType).toHaveAttribute('type', 'password');
  }

  async login(email: string, password: string) {
    await this.openUrl();
    await this.enterUserEmail(email);
    await this.enterPassword(password);
    await this.clickOnSigninBtn();
  }
}
