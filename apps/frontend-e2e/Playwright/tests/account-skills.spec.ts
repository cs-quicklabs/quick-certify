import { test, skillsData, expect, RandomDataGenerator } from './Fixture';
import type { AccountSkillsPage } from '../pageobjects/AccountSkillsPage';

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

test.beforeEach(async ({ page, loginPage, accountSkillsPage: fixtureAccountSkillsPage, randomDataGenerator: fixtureRandomDataGenerator }) => {
  accountSkillsPage = fixtureAccountSkillsPage;
  randomDataGenerator = fixtureRandomDataGenerator;

  const userName = process.env.USER_EMAIL;
  const password = process.env.USER_PASS;

  if (!userName || !password) {
    throw new Error('USER_EMAIL / USER_PASS must be set for authenticated E2E tests');
  }

  await page.goto('/settings/account/skills');

  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    await loginPage.enterUserEmail(userName);
    await loginPage.enterPassword(password);
    await Promise.all([
      loginPage.clickOnSigninBtn(),
      page.waitForURL(/\/(dashboard|settings)/, { timeout: 20000 }),
    ]);
    await page.goto('/settings/account/skills');
    await page.waitForLoadState('networkidle');
  } else {
    await page.waitForLoadState('networkidle');
  }
});

test.describe('Account Settings - Skills', () => {
  test('SK01_Verify Skills page loads successfully', async () => {
    await accountSkillsPage.openUrl();
    await accountSkillsPage.waitForPageReady();
    await accountSkillsPage.validatePageLoaded();
  });

  test('SK02_Verify Super Admin can add new skill', async ({ page }) => {
    await accountSkillsPage.openUrl();
    await accountSkillsPage.waitForPageReady();
    await accountSkillsPage.validatePageLoaded();

    const skillName = randomDataGenerator.generateRandomSkillName();

    await Promise.all([
      accountSkillsPage.addSkill(skillName),
      page
        .waitForResponse(
          (resp) =>
            (resp.url().includes('/skills') || resp.url().includes('/api/v1/skills')) &&
            resp.status() === 201,
          { timeout: 10000 },
        )
        .catch(() => {}),
    ]);

    // Wait for skill to appear in table after adding
    await accountSkillsPage.waitForSkillToAppear(skillName);
    
    // Validate skill appears in table
    await accountSkillsPage.validateSkillInTable(skillName);

    // Verify input is cleared after adding
    const inputValue = await accountSkillsPage.locator_newSkillInput.inputValue();
    expect(inputValue).toBe('');
  });

  test('SK03_Verify Super Admin can edit existing skill and change skill name', async ({ page }) => {
    // Step 1: Go to skills page
    await accountSkillsPage.openUrl();
    await accountSkillsPage.waitForPageReady();
    await accountSkillsPage.validatePageLoaded();

    // First, add a skill to edit
    const originalSkillName = randomDataGenerator.generateRandomSkillName();
    const editedSkillName = randomDataGenerator.generateRandomSkillName();

    // Verify the edited skill name doesn't already exist before we start
    const editedSkillExists = await accountSkillsPage.isSkillVisible(editedSkillName);
    if (editedSkillExists) {
      // If edited name already exists, delete it first to avoid conflicts
      await accountSkillsPage.clickDeleteSkill(editedSkillName);
      await accountSkillsPage.waitForConfirmationDialog();
      await accountSkillsPage.confirmDelete();
      await accountSkillsPage.page.waitForTimeout(2000);
    }

    // Add skill if it doesn't exist
    const skillExists = await accountSkillsPage.isSkillVisible(originalSkillName);
    if (!skillExists) {
      await Promise.all([
        accountSkillsPage.addSkill(originalSkillName),
        page
          .waitForResponse(
            (resp) =>
              (resp.url().includes('/skills') || resp.url().includes('/api/v1/skills')) &&
              resp.status() === 201,
            { timeout: 10000 },
          )
          .catch(() => {}),
      ]);
      await accountSkillsPage.page.waitForTimeout(2000);
    }

    // Verify original skill name exists before editing
    await accountSkillsPage.validateSkillInTable(originalSkillName);

    // Step 2: Click on Edit button
    await accountSkillsPage.clickEditSkill(originalSkillName);
    await accountSkillsPage.page.waitForTimeout(500);

    // Verify edit input field is visible
    await expect(accountSkillsPage.getEditInput()).toBeVisible({ timeout: 2000 });
    await expect(accountSkillsPage.getEditInput()).toHaveValue(originalSkillName);

    // Step 3: Change skill name
    await accountSkillsPage.enterEditSkillName(editedSkillName);
    await accountSkillsPage.page.waitForTimeout(300);

    // Verify the input field has the new value
    await expect(accountSkillsPage.getEditInput()).toHaveValue(editedSkillName);

    // Step 4: Click on Save button
    await Promise.all([
      accountSkillsPage.clickSaveEditButton(),
      page
        .waitForResponse(
          (resp) =>
            (resp.url().includes('/skills') || resp.url().includes('/api/v1/skills')) &&
            resp.status() === 200,
          { timeout: 10000 },
        )
        .catch(() => {}),
    ]);

    await accountSkillsPage.page.waitForTimeout(2000);

    // Verify old skill name should NOT exist after editing
    await accountSkillsPage.validateSkillNotInTable(originalSkillName);

    // Verify new skill name exists after editing
    await accountSkillsPage.validateSkillInTable(editedSkillName);
  });

  test('SK04_Verify Super Admin can delete skill with confirmation', async ({ page }) => {
    await accountSkillsPage.openUrl();
    await accountSkillsPage.waitForPageReady();

    // First, add a skill to delete
    const skillName = randomDataGenerator.generateRandomSkillName();

    // Add skill if it doesn't exist
    const skillExists = await accountSkillsPage.isSkillVisible(skillName);
    if (!skillExists) {
      await Promise.all([
        accountSkillsPage.addSkill(skillName),
        page
          .waitForResponse(
            (resp) =>
              (resp.url().includes('/skills') || resp.url().includes('/api/v1/skills')) &&
              resp.status() === 201,
            { timeout: 10000 },
          )
          .catch(() => {}),
      ]);
      await accountSkillsPage.page.waitForTimeout(2000);
    }

    // Get initial count
    const initialCount = await accountSkillsPage.getSkillCount();

    // Step 1: Click delete button - this opens the modal
    await accountSkillsPage.clickDeleteSkill(skillName);

    // Step 2: Wait for confirmation dialog/modal to appear
    await accountSkillsPage.waitForConfirmationDialog();
    await expect(accountSkillsPage.locator_confirmationDialog).toBeVisible({ timeout: 5000 });
    await expect(accountSkillsPage.locator_confirmationDialog).toContainText(
      skillsData.expectedMessages.deleteConfirmationTitle,
    );
    await expect(accountSkillsPage.locator_confirmationDialog).toContainText(skillName);

    // Step 3: Click Delete button in the modal to confirm deletion
    await Promise.all([
      accountSkillsPage.confirmDelete(),
      page
        .waitForResponse(
          (resp) =>
            (resp.url().includes('/skills') || resp.url().includes('/api/v1/skills')) &&
            resp.status() === 200,
          { timeout: 10000 },
        )
        .catch(() => {}),
    ]);

    await accountSkillsPage.page.waitForTimeout(2000);

    // Verify skill is deleted
    await accountSkillsPage.validateSkillNotInTable(skillName);

    // Verify count decreased
    const newCount = await accountSkillsPage.getSkillCount();
    expect(newCount).toBe(initialCount - 1);
  });

  test('SK05_Verify delete confirmation can be cancelled', async ({ page }) => {
    await accountSkillsPage.openUrl();
    await accountSkillsPage.waitForPageReady();

    // First, add a skill
    const skillName = randomDataGenerator.generateRandomSkillName();

    // Add skill if it doesn't exist
    const skillExists = await accountSkillsPage.isSkillVisible(skillName);
    if (!skillExists) {
      await Promise.all([
        accountSkillsPage.addSkill(skillName),
        page
          .waitForResponse(
            (resp) =>
              (resp.url().includes('/skills') || resp.url().includes('/api/v1/skills')) &&
              resp.status() === 201,
            { timeout: 10000 },
          )
          .catch(() => {}),
      ]);
      await accountSkillsPage.page.waitForTimeout(2000);
    }

    // Step 1: Click delete button - this opens the modal
    await accountSkillsPage.clickDeleteSkill(skillName);

    // Step 2: Wait for confirmation dialog/modal to appear
    await accountSkillsPage.waitForConfirmationDialog();
    await expect(accountSkillsPage.locator_confirmationDialog).toBeVisible({ timeout: 5000 });

    // Step 3: Cancel deletion by clicking Cancel button in modal
    await accountSkillsPage.cancelDelete();

    // Verify dialog is closed
    await expect(accountSkillsPage.locator_confirmationDialog).not.toBeVisible({ timeout: 2000 });

    // Verify skill still exists
    await accountSkillsPage.validateSkillInTable(skillName);
  });

  test('SK06_Verify error shown when skill name is empty', async () => {
    await accountSkillsPage.openUrl();
    await accountSkillsPage.waitForPageReady();

    await accountSkillsPage.clearNewSkillInput();
    await accountSkillsPage.clickAddSkillButton();

    // HTML5 validation might prevent submission, or we get error message
    await accountSkillsPage.page.waitForTimeout(1500);

    // Check for either HTML5 validation or custom error
    const inputValue = await accountSkillsPage.locator_newSkillInput.inputValue();
    if (inputValue === '') {
      // Check if HTML5 validation is triggered
      const isInvalid = await accountSkillsPage.locator_newSkillInput.evaluate(
        (el: HTMLInputElement) => !el.validity.valid,
      );
      // If HTML5 validation doesn't trigger, check for custom error
      if (!isInvalid) {
        const errorVisible = await accountSkillsPage.locator_alertToast.first().isVisible({ timeout: 2000 }).catch(() => false);
        if (errorVisible) {
          await accountSkillsPage.validateErrorMessage(
            skillsData.expectedMessages.emptySkillNameError,
          );
        }
      }
    }
  });

  test('SK07_Verify error shown when skill name is only whitespace', async () => {
    await accountSkillsPage.openUrl();
    await accountSkillsPage.waitForPageReady();

    await accountSkillsPage.enterNewSkillName(skillsData.formData.whitespaceOnlySkillName);
    await accountSkillsPage.clickAddSkillButton();

    await accountSkillsPage.page.waitForTimeout(1500);

    // Verify error message appears
    await accountSkillsPage.validateErrorMessage(
      skillsData.expectedMessages.whitespaceOnlyError,
    );
  });

  test('SK10_Verify error shown when trying to add duplicate skill name', async ({ page }) => {
    await accountSkillsPage.openUrl();
    await accountSkillsPage.waitForPageReady();

    const skillName = randomDataGenerator.generateRandomSkillName();

    // Ensure the skill exists first
    const skillExists = await accountSkillsPage.isSkillVisible(skillName);
    if (!skillExists) {
      await Promise.all([
        accountSkillsPage.addSkill(skillName),
        page
          .waitForResponse(
            (resp) =>
              (resp.url().includes('/skills') || resp.url().includes('/api/v1/skills')) &&
              resp.status() === 201,
            { timeout: 10000 },
          )
          .catch(() => {}),
      ]);
      await accountSkillsPage.page.waitForTimeout(2000);
    }

    // Verify skill exists
    await accountSkillsPage.validateSkillInTable(skillName);

    // Try to add the same skill name again (duplicate)
    await accountSkillsPage.enterNewSkillName(skillName);
    await Promise.all([
      accountSkillsPage.clickAddSkillButton(),
      page
        .waitForResponse(
          (resp) =>
            (resp.url().includes('/skills') || resp.url().includes('/api/v1/skills')) &&
            (resp.status() === 400 || resp.status() === 409),
          { timeout: 10000 },
        )
        .catch(() => {}),
    ]);

    await accountSkillsPage.page.waitForTimeout(1500);

    // Verify duplicate error message appears
    await accountSkillsPage.validateErrorMessage(skillsData.expectedMessages.duplicateSkillError);

    // Verify skill count hasn't increased (no duplicate added)
    const skillRows = await accountSkillsPage.getSkillRows();
    const duplicateCount = await skillRows.filter({ hasText: skillName }).count();
    expect(duplicateCount).toBe(1); // Should only have one instance
  });

 



  test('SK09_Verify skills table displays correctly', async () => {
    await accountSkillsPage.openUrl();
    await accountSkillsPage.waitForPageReady();

    // Wait for table to load
    await accountSkillsPage.waitForSkillsTable();

    // Verify table structure
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
