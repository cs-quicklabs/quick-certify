import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly locator_emailField: Locator;
  readonly locator_passwordField: Locator;
  readonly locator_signinBtn: Locator;
  readonly locator_eyeIcon: Locator;
  readonly locator_rememberMeCheckBox: Locator;
  readonly locator_alertToast: Locator;
  readonly locator_emailFieldError: Locator;
  readonly locator_passwordFieldError: Locator;
  readonly locator_forgotPassword: Locator;

  constructor(page: Page) {
    this.page = page;
    this.locator_emailField = page.locator(`#your-email`);
    this.locator_passwordField = page.locator(`#password`);
    this.locator_signinBtn = page.getByRole('button', { name: 'Sign in', exact: true });
    this.locator_eyeIcon = page.locator('.absolute');
    this.locator_rememberMeCheckBox = page.locator(`#remember-me`);
    this.locator_forgotPassword = page.getByRole('link', { name: 'Forgot password?' });
    this.locator_alertToast = page.getByRole('alert');
    this.locator_emailFieldError = page.locator(`#your-email-error`);
    this.locator_passwordFieldError = page.locator(`#password-error`);
  }

  async openUrl() {
    await this.page.goto('/login');
  }

  async validateUserLogin() {
    await Promise.all([
      this.clickOnSigninBtn(),
      this.page.waitForResponse((resp) => resp.url().includes('login') && resp.status() === 200),
    ]);
    await expect(this.page).toHaveURL(/dashboard/);
  }

  async enterUserEmail(email: string) {
    await this.locator_emailField.fill(email);
  }

  async enterPassword(password: string) {
    await this.locator_passwordField.fill(password);
  }

  async clickOnEyeIcon() {
    await this.locator_eyeIcon.click();
  }

  async checkRememberMeCheckBox() {
    await this.locator_rememberMeCheckBox.click();
  }

  async clickOnSigninBtn() {
    await this.locator_signinBtn.click();
  }

  async validateAlertMessage(message: string) {
    await expect(this.locator_alertToast.first()).toContainText(message);
  }

  async validateEmailFieldError(message: string) {
    await expect(this.locator_emailFieldError.first()).toContainText(message);
  }

  async validatePasswordFieldError(message: string) {
    await expect(this.locator_passwordFieldError.first()).toContainText(message);
  }

  async validateEyeIconEnabling() {
    await this.page.waitForTimeout(500);
    const inputType = this.locator_passwordField;
    await expect(inputType).toHaveAttribute('type', 'text');
  }

  async validatePasswordEncryption() {
    await this.page.waitForTimeout(500);
    const inputType = this.locator_passwordField;
    await expect(inputType).toHaveAttribute('type', 'password');
  }

  async login(email: string, password: string) {
    await this.openUrl();
    await this.enterUserEmail(email);
    await this.enterPassword(password);
    await this.clickOnSigninBtn();
    await this.page.waitForURL('**/dashboard');
  }
}
