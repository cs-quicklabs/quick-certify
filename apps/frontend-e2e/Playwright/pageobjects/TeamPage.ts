import { expect, type Locator, type Page } from '@playwright/test';
import { RandomDataGenerator } from '../utils/RandomDataGenerator';

export class TeamPage {
  readonly page: Page;
  readonly randomDataGenerator: RandomDataGenerator;
  readonly locator_profile: Locator;
  readonly locator_teamOption: Locator;
  readonly locator_addNewMemberBtn: Locator;
  readonly locator_searchField: Locator;
  readonly locator_firstNameField: Locator;
  readonly locator_alertToast: Locator;
  readonly locator_lastNameField: Locator;
  readonly locator_emailField: Locator;
  readonly locator_userRoleDD: Locator;
  readonly locator_sendInvitationBtn: Locator;
  readonly locator_cancelBtn: Locator;
  readonly locator_adminFilter: Locator;
  readonly locator_designerFilter: Locator;
  readonly locator_managerFilter: Locator;
  readonly locator_userStatusDD: Locator;
  readonly locator_editMemberBtn: Locator;
  readonly locator_showAllBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.randomDataGenerator = new RandomDataGenerator();
    this.locator_profile = page.locator(`.text-lg`).first();
    this.locator_teamOption = page.locator(`//*[@href='/settings/team']`);
    this.locator_addNewMemberBtn = page.getByRole('button', { name: 'Add new member' });
    this.locator_firstNameField = page.locator(`//*[@name='firstName']`);
    this.locator_lastNameField = page.locator(`//*[@name='lastName']`);
    this.locator_emailField = page.locator(`//*[@name='email']`);
    this.locator_userRoleDD = page.locator(`#roleId`);
    this.locator_sendInvitationBtn = page.getByRole(`button`, { name: 'Send Invitation' });
    this.locator_cancelBtn = page.getByRole(`button`, { name: 'Cancel' });
    this.locator_searchField = page.getByPlaceholder('Search members...');
    this.locator_alertToast = page.getByRole('alert');
    this.locator_adminFilter = page.locator(`#role-admin`);
    this.locator_designerFilter = page.locator(`#role-designer`);
    this.locator_managerFilter = page.locator(`#role-manager`);
    this.locator_userStatusDD = page.locator(`#status`);
    this.locator_editMemberBtn = page.getByRole('button', { name: 'Edit Member' });
    this.locator_showAllBtn = page.getByRole('button', { name: 'Show All' });
  }

  async enterFirstName(firstName: string) {
    await this.locator_firstNameField.fill(firstName);
  }

  async enterLastName(lastName: string) {
    await this.locator_lastNameField.fill(lastName);
  }

  async enterEmail(emailType: string, email: string) {
    switch (emailType) {
      case 'Valid': {
        const validEmail = this.randomDataGenerator.generateRandomEmail();
        await this.locator_emailField.fill(validEmail);
        break;
      }

      case 'Invalid': {
        await this.locator_emailField.fill(email);
        break;
      }

      case 'Blank': {
        await this.locator_emailField.fill('');
        break;
      }

      default: {
        throw new Error('Please select a valid email type');
      }
    }
  }

  async clickOnAddNewMemberBtn() {
    await this.locator_addNewMemberBtn.click();
  }

  async clickOnProfileOption() {
    await this.locator_profile.click();
  }

  async clickOnTeamOption() {
    await this.locator_teamOption.click();
  }

  async selectUserRole(userRole: string) {
    await this.locator_userRoleDD.selectOption({ label: userRole });
  }

  async validateAlertMessages(expectedMsg: string, expectedResponseCode: number) {
    await Promise.all([
      expect(this.locator_alertToast.first()).toContainText(expectedMsg),
      this.page.waitForResponse(
        (resp) => resp.url().includes('users') && resp.status() === expectedResponseCode,
      ),
    ]);
  }
}
