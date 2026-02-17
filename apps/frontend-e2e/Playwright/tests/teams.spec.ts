import { test, teamData } from './Fixture';

/**
 * Test Case: TM10
 * Description: Verifies the Team Management Functionalities
 * Features Verified :
 * - Team Member Adding
 * - Team Member Searching and Filter
 * - Team Member Editing
 * - Team Member Archiving
 * - Team Member Un-Archiving
 * - Team Member Permanent Deletion
 * - Archived User Searching
 */

let loginPage;
let teamPage;

test.beforeEach(async ({ loginPage: fixtureLoginPage, teamPage: TeamPage }) => {
  loginPage = fixtureLoginPage;
  teamPage = TeamPage;
  await loginPage.openUrl();
  await teamPage.clickOnProfileOption();
});

test.describe('To validate the team management functionalities', () => {
  test('TM101_To verify the functionality of Team Member Adding with valid data', async ({}) => {
    await teamPage.clickOnTeamOption();
    await teamPage.clickOnAddNewMemberBtn();
    await teamPage.enterMemberDetails(
      teamData.formData.firstName,
      teamData.formData.lastName,
      teamData.emailType.valid,
      '',
      teamData.userRoles.admin,
    );
    await teamPage.clickOnSendInviteButton();
    await teamPage.validateAlertMessages(
      teamData.expectedMessages.userAddSuccess,
      teamData.httpCodes.created,
    );
  });

  test('TM102_To verify the functionality of Team Member Adding after entering existing email id', async ({}) => {
    const { email: existingEmail } = await teamPage.fetchAddedUser();
    await teamPage.clickOnAddNewMemberBtn();
    await teamPage.enterMemberDetails(
      teamData.formData.firstName,
      teamData.formData.lastName,
      teamData.emailType.invalid,
      existingEmail,
      teamData.userRoles.admin,
    );
    await teamPage.clickOnSendInviteButton();
    await teamPage.validateAlertMessages(
      teamData.expectedMessages.existingEmail,
      teamData.httpCodes.conflict,
    );
  });

  test('TM103_To verify the functionality of Team Member Adding after entering invalid email', async ({}) => {
    await teamPage.clickOnTeamOption();
    await teamPage.clickOnAddNewMemberBtn();
    await teamPage.enterMemberDetails(
      teamData.formData.firstName,
      teamData.formData.lastName,
      teamData.emailType.invalid,
      teamData.formData.invalidEmail,
      teamData.userRoles.admin,
    );
    await teamPage.clickOnSendInviteButton();
    await teamPage.validateFieldError(teamData.expectedMessages.invalidEmail);
  });

  test('TM104_To verify the functionality of Team Member Adding after leaving role dropdown unselected', async ({}) => {
    await teamPage.clickOnTeamOption();
    await teamPage.clickOnAddNewMemberBtn();
    await teamPage.enterFirstName('Add', teamData.formData.firstName);
    await teamPage.enterLastName('Add', teamData.formData.lastName);
    await teamPage.enterEmail(teamData.emailType.valid, '');
    await teamPage.clickOnSendInviteButton();
    await teamPage.validateFieldError(teamData.expectedMessages.blankRole);
  });

  test('TM105_To verify the functionality of Team Member Details Editing', async ({}) => {
    await teamPage.clickOnTeamOption();
    await teamPage.openAddedMember();
    await teamPage.enterFirstName('Edit', teamData.formData.updatedFirstName);
    await teamPage.enterLastName('Edit', teamData.formData.updatedLastName);
    await teamPage.enterEmail(teamData.emailType.valid, '');
    await teamPage.clickOnEditMemberBtn();
    await teamPage.validateAlertMessages(
      teamData.expectedMessages.updateSuccess,
      teamData.httpCodes.ok,
    );
  });

  test('TM106_To verify the functionality of Team Member DeActivating', async ({}) => {
    await teamPage.clickOnTeamOption();
    try {
      await teamPage.openActiveMember();
    } catch (error) {
      if (error.message === 'NO_ACTIVE_USER_FOUND') {
        test.skip(true, 'Skipping test because no active user found');
      }
      throw error;
    }
    await teamPage.selectUserStatus(teamData.formData.activeStatus);
    await teamPage.clickOnEditMemberBtn();
    await teamPage.validateAlertMessages(
      teamData.expectedMessages.updateSuccess,
      teamData.httpCodes.ok,
    );
  });

  test('TM107_To verify the search functionality of Team Member with user name', async ({}) => {
    const { fullName: addedName } = await teamPage.fetchAddedUser();
    await teamPage.enterSearchCriteria(addedName);
    await teamPage.validateUserSearching(teamData.searchType.name, addedName);
  });

  test('TM108_To verify the search functionality of Team Member with user email', async ({}) => {
    const { email: addedEmail } = await teamPage.fetchAddedUser();
    await teamPage.enterSearchCriteria(addedEmail);
    await teamPage.validateUserSearching(teamData.searchType.email, addedEmail);
  });

  test('TM109_To verify the filter functionality of Team Member with Admin Role', async ({}) => {
    await teamPage.clickOnTeamOption();
    try {
      await teamPage.validateUserFilter(teamData.filterType.admin, teamData.filterType.admin);
    } catch (error: any) {
      if (error.message.includes('No records found')) {
        test.skip(true, 'Skipping because no records were found for this filter');
      }
      throw error;
    }
  });

  test('TM110_To verify the filter functionality of Team Member with Designer Role', async ({}) => {
    await teamPage.clickOnTeamOption();
    try {
      await teamPage.validateUserFilter(teamData.filterType.designer, teamData.filterType.designer);
    } catch (error: any) {
      if (error.message.includes('No records found')) {
        test.skip(true, 'Skipping because no records were found for this filter');
      }
      throw error;
    }
  });

  test('TM111_To verify the filter functionality of Team Member with Manager Role', async ({}) => {
    await teamPage.clickOnTeamOption();
    try {
      await teamPage.validateUserFilter(teamData.filterType.manager, teamData.filterType.manager);
    } catch (error: any) {
      if (error.message.includes('No records found')) {
        test.skip(true, 'Skipping because no records were found for this filter');
      }
      throw error;
    }
  });

  test('TM112_To verify the Archived user search functionality', async ({}) => {
    await teamPage.clickOnArchivedOption();
    const searchName = await teamPage.validateArchivedRecords();
    await teamPage.enterArchivedUserSearchCriteria(searchName);
    await teamPage.validateArchivedUserSearch(searchName);
  });

  test('TM113_To verify the Archived user Activation', async ({}) => {
    await teamPage.clickOnArchivedOption();
    await teamPage.validateArchivedRecords();
    await teamPage.clickOnActivateBtn();
    await teamPage.clickOnRestoreBtn();
    await teamPage.validateAlertMessages(
      teamData.expectedMessages.restoreSuccess,
      teamData.httpCodes.ok,
    );
  });

  test('TM114_To verify the user Permanent Deletion', async ({}) => {
    await teamPage.clickOnArchivedOption();
    await teamPage.validateArchivedRecords();
    await teamPage.clickOnDeleteBtn();
    await teamPage.validateConfirmDeletion(
      teamData.expectedMessages.deleteSuccess,
      teamData.httpCodes.ok,
    );
  });
});
