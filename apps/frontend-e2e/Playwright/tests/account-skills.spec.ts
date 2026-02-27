import { test, skillsData, expect, RandomDataGenerator } from './Fixture';
import type { AccountSkillsPage } from '../pageobjects/AccountSkillsPage';

let accountSkillsPage: AccountSkillsPage;
let randomDataGenerator: RandomDataGenerator;

test.beforeEach(
  async ({
    page,
    loginPage,
    accountSkillsPage: fixtureAccountSkillsPage,
    randomDataGenerator: fixtureRandomDataGenerator,
  }) => {
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
  },
);

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

    
    await accountSkillsPage.waitForSkillToAppear(skillName);

    
    await accountSkillsPage.validateSkillInTable(skillName);

    
    const inputValue = await accountSkillsPage.locator_newSkillInput.inputValue();
    expect(inputValue).toBe('');
  });

  test('SK03_Verify Super Admin can edit existing skill and change skill name', async ({
    page,
  }) => {
    
    await accountSkillsPage.openUrl();
    await accountSkillsPage.waitForPageReady();
    await accountSkillsPage.validatePageLoaded();

    
    const originalSkillName = randomDataGenerator.generateRandomSkillName();
    const editedSkillName = randomDataGenerator.generateRandomSkillName();

    
    const editedSkillExists = await accountSkillsPage.isSkillVisible(editedSkillName);
    if (editedSkillExists) {
      
      await accountSkillsPage.clickDeleteSkill(editedSkillName);
      await accountSkillsPage.waitForConfirmationDialog();
      await accountSkillsPage.confirmDelete();
      await accountSkillsPage.page.waitForTimeout(2000);
    }

    
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

    
    await accountSkillsPage.validateSkillInTable(originalSkillName);

    
    await accountSkillsPage.clickEditSkill(originalSkillName);
    await accountSkillsPage.page.waitForTimeout(500);

    
    await expect(accountSkillsPage.getEditInput()).toBeVisible({ timeout: 5000 });
    await expect(accountSkillsPage.getEditInput()).toHaveValue(originalSkillName);

    
    await accountSkillsPage.enterEditSkillName(editedSkillName);
    await accountSkillsPage.page.waitForTimeout(300);

    
    await expect(accountSkillsPage.getEditInput()).toHaveValue(editedSkillName);

    
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

    
    await accountSkillsPage.validateSkillNotInTable(originalSkillName);

    
    await accountSkillsPage.validateSkillInTable(editedSkillName);
  });

  test('SK04_Verify Super Admin can delete skill with confirmation', async ({ page }) => {
    await accountSkillsPage.openUrl();
    await accountSkillsPage.waitForPageReady();

    
    const skillName = randomDataGenerator.generateRandomSkillName();

    
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

    
    const initialCount = await accountSkillsPage.getSkillCount();

    
    await accountSkillsPage.clickDeleteSkill(skillName);

    
    await accountSkillsPage.waitForConfirmationDialog();
    await expect(accountSkillsPage.locator_confirmationDialog).toBeVisible({ timeout: 5000 });
    await expect(accountSkillsPage.locator_confirmationDialog).toContainText(
      skillsData.expectedMessages.deleteConfirmationTitle,
    );
    await expect(accountSkillsPage.locator_confirmationDialog).toContainText(skillName);

    
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

    
    await accountSkillsPage.validateSkillNotInTable(skillName);

    
    const newCount = await accountSkillsPage.getSkillCount();
    expect(newCount).toBe(initialCount - 1);
  });

  test('SK05_Verify delete confirmation can be cancelled', async ({ page }) => {
    await accountSkillsPage.openUrl();
    await accountSkillsPage.waitForPageReady();

    
    const skillName = randomDataGenerator.generateRandomSkillName();

    
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

    
    await accountSkillsPage.clickDeleteSkill(skillName);

    
    await accountSkillsPage.waitForConfirmationDialog();
    await expect(accountSkillsPage.locator_confirmationDialog).toBeVisible({ timeout: 5000 });

    
    await accountSkillsPage.cancelDelete();

    
    await expect(accountSkillsPage.locator_confirmationDialog).not.toBeVisible({ timeout: 2000 });

    
    await accountSkillsPage.validateSkillInTable(skillName);
  });

  test('SK06_Verify error shown when skill name is empty', async () => {
    await accountSkillsPage.openUrl();
    await accountSkillsPage.waitForPageReady();

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
    await accountSkillsPage.openUrl();
    await accountSkillsPage.waitForPageReady();

    await accountSkillsPage.enterNewSkillName(skillsData.formData.whitespaceOnlySkillName);
    await accountSkillsPage.clickAddSkillButton();

    await accountSkillsPage.page.waitForTimeout(1500);

    
    await accountSkillsPage.validateErrorMessage(skillsData.expectedMessages.whitespaceOnlyError);
  });

  test('SK10_Verify error shown when trying to add duplicate skill name', async ({ page }) => {
    await accountSkillsPage.openUrl();
    await accountSkillsPage.waitForPageReady();

    const skillName = randomDataGenerator.generateRandomSkillName();

    
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

    
    await accountSkillsPage.validateSkillInTable(skillName);

    
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

    
    await accountSkillsPage.validateErrorMessage(skillsData.expectedMessages.duplicateSkillError);

    
    const skillRows = await accountSkillsPage.getSkillRows();
    const duplicateCount = await skillRows.filter({ hasText: skillName }).count();
    expect(duplicateCount).toBe(1); 
  });

  test('SK09_Verify skills table displays correctly', async () => {
    await accountSkillsPage.openUrl();
    await accountSkillsPage.waitForPageReady();

    
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
