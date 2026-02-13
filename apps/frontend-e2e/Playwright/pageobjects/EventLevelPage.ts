import { expect, type Locator, type Page } from '@playwright/test';

export class EventLevelPage {
  readonly page: Page;

  readonly locator_pageTitle: Locator;
  readonly locator_pageSubtitle: Locator;
  readonly locator_newEventLevelInput: Locator;
  readonly locator_addEventLevelButton: Locator;
  readonly locator_eventLevelsTable: Locator;
  readonly locator_eventLevelsRows: Locator;
  readonly locator_alertToast: Locator;
  readonly locator_confirmationDialog: Locator;
  readonly locator_confirmDeleteButton: Locator;
  readonly locator_cancelDeleteButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page elements using data-testid
    this.locator_pageTitle = this.page.getByTestId('event-level-page-title');
    this.locator_pageSubtitle = this.page.getByTestId('event-level-page-subtitle');

    // Add event level form
    this.locator_newEventLevelInput = this.page.getByTestId('event-level-new-input');
    this.locator_addEventLevelButton = this.page.getByTestId('event-level-add-button');

    // Event levels table
    this.locator_eventLevelsTable = this.page.getByTestId('event-level-table');
    this.locator_eventLevelsRows = this.page.locator('[data-testid^="event-level-row-"]');

    // Alert messages
    this.locator_alertToast = this.page.locator('[data-testid^="alert-"]');

    // Confirmation dialog
    this.locator_confirmationDialog = this.page.getByTestId('confirmation-dialog');
    this.locator_confirmDeleteButton = this.page.getByTestId('confirmation-dialog-confirm-button');
    this.locator_cancelDeleteButton = this.page.getByTestId('confirmation-dialog-cancel-button');
  }

  /**
   * Navigate to Event Level Settings page
   */
  async openUrl() {
    await this.page.goto('/settings/event/level');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for page to be ready
   */
  async waitForPageReady() {
    await this.locator_pageTitle.waitFor({ state: 'visible', timeout: 10000 });
    await this.page.waitForTimeout(1000);
    await this.page.waitForLoadState('networkidle');
  }

  async validatePageLoaded() {
    await expect(this.locator_pageTitle).toBeVisible();
    await expect(this.locator_pageSubtitle).toBeVisible();
  }

  /**
   * Enter new event level name
   */
  async enterNewEventLevelName(eventLevelName: string) {
    await this.locator_newEventLevelInput.fill(eventLevelName);
  }

  /**
   * Clear new event level input
   */
  async clearNewEventLevelInput() {
    await this.locator_newEventLevelInput.clear();
  }

  /**
   * Click Add/Save button to add new event level
   */
  async clickAddEventLevelButton() {
    await this.locator_addEventLevelButton.click();
  }

  /**
   * Add a new event level
   */
  async addEventLevel(eventLevelName: string) {
    await this.enterNewEventLevelName(eventLevelName);
    await this.clickAddEventLevelButton();
  }

  /**
   * Get all event level rows
   */
  async getEventLevelRows() {
    return this.locator_eventLevelsRows;
  }

  /**
   * Get event level row by event level name
   */
  async getEventLevelRowByName(eventLevelName: string): Promise<Locator | null> {
    const rows = await this.locator_eventLevelsRows.all();
    for (const row of rows) {
      const nameCell = row.locator('td').first();
      const cellText = await nameCell.textContent();
      if (cellText?.trim() === eventLevelName) {
        return row;
      }
    }
    return null;
  }

  /**
   * Check if event level exists in the table
   */
  async isEventLevelVisible(eventLevelName: string): Promise<boolean> {
    const row = await this.getEventLevelRowByName(eventLevelName);
    if (!row) return false;
    return await row.isVisible({ timeout: 2000 }).catch(() => false);
  }

  /**
   * Click Edit button for an event level
   */
  async clickEditEventLevel(eventLevelName: string) {
    const row = await this.getEventLevelRowByName(eventLevelName);
    if (!row) {
      throw new Error(`Event level "${eventLevelName}" not found`);
    }

    const rowTestId = await row.getAttribute('data-testid');
    if (rowTestId) {
      const uuid = rowTestId.replace('event-level-row-', '');
      const editButton = this.page.getByTestId(`event-level-edit-button-${uuid}`);
      await editButton.click();
    } else {
      const editButton = row.getByRole('button', { name: 'Edit' });
      await editButton.click();
    }
    await this.page.waitForTimeout(500);
  }

  /**
   * Get edit input field (appears when editing)
   */
  getEditInput(uuid?: string): Locator {
    if (uuid) {
      return this.page.getByTestId(`event-level-edit-input-${uuid}`);
    }
    return this.page.locator('[data-testid^="event-level-edit-input-"]').first();
  }

  /**
   * Enter edit event level name
   */
  async enterEditEventLevelName(eventLevelName: string, uuid?: string) {
    const editInput = this.getEditInput(uuid);
    await editInput.fill(eventLevelName);
  }

  /**
   * Click Save button in edit mode
   */
  async clickSaveEditButton(uuid?: string) {
    if (uuid) {
      const saveButton = this.page.getByTestId(`event-level-save-button-${uuid}`);
      await saveButton.click();
    } else {
      const saveButton = this.page.locator('[data-testid^="event-level-save-button-"]');
      await saveButton.click();
    }
  }

  async cancelEdit(uuid?: string) {
    await this.getEditInput(uuid).press('Escape');
    await this.page.waitForTimeout(500);
  }

  /**
   * Click Delete button for an event level
   */
  async clickDeleteEventLevel(eventLevelName: string) {
    const row = await this.getEventLevelRowByName(eventLevelName);
    if (!row) {
      throw new Error(`Event level "${eventLevelName}" not found`);
    }

    const rowTestId = await row.getAttribute('data-testid');
    if (rowTestId) {
      const uuid = rowTestId.replace('event-level-row-', '');
      const deleteButton = this.page.getByTestId(`event-level-delete-button-${uuid}`);
      await deleteButton.click();
    } else {
      const deleteButton = row.getByRole('button', { name: /^(Delete|Deleting\.\.\.)$/ });
      await deleteButton.click();
    }
    await this.page.waitForTimeout(500);
  }

  /**
   * Wait for confirmation dialog to appear
   */
  async waitForConfirmationDialog() {
    await this.locator_confirmationDialog.waitFor({ state: 'visible', timeout: 5000 });
    await this.page.waitForTimeout(500);
  }

  /**
   * Confirm delete in dialog
   */
  async confirmDelete() {
    await this.waitForConfirmationDialog();
    await this.locator_confirmDeleteButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.locator_confirmDeleteButton.waitFor({ state: 'attached', timeout: 2000 });
    await this.locator_confirmDeleteButton.click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * Cancel delete in dialog
   */
  async cancelDelete() {
    await this.waitForConfirmationDialog();
    await this.locator_cancelDeleteButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.locator_cancelDeleteButton.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Validate error message
   */
  async validateErrorMessage(message: string) {
    await expect(this.locator_alertToast.first()).toBeVisible({ timeout: 5000 });
    await expect(this.locator_alertToast.first()).toContainText(message);
  }

  /**
   * Validate event level appears in table
   */
  async validateEventLevelInTable(eventLevelName: string) {
    await this.waitForEventLevelsTable();
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(1000);

    let found = false;
    const maxAttempts = 10;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const rows = await this.locator_eventLevelsRows.all();
      for (const row of rows) {
        const nameCell = row.locator('td').first();
        const cellText = await nameCell.textContent();
        if (cellText?.trim() === eventLevelName) {
          await expect(row).toBeVisible({ timeout: 2000 });
          found = true;
          break;
        }
      }
      if (found) break;
      await this.page.waitForTimeout(1000);
    }

    if (!found) {
      throw new Error(`Event level "${eventLevelName}" not found in table`);
    }
  }

  /**
   * Validate event level does not appear in table
   */
  async validateEventLevelNotInTable(eventLevelName: string) {
    const row = await this.getEventLevelRowByName(eventLevelName);
    if (row) {
      await expect(row).not.toBeVisible({ timeout: 2000 });
    }
  }

  /**
   * Get count of event levels in table
   */
  async getEventLevelCount(): Promise<number> {
    return await this.locator_eventLevelsRows.count();
  }

  /**
   * Wait for event levels table to load
   */
  async waitForEventLevelsTable() {
    await this.locator_eventLevelsTable.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await Promise.race([
      this.locator_eventLevelsRows.first().waitFor({ state: 'attached', timeout: 5000 }),
      this.page.waitForSelector('text=No event levels found', { timeout: 5000 }),
    ]).catch(() => {});
    await this.page.waitForTimeout(1000);
  }

  /**
   * Get UUID from event level row by name
   */
  async getEventLevelUuid(eventLevelName: string): Promise<string | null> {
    const row = await this.getEventLevelRowByName(eventLevelName);
    if (!row) return null;
    const rowTestId = await row.getAttribute('data-testid');
    if (rowTestId) {
      return rowTestId.replace('event-level-row-', '');
    }
    return null;
  }

  /**
   * Get event level name from table row
   */
  async getEventLevelNameFromRow(row: Locator): Promise<string> {
    const rowTestId = await row.getAttribute('data-testid');
    if (rowTestId) {
      const uuid = rowTestId.replace('event-level-row-', '');
      const nameCell = this.page.getByTestId(`event-level-name-${uuid}`);
      const text = await nameCell.textContent();
      if (text) return text.trim();
    }
    const nameCell = row.locator('td').first();
    return (await nameCell.textContent()) || '';
  }

  /**
   * Validate first character is capital
   */
  async validateFirstCharacterCapital(eventLevelName: string): Promise<boolean> {
    const firstChar = eventLevelName.charAt(0);
    return firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase();
  }
}
