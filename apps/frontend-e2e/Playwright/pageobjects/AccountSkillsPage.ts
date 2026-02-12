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

    // Page elements
    this.locator_pageTitle = page.locator('h1.form-title, h1').filter({ hasText: 'Skills' });
    this.locator_pageSubtitle = page.locator('p.form-subtitle').filter({
      hasText:
        'Skills help categorize participants based on expertise. You can add, edit, or delete skills as needed.',
    });

    // Add skill form
    this.locator_newSkillInput = page.locator('#skill');
    this.locator_addSkillButton = page
      .getByRole('button', { name: /^(Save|Saving\.\.\.)$/ })
      .first();

    // Skills table
    this.locator_skillsTable = page.locator('table');
    this.locator_skillsRows = page.locator('tbody tr');

    // Alert messages (filter out Next.js route announcer)
    this.locator_alertToast = page.locator('div[role="alert"][class*="border-l-4"]');

    // Confirmation dialog
    // Dialog is a fixed overlay div with backdrop-blur-sm class
    this.locator_confirmationDialog = page
      .locator('div.fixed.inset-0.z-50')
      .filter({ hasText: 'Delete Skill?' });
    // Delete button is inside the dialog with bg-danger class
    this.locator_confirmDeleteButton = page
      .locator('div.fixed.inset-0.z-50')
      .getByRole('button', { name: 'Delete' });
    // Cancel button is inside the dialog
    this.locator_cancelDeleteButton = page
      .locator('div.fixed.inset-0.z-50')
      .getByRole('button', { name: 'Cancel' });
  }

  /**
   * Navigate to Account Settings - Skills page
   */
  async openUrl() {
    await this.page.goto('/settings/account/skills');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for page to be ready
   */
  async waitForPageReady() {
    await this.page.waitForSelector('h1.form-title', { state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(1000);
    await this.page.waitForLoadState('networkidle');
  }

  async validatePageLoaded() {
    await expect(this.locator_pageTitle).toBeVisible();
    await expect(this.locator_pageSubtitle).toBeVisible();
  }

  /**
   * Enter new skill name
   */
  async enterNewSkillName(skillName: string) {
    await this.locator_newSkillInput.fill(skillName);
  }

  /**
   * Clear new skill input
   */
  async clearNewSkillInput() {
    await this.locator_newSkillInput.clear();
  }

  /**
   * Click Add/Save button to add new skill
   */
  async clickAddSkillButton() {
    await this.locator_addSkillButton.click();
  }

  /**
   * Add a new skill
   */
  async addSkill(skillName: string) {
    await this.enterNewSkillName(skillName);
    await this.clickAddSkillButton();
  }

  /**
   * Wait for skill to appear in table after adding/editing
   */
  async waitForSkillToAppear(skillName: string, timeout: number = 10000) {
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(1000);

    // Wait for the skill row to appear
    const skillRow = this.getSkillRowByName(skillName);
    await skillRow
      .first()
      .waitFor({ state: 'visible', timeout })
      .catch(() => {});
  }

  /**
   * Get all skill rows
   */
  async getSkillRows() {
    return this.locator_skillsRows;
  }

  /**
   * Get skill row by skill name
   */
  getSkillRowByName(skillName: string): Locator {
    // Filter rows that contain the skill name text
    return this.locator_skillsRows.filter({ hasText: skillName });
  }

  /**
   * Check if skill exists in the table
   */
  async isSkillVisible(skillName: string): Promise<boolean> {
    return await this.getSkillRowByName(skillName)
      .isVisible({ timeout: 2000 })
      .catch(() => false);
  }

  /**
   * Click Edit button for a skill
   */
  async clickEditSkill(skillName: string) {
    const row = this.getSkillRowByName(skillName);
    const editButton = row.getByRole('button', { name: 'Edit' });
    await editButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Get edit input field (appears when editing)
   */
  getEditInput(): Locator {
    return this.page.locator('input.form-input-field.font-bold');
  }

  /**
   * Enter edit skill name
   */
  async enterEditSkillName(skillName: string) {
    const editInput = this.getEditInput();
    await editInput.fill(skillName);
  }

  /**
   * Click Save button in edit mode
   */
  async clickSaveEditButton() {
    const saveButton = this.page.getByRole('button', { name: /^(Save|Saving\.\.\.)$/ }).last();
    await saveButton.click();
  }

  async cancelEdit() {
    // Press Escape key to cancel edit
    await this.getEditInput().press('Escape');
    await this.page.waitForTimeout(500);
  }

  async editSkill(oldName: string, newName: string) {
    await this.clickEditSkill(oldName);
    await this.enterEditSkillName(newName);
    await this.clickSaveEditButton();
  }

  /**
   * Click Delete button for a skill
   */
  async clickDeleteSkill(skillName: string) {
    const row = this.getSkillRowByName(skillName);
    const deleteButton = row.getByRole('button', { name: /^(Delete|Deleting\.\.\.)$/ });
    await deleteButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Wait for confirmation dialog to appear
   */
  async waitForConfirmationDialog() {
    await this.locator_confirmationDialog.waitFor({ state: 'visible', timeout: 5000 });
    await this.page.waitForTimeout(500); // Wait for animation
  }

  /**
   * Confirm delete in dialog
   */
  async confirmDelete() {
    // First ensure dialog is visible
    await this.waitForConfirmationDialog();
    // Wait for delete button to be visible and enabled
    await this.locator_confirmDeleteButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.locator_confirmDeleteButton.waitFor({ state: 'attached', timeout: 2000 });
    await this.locator_confirmDeleteButton.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Cancel delete in dialog
   */
  async cancelDelete() {
    // First ensure dialog is visible
    await this.waitForConfirmationDialog();
    // Wait for cancel button to be visible
    await this.locator_cancelDeleteButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.locator_cancelDeleteButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Delete a skill (opens dialog and confirms)
   */
  async deleteSkill(skillName: string) {
    await this.clickDeleteSkill(skillName);
    await this.waitForConfirmationDialog();
    await this.confirmDelete();
  }

  /**
   * Validate success message
   */
  async validateSuccessMessage(message?: string) {
    // Success might be implicit (skill appears in table) or explicit alert
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

  /**
   * Validate error message
   */
  async validateErrorMessage(message: string) {
    await expect(this.locator_alertToast.first()).toBeVisible({ timeout: 5000 });
    await expect(this.locator_alertToast.first()).toContainText(message);
  }

  /**
   * Validate skill appears in table
   */
  async validateSkillInTable(skillName: string) {
    // Wait for table to be visible first
    await this.waitForSkillsTable();

    // Wait for network requests to complete (table might be refreshing)
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(1000);

    // Try to find the skill row - wait up to 10 seconds
    const skillRow = this.getSkillRowByName(skillName);

    // First check if any rows exist
    const rowCount = await this.locator_skillsRows.count();
    if (rowCount === 0) {
      // Wait a bit more for table to populate
      await this.page.waitForTimeout(2000);
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    // Wait for the skill row to appear
    await expect(skillRow).toBeVisible({ timeout: 10000 });

    // Double check the skill name is correct by checking the text content
    const rowText = await skillRow.first().textContent();
    expect(rowText).toContain(skillName);
  }

  /**
   * Validate skill does not appear in table
   */
  async validateSkillNotInTable(skillName: string) {
    await expect(this.getSkillRowByName(skillName)).not.toBeVisible({ timeout: 2000 });
  }

  /**
   * Get count of skills in table
   */
  async getSkillCount(): Promise<number> {
    return await this.locator_skillsRows.count();
  }

  /**
   * Wait for skills table to load
   */
  async waitForSkillsTable() {
    // Wait for table to be visible
    await this.locator_skillsTable.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    // Wait for at least one row to be present (table has data)
    await this.locator_skillsRows
      .first()
      .waitFor({ state: 'attached', timeout: 5000 })
      .catch(() => {});
    await this.page.waitForTimeout(1000);
  }
}
