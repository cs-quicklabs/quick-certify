import { expect, type Locator, type Page } from '@playwright/test';

export class AccountSkillsPage {
  readonly page: Page;

  readonly locator_pageTitle: Locator;
  readonly locator_pageSubtitle: Locator;
  readonly locator_newSkillInput: Locator;
  readonly locator_addSkillButton: Locator;
  readonly locator_skillsTable: Locator;
  readonly locator_skillsRows: Locator;
  readonly locator_alertToast: Locator;
  readonly locator_confirmationDialog: Locator;
  readonly locator_confirmDeleteButton: Locator;
  readonly locator_cancelDeleteButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.locator_pageTitle = page.locator('h1.form-title, h1').filter({ hasText: 'Skills' });
    this.locator_pageSubtitle = page.locator('p.form-subtitle').filter({
      hasText:
        'Skills help categorize participants based on expertise. You can add, edit, or delete skills as needed.',
    });

    this.locator_newSkillInput = page.locator('#skill');
    this.locator_addSkillButton = page
      .getByRole('button', { name: /^(Save|Saving\.\.\.)$/ })
      .first();

    this.locator_skillsTable = page.locator('table');
    this.locator_skillsRows = page.locator('tbody tr');

    this.locator_alertToast = page.locator('div[role="alert"][class*="border-l-4"]');

    this.locator_confirmationDialog = page
      .locator('div.fixed.inset-0.z-50')
      .filter({ hasText: 'Delete Skill?' });

    this.locator_confirmDeleteButton = page
      .locator('div.fixed.inset-0.z-50')
      .getByRole('button', { name: 'Delete' });

    this.locator_cancelDeleteButton = page
      .locator('div.fixed.inset-0.z-50')
      .getByRole('button', { name: 'Cancel' });
  }

  async openUrl() {
    await this.page.goto('/settings/account/skills');
    await this.page.waitForLoadState('networkidle');
  }

  async waitForPageReady() {
    await this.page.waitForSelector('h1.form-title', { state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(1000);
    await this.page.waitForLoadState('networkidle');
  }

  async validatePageLoaded() {
    await expect(this.locator_pageTitle).toBeVisible();
    await expect(this.locator_pageSubtitle).toBeVisible();
  }

  async enterNewSkillName(skillName: string) {
    await this.locator_newSkillInput.fill(skillName);
  }

  async clearNewSkillInput() {
    await this.locator_newSkillInput.clear();
  }

  async clickAddSkillButton() {
    await this.locator_addSkillButton.click();
  }

  async addSkill(skillName: string) {
    await this.enterNewSkillName(skillName);
    await this.clickAddSkillButton();
  }

  async waitForSkillToAppear(skillName: string, timeout = 10000) {
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(1000);

    const skillRow = this.getSkillRowByName(skillName);
    await skillRow
      .first()
      .waitFor({ state: 'visible', timeout })
      .catch(() => {});
  }

  async getSkillRows() {
    return this.locator_skillsRows;
  }

  getSkillRowByName(skillName: string): Locator {
    return this.locator_skillsRows.filter({ hasText: skillName });
  }

  async isSkillVisible(skillName: string): Promise<boolean> {
    return await this.getSkillRowByName(skillName)
      .isVisible({ timeout: 2000 })
      .catch(() => false);
  }

  async clickEditSkill(skillName: string) {
    const row = this.getSkillRowByName(skillName);
    const editButton = row.getByRole('button', { name: 'Edit' });
    await editButton.click();
    await this.page.waitForTimeout(500);
  }

  getEditInput(): Locator {
    return this.page.locator('input.form-input-field.w-full');
  }

  async enterEditSkillName(skillName: string) {
    const editInput = this.getEditInput();
    await editInput.fill(skillName);
  }

  async clickSaveEditButton() {
    const saveButton = this.page.getByRole('button', { name: /^(Save|Saving\.\.\.)$/ }).last();
    await saveButton.click();
  }

  async cancelEdit() {
    await this.getEditInput().press('Escape');
    await this.page.waitForTimeout(500);
  }

  async editSkill(oldName: string, newName: string) {
    await this.clickEditSkill(oldName);
    await this.enterEditSkillName(newName);
    await this.clickSaveEditButton();
  }

  async clickDeleteSkill(skillName: string) {
    const row = this.getSkillRowByName(skillName);
    const deleteButton = row.getByRole('button', { name: /^(Delete|Deleting\.\.\.)$/ });
    await deleteButton.click();
    await this.page.waitForTimeout(500);
  }

  async waitForConfirmationDialog() {
    await this.locator_confirmationDialog.waitFor({ state: 'visible', timeout: 5000 });
    await this.page.waitForTimeout(500);
  }

  async confirmDelete() {
    await this.waitForConfirmationDialog();

    await this.locator_confirmDeleteButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.locator_confirmDeleteButton.waitFor({ state: 'attached', timeout: 2000 });
    await this.locator_confirmDeleteButton.click();
    await this.page.waitForTimeout(1000);
  }

  async cancelDelete() {
    await this.waitForConfirmationDialog();

    await this.locator_cancelDeleteButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.locator_cancelDeleteButton.click();
    await this.page.waitForTimeout(500);
  }

  async deleteSkill(skillName: string) {
    await this.clickDeleteSkill(skillName);
    await this.waitForConfirmationDialog();
    await this.confirmDelete();
  }

  async validateSuccessMessage(message?: string) {
    await this.page.waitForTimeout(1000);
    if (message) {
      const alertVisible = await this.locator_alertToast
        .first()
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      if (alertVisible) {
        await expect(this.locator_alertToast.first()).toContainText(message);
      }
    }
  }

  async validateErrorMessage(message: string) {
    await expect(this.locator_alertToast.first()).toBeVisible({ timeout: 5000 });
    await expect(this.locator_alertToast.first()).toContainText(message);
  }

  async validateSkillInTable(skillName: string) {
    await this.waitForSkillsTable();

    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(1000);

    const skillRow = this.getSkillRowByName(skillName);

    const rowCount = await this.locator_skillsRows.count();
    if (rowCount === 0) {
      await this.page.waitForTimeout(2000);
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    await expect(skillRow).toBeVisible({ timeout: 10000 });

    const rowText = await skillRow.first().textContent();
    expect(rowText).toContain(skillName);
  }

  async validateSkillNotInTable(skillName: string) {
    await expect(this.getSkillRowByName(skillName)).not.toBeVisible({ timeout: 2000 });
  }

  async getSkillCount(): Promise<number> {
    return await this.locator_skillsRows.count();
  }

  async waitForSkillsTable() {
    await this.locator_skillsTable.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

    await this.locator_skillsRows
      .first()
      .waitFor({ state: 'attached', timeout: 5000 })
      .catch(() => {});
    await this.page.waitForTimeout(1000);
  }
}
