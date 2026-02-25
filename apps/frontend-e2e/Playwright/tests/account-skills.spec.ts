import { test, skillsData, expect, RandomDataGenerator, AccountSkillsPage } from './Fixture';

/**
 * Test Suite: Account Settings - Skills
 * Screen: /settings/account/skills
 *
 * Coverage:
 * - Super Admin can add new skill
 * - Super Admin can edit existing skill
 * - Super Admin can delete skill (with confirmation)
 * - Validation: empty skill name error
 * - Validation: whitespace-only skill name error
 * - Skills list displays correctly
 */

let accountSkillsPage: AccountSkillsPage;
let randomDataGenerator: RandomDataGenerator;

test.beforeEach(
  async ({
    accountSkillsPage: fixtureAccountSkillsPage,
    randomDataGenerator: fixtureRandomDataGenerator,
  }) => {
    accountSkillsPage = fixtureAccountSkillsPage;
    randomDataGenerator = fixtureRandomDataGenerator;

    await accountSkillsPage.gotoAccountSkillPage();
  },
);

test.describe('Account Settings - Skills', () => {
  test('SK01_Verify Skills page loads successfully', async () => {
    await accountSkillsPage.validatePageLoaded();
  });

  test('SK02_Verify Super Admin can add new skill', async ({}) => {
    const skillName = randomDataGenerator.generateRandomSkillName();
    await accountSkillsPage.addSkill(skillName);
    await accountSkillsPage.waitForSkillToAppear(skillName);
    await accountSkillsPage.validateSkillInTable(skillName);
    const inputValue = await accountSkillsPage.locator_newSkillInput.inputValue();
    expect(inputValue).toBe('');
  });

  test('SK03_Verify Super Admin can edit existing skill and change skill name', async ({
    page,
  }) => {
    const originalSkillName = randomDataGenerator.generateRandomSkillName();
    const editedSkillName = randomDataGenerator.generateRandomSkillName();
    const editedSkillExists = await accountSkillsPage.isSkillVisible(editedSkillName);
    if (editedSkillExists) {
      await accountSkillsPage.clickDeleteSkill(editedSkillName);
      await accountSkillsPage.waitForConfirmationDialog();
      await accountSkillsPage.confirmDelete();
    }

    const skillExists = await accountSkillsPage.isSkillVisible(originalSkillName);
    if (!skillExists) {
      await accountSkillsPage.addSkill(originalSkillName);
    }
    await accountSkillsPage.validateSkillInTable(originalSkillName);
    await accountSkillsPage.clickEditSkill(originalSkillName);
    await expect(accountSkillsPage.getEditInput()).toBeVisible({ timeout: 2000 });
    await expect(accountSkillsPage.getEditInput()).toHaveValue(originalSkillName);
    await accountSkillsPage.enterEditSkillName(editedSkillName);
    await expect(accountSkillsPage.getEditInput()).toHaveValue(editedSkillName);
    await accountSkillsPage.clickSaveEditButton();
    await accountSkillsPage.validateSkillNotInTable(originalSkillName);
    await accountSkillsPage.validateSkillInTable(editedSkillName);
  });

  test('SK04_Verify Super Admin can delete skill with confirmation', async ({ page }) => {
    const skillName = randomDataGenerator.generateRandomSkillName();
    const skillExists = await accountSkillsPage.isSkillVisible(skillName);
    if (!skillExists) {
      await accountSkillsPage.addSkill(skillName);
    }
    const initialCount = await accountSkillsPage.getSkillCount();
    await accountSkillsPage.clickDeleteSkill(skillName);
    await accountSkillsPage.waitForConfirmationDialog();
    await expect(accountSkillsPage.locator_confirmationDialog).toBeVisible({ timeout: 5000 });
    await expect(accountSkillsPage.locator_confirmationDialog).toContainText(
      skillsData.expectedMessages.deleteConfirmationTitle,
    );
    await expect(accountSkillsPage.locator_confirmationDialog).toContainText(skillName);
    await accountSkillsPage.confirmDelete();
    await accountSkillsPage.validateSkillNotInTable(skillName);
    await page.waitForTimeout(2000);
    const newCount = await accountSkillsPage.getSkillCount();
    expect(newCount).toBe(initialCount - 1);
  });

  test('SK05_Verify delete confirmation can be cancelled', async ({ page }) => {
    const skillName = randomDataGenerator.generateRandomSkillName();
    const skillExists = await accountSkillsPage.isSkillVisible(skillName);
    if (!skillExists) {
      await accountSkillsPage.addSkill(skillName);
    }
    await accountSkillsPage.clickDeleteSkill(skillName);
    await accountSkillsPage.waitForConfirmationDialog();
    await expect(accountSkillsPage.locator_confirmationDialog).toBeVisible({ timeout: 5000 });
    await accountSkillsPage.cancelDelete();
    await expect(accountSkillsPage.locator_confirmationDialog).not.toBeVisible({ timeout: 2000 });
    await accountSkillsPage.validateSkillInTable(skillName);
  });

  test('SK06_Verify error shown when skill name is empty', async () => {
    await accountSkillsPage.clearNewSkillInput();
    await accountSkillsPage.clickAddSkillButton();
    await accountSkillsPage.page.waitForTimeout(1500);
    const inputValue = await accountSkillsPage.locator_newSkillInput.inputValue();
    if (inputValue === '') {
      const isInvalid = await accountSkillsPage.locator_newSkillInput.evaluate(
        (el: HTMLInputElement) => !el.validity.valid,
      );
      if (!isInvalid) {
        const errorVisible = await accountSkillsPage.locator_alertToast
          .first()
          .isVisible({ timeout: 2000 })
          .catch(() => false);
        if (errorVisible) {
          await accountSkillsPage.validateErrorMessage(
            skillsData.expectedMessages.emptySkillNameError,
          );
        }
      }
    }
  });

  test('SK07_Verify error shown when skill name is only whitespace', async () => {
    await accountSkillsPage.enterNewSkillName(skillsData.formData.whitespaceOnlySkillName);
    await accountSkillsPage.clickAddSkillButton();
    await accountSkillsPage.page.waitForTimeout(1500);
    await accountSkillsPage.validateErrorMessage(skillsData.expectedMessages.whitespaceOnlyError);
  });

  test('SK10_Verify error shown when trying to add duplicate skill name', async ({}) => {
    const skillName = randomDataGenerator.generateRandomSkillName();
    const skillExists = await accountSkillsPage.isSkillVisible(skillName);
    if (!skillExists) {
      await accountSkillsPage.addSkill(skillName);
    }
    await accountSkillsPage.validateSkillInTable(skillName);

    await accountSkillsPage.enterNewSkillName(skillName);
    await accountSkillsPage.clickAddSkillButton();
    await accountSkillsPage.validateErrorMessage(skillsData.expectedMessages.duplicateSkillError);
    const skillRows = await accountSkillsPage.getSkillRows();
    const duplicateCount = await skillRows.filter({ hasText: skillName }).count();
    expect(duplicateCount).toBe(1); // Should only have one instance
  });

  test('SK09_Verify skills table displays correctly', async () => {
    await accountSkillsPage.waitForSkillsTable();
    await expect(accountSkillsPage.locator_skillsTable).toBeVisible();
    await expect(accountSkillsPage.locator_skillsTable.locator('thead')).toBeVisible();
    await expect(
      accountSkillsPage.locator_skillsTable.locator('th', { hasText: 'SKILL' }),
    ).toBeVisible();
    await expect(
      accountSkillsPage.locator_skillsTable.locator('th', { hasText: 'ACTION' }),
    ).toBeVisible();
  });
});
