import { expect, type Locator, type Page, test } from '@playwright/test';
import { RandomDataGenerator } from '../utils/RandomDataGenerator';
import { teamData } from '../tests/Fixture';

export class TeamPage {
  readonly page: Page;
  readonly randomDataGenerator: RandomDataGenerator;
  readonly locator_profile: Locator;
  readonly locator_teamOption: Locator;
  readonly locator_addNewMemberBtn: Locator;
  readonly locator_searchField: Locator;
  readonly locator_firstNameEditField: Locator;
  readonly locator_firstNameAddField: Locator;
  readonly locator_alertToast: Locator;
  readonly locator_lastNameAddField: Locator;
  readonly locator_lastNameEditField: Locator;
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
  readonly locator_errorMsg: Locator;
  readonly locator_emailColumn: Locator;
  readonly locator_statusColumn: Locator;
  readonly locator_nameColumn: Locator;
  readonly locator_roleColumn: Locator;
  readonly locator_archivedSearchField: Locator;
  readonly locator_activateBtn: Locator;
  readonly locator_deleteBtn: Locator;
  readonly locator_archivedOption: Locator;
  readonly locator_restoreBtn: Locator;
  readonly locator_confirmDeletion: Locator;

  constructor(page: Page) {
    this.page = page;
    this.randomDataGenerator = new RandomDataGenerator();
    this.locator_profile = page.locator(`.text-lg`).first();
    this.locator_teamOption = page.locator(`//*[@href='/settings/team']`);
    this.locator_addNewMemberBtn = page.locator(`//*[@href="/settings/team/add"]`);
    this.locator_firstNameEditField = page.locator(`#first_name`);
    this.locator_firstNameAddField = page.locator(`#firstName`);
    this.locator_lastNameAddField = page.locator(`#lastName`);
    this.locator_lastNameEditField = page.locator(`#last_name`);
    this.locator_emailField = page.locator(`#email`);
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
    this.locator_errorMsg = page.locator(`.text-red-500`);
    this.locator_emailColumn = page.locator(`table tr td:nth-child(3)`);
    this.locator_statusColumn = page.locator(`table tr td:nth-child(4) span`);
    this.locator_nameColumn = page.locator(`tbody tr th div span`);
    this.locator_roleColumn = page.locator(`table tr td:nth-child(2)`);
    this.locator_archivedSearchField = page.getByPlaceholder(`Search`).last();
    this.locator_activateBtn = page.getByRole(`button`, { name: 'Activate' });
    this.locator_deleteBtn = page.getByRole(`button`, { name: 'Delete' });
    this.locator_archivedOption = page.locator(`//*[@href='/settings/archived']`);
    this.locator_restoreBtn = page.getByRole('button', { name: 'Restore' });
    this.locator_confirmDeletion = page.getByRole(`button`, { name: 'Yes, Delete' });
  }

  async enterFirstName(type: string, firstName: string) {
    switch (type) {
      case 'Add':
        await this.locator_firstNameAddField.fill(firstName);
        break;

      case 'Edit':
        await this.locator_firstNameEditField.fill(firstName);
        break;

      default:
        throw new Error('Please enter a valid first name type');
    }
  }

  async clickOnArchivedOption() {
    await this.locator_archivedOption.click();
  }

  async validateArchivedRecords() {
    const [, response] = await Promise.all([
      this.clickOnArchivedOption(),
      this.page.waitForResponse(
        (resp) =>
          resp.url().includes('/api/v1/users') &&
          resp.url().includes('status=archived') &&
          resp.status() === 200,
      ),
    ]);
    const responseBody = await response.json();
    const users = responseBody?.data?.data ?? [];
    const totalCount = responseBody?.data?.meta?.total ?? 0;
    console.log('Archived User Count :', totalCount);

    if (users.length === 0) {
      console.log('No archived users found, creating one...');
      try {
        await this.clickOnProfileOption();
        await this.clickOnTeamOption();
        await this.openActiveMember();
      } catch (error: any) {
        if (error.message === 'NO_ACTIVE_USER_FOUND') {
          test.skip(true, 'Skipping test because no active user found');
        }
        throw error;
      }
      await this.selectUserStatus(teamData.formData.inActiveStatus);
      await this.clickOnEditMemberBtn();
      await this.clickOnProfileOption();
      await this.clickOnArchivedOption();
      return null;
    }
    const firstUserName = users[0]?.full_name;
    console.log('First Archived User Name:', firstUserName);
    return firstUserName;
  }

  async enterLastName(type: string, lastName: string) {
    switch (type) {
      case 'Add':
        await this.locator_lastNameAddField.fill(lastName);
        break;

      case 'Edit':
        await this.locator_lastNameEditField.fill(lastName);
        break;

      default:
        throw new Error('Please enter a valid last name type');
    }
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

  async fetchAddedUser() {
    const response = await Promise.all([
      this.page.waitForResponse(
        (resp) => resp.url().includes('/api/v1/users') && resp.status() === 200,
      ),
      this.clickOnTeamOption(),
    ]);

    const apiResponse = response[0];
    const responseBody = await apiResponse.json();

    const users = responseBody?.data?.data ?? [];

    if (users.length === 0) {
      console.log('No users found in response!');
      return { fullName: null, email: null };
    }

    const firstUser = users[0];
    const fullName = firstUser?.full_name ?? null;
    const email = firstUser?.email ?? null;
    return { fullName, email };
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

  async clickOnSendInviteButton() {
    await this.locator_sendInvitationBtn.click();
  }

  async enterMemberDetails(
    firstName: string,
    lastName: string,
    emailType: string,
    email: string,
    userRole: string,
  ) {
    await this.enterFirstName('Add', firstName);
    await this.enterLastName('Add', lastName);
    await this.enterEmail(emailType, email);
    await this.selectUserRole(userRole);
  }

  async validateFieldError(expectedMsg: string) {
    expect(this.locator_errorMsg).toContainText(expectedMsg);
  }

  async openAddedMember() {
    await this.locator_emailColumn.first().click();
  }

  async clickOnEditMemberBtn() {
    await this.locator_editMemberBtn.click();
  }

  async openActiveMember() {
    await this.page.waitForResponse(
      (resp) => resp.url().includes('users') && resp.status() === 200,
    );
    const addedMembersCount = await this.locator_statusColumn.count();
    for (let i = 0; i < addedMembersCount; i++) {
      const fetchedStatus = await this.locator_statusColumn.nth(i).textContent();
      if (fetchedStatus?.trim() === 'active') {
        await this.locator_statusColumn.nth(i).click();
        return;
      }
    }
    throw new Error('NO_ACTIVE_USER_FOUND');
  }

  async clickOnActivateBtn() {
    await this.locator_activateBtn.first().click();
  }

  async clickOnRestoreBtn() {
    await Promise.all([
      this.locator_restoreBtn.click(),
      this.page.waitForResponse((resp) => resp.url().includes('restore') && resp.status() === 201),
    ]);
  }

  async selectUserStatus(status: string) {
    await this.locator_userStatusDD.selectOption({ label: status });
  }

  async fetchAddedName() {
    const fetchedName = await this.locator_nameColumn.first().textContent();
    return fetchedName;
  }

  async enterSearchCriteria(searchValue: string) {
    await this.locator_searchField.fill(searchValue);
    await this.page.waitForResponse(
      (resp) => resp.url().includes('users') && resp.status() === 200,
    );
  }

  async enterArchivedUserSearchCriteria(searchValue: string) {
    await this.locator_archivedSearchField.fill(searchValue);
    await this.page.waitForResponse(
      (resp) => resp.url().includes('users') && resp.status() === 200,
    );
  }

  async validateArchivedUserSearch(searchValue: string) {
    expect(this.page.locator(`span:has-text("${searchValue}")`).first()).toContainText(searchValue);
    expect(this.page.locator(`span:has-text("${searchValue}")`).last()).toContainText(searchValue);
  }

  async validateUserSearching(searchType: string, searchValue: string) {
    const columnMap: Record<string, Locator> = {
      userName: this.locator_nameColumn,
      email: this.locator_emailColumn,
    };
    const validateSearchResult = columnMap[searchType];
    if (!validateSearchResult) {
      throw new Error(
        `Please select a valid column name to validate the search results : ${searchType}`,
      );
    }
    expect(validateSearchResult.first()).toContainText(searchValue);
    expect(validateSearchResult.last()).toContainText(searchValue);
  }

  async validateUserFilter(filterType: string, selectedFilter: string) {
    const columnMap: Record<string, Locator> = {
      Admin: this.locator_adminFilter,
      Designer: this.locator_designerFilter,
      Manager: this.locator_managerFilter,
    };

    const validateFilterType = columnMap[filterType];

    if (!validateFilterType) {
      throw new Error(
        `Please select a valid column name to validate the search results: ${filterType}`,
      );
    }

    await validateFilterType.click();

    await this.page.waitForResponse(
      (resp) => resp.url().includes('users') && resp.status() === 200,
    );

    const rowCount = await this.locator_roleColumn.count();
    if (rowCount === 0) {
      throw new Error(`No records found for filter type: ${filterType}. Skipping validation.`);
    }
    for (let i = 0; i < rowCount; i++) {
      const text = await this.locator_roleColumn.nth(i).textContent();
      expect(text?.trim()).toBe(selectedFilter);
    }
  }

  async clickOnDeleteBtn() {
    await this.locator_deleteBtn.first().click();
  }

  async validateConfirmDeletion(expectedMessage: string, expectedResponseCode: number) {
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (resp) => resp.url().includes('permanent') && resp.status() === expectedResponseCode,
      ),
      this.locator_confirmDeletion.click(),
    ]);
    console.log('Delete API Status:', response.status());
    await expect(this.locator_alertToast.first()).toContainText(expectedMessage);
  }
}
