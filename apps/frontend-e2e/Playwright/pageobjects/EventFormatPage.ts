import { expect, type Locator, type Page } from '@playwright/test';

export class EventFormatPage {
  readonly page: Page;

  readonly locator_pageTitle: Locator;
  readonly locator_pageSubtitle: Locator;
  readonly locator_newEventFormatInput: Locator;
  readonly locator_addEventFormatButton: Locator;
  readonly locator_eventFormatsTable: Locator;
  readonly locator_eventFormatsRows: Locator;
  readonly locator_alertToast: Locator;
  readonly locator_confirmationDialog: Locator;
  readonly locator_confirmDeleteButton: Locator;
  readonly locator_cancelDeleteButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page elements using data-testid
    this.locator_pageTitle = this.page.getByTestId('event-format-page-title');
    this.locator_pageSubtitle = this.page.getByTestId('event-format-page-subtitle');

    // Add event format form
    this.locator_newEventFormatInput = this.page.getByTestId('event-format-new-input');
    this.locator_addEventFormatButton = this.page.getByTestId('event-format-add-button');

    // Event formats table
    this.locator_eventFormatsTable = this.page.getByTestId('event-format-table');
    this.locator_eventFormatsRows = this.page.locator('[data-testid^="event-format-row-"]');

    // Alert messages
    this.locator_alertToast = this.page.locator('[data-testid^="alert-"]');

    // Confirmation dialog
    this.locator_confirmationDialog = this.page.getByTestId('confirmation-dialog');
    this.locator_confirmDeleteButton = this.page.getByTestId('confirmation-dialog-confirm-button');
    this.locator_cancelDeleteButton = this.page.getByTestId('confirmation-dialog-cancel-button');
  }

  /**
   * Navigate to Event Format Settings page
   */
  async openUrl() {
    await this.page.goto('/settings/event/format');
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
   * Enter new event format name
   */
  async enterNewEventFormatName(eventFormatName: string) {
    await this.locator_newEventFormatInput.fill(eventFormatName);
  }

  /**
   * Clear new event format input
   */
  async clearNewEventFormatInput() {
    await this.locator_newEventFormatInput.clear();
  }

  /**
   * Click Add/Save button to add new event format
   */
  async clickAddEventFormatButton() {
    await this.locator_addEventFormatButton.click();
  }

  /**
   * Add a new event format
   */
  async addEventFormat(eventFormatName: string) {
    await this.enterNewEventFormatName(eventFormatName);
    await this.clickAddEventFormatButton();
  }

  /**
   * Get all event format rows
   */
  async getEventFormatRows() {
    return this.locator_eventFormatsRows;
  }

  /**
   * Get event format row by event format name
   */
  async getEventFormatRowByName(eventFormatName: string): Promise<Locator | null> {
    const rows = await this.locator_eventFormatsRows.all();
    for (const row of rows) {
      const nameCell = row.locator('td').first();
      const cellText = await nameCell.textContent();
      if (cellText?.trim() === eventFormatName) {
        return row;
      }
    }
    return null;
  }

  /**
   * Check if event format exists in the table
   */
  async isEventFormatVisible(eventFormatName: string): Promise<boolean> {
    const row = await this.getEventFormatRowByName(eventFormatName);
    if (!row) return false;
    return await row.isVisible({ timeout: 2000 }).catch(() => false);
  }

  /**
   * Click Edit button for an event format
   */
  async clickEditEventFormat(eventFormatName: string) {
    const row = await this.getEventFormatRowByName(eventFormatName);
    if (!row) {
      throw new Error(`Event format "${eventFormatName}" not found`);
    }

    const rowTestId = await row.getAttribute('data-testid');
    if (rowTestId) {
      const uuid = rowTestId.replace('event-format-row-', '');
      const editButton = this.page.getByTestId(`event-format-edit-button-${uuid}`);
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
      return this.page.getByTestId(`event-format-edit-input-${uuid}`);
    }
    return this.page.locator('[data-testid^="event-format-edit-input-"]').first();
  }

  /**
   * Enter edit event format name
   */
  async enterEditEventFormatName(eventFormatName: string, uuid?: string) {
    const editInput = this.getEditInput(uuid);
    await editInput.fill(eventFormatName);
  }

  /**
   * Click Save button in edit mode
   */
  async clickSaveEditButton(uuid?: string) {
    if (uuid) {
      const saveButton = this.page.getByTestId(`event-format-save-button-${uuid}`);
      await saveButton.click();
    } else {
      const saveButton = this.page.locator('[data-testid^="event-format-save-button-"]');
      await saveButton.click();
    }
  }

  async cancelEdit(uuid?: string) {
    await this.getEditInput(uuid).press('Escape');
    await this.page.waitForTimeout(500);
  }

  /**
   * Click Delete button for an event format
   */
  async clickDeleteEventFormat(eventFormatName: string) {
    const row = await this.getEventFormatRowByName(eventFormatName);
    if (!row) {
      throw new Error(`Event format "${eventFormatName}" not found`);
    }

    const rowTestId = await row.getAttribute('data-testid');
    if (rowTestId) {
      const uuid = rowTestId.replace('event-format-row-', '');
      const deleteButton = this.page.getByTestId(`event-format-delete-button-${uuid}`);
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
   * Validate event format appears in table
   */
  async validateEventFormatInTable(eventFormatName: string) {
    await this.waitForEventFormatsTable();
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(1000);

    let found = false;
    const maxAttempts = 10;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const rows = await this.locator_eventFormatsRows.all();
      for (const row of rows) {
        const nameCell = row.locator('td').first();
        const cellText = await nameCell.textContent();
        if (cellText?.trim() === eventFormatName) {
          await expect(row).toBeVisible({ timeout: 2000 });
          found = true;
          break;
        }
      }
      if (found) break;
      await this.page.waitForTimeout(1000);
    }

    if (!found) {
      throw new Error(`Event format "${eventFormatName}" not found in table`);
    }
  }

  /**
   * Validate event format does not appear in table
   */
  async validateEventFormatNotInTable(eventFormatName: string) {
    const row = await this.getEventFormatRowByName(eventFormatName);
    if (row) {
      await expect(row).not.toBeVisible({ timeout: 2000 });
    }
  }

  /**
   * Get count of event formats in table
   */
  async getEventFormatCount(): Promise<number> {
    return await this.locator_eventFormatsRows.count();
  }

  /**
   * Wait for event formats table to load
   */
  async waitForEventFormatsTable() {
    await this.locator_eventFormatsTable.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await Promise.race([
      this.locator_eventFormatsRows.first().waitFor({ state: 'attached', timeout: 5000 }),
      this.page.waitForSelector('text=No event formats found', { timeout: 5000 }),
    ]).catch(() => {});
    await this.page.waitForTimeout(1000);
  }

  /**
   * Get UUID from event format row by name
   */
  async getEventFormatUuid(eventFormatName: string): Promise<string | null> {
    const row = await this.getEventFormatRowByName(eventFormatName);
    if (!row) return null;
    const rowTestId = await row.getAttribute('data-testid');
    if (rowTestId) {
      return rowTestId.replace('event-format-row-', '');
    }
    return null;
  }

  /**
   * Get event format name from table row
   */
  async getEventFormatNameFromRow(row: Locator): Promise<string> {
    const rowTestId = await row.getAttribute('data-testid');
    if (rowTestId) {
      const uuid = rowTestId.replace('event-format-row-', '');
      const nameCell = this.page.getByTestId(`event-format-name-${uuid}`);
      const text = await nameCell.textContent();
      if (text) return text.trim();
    }
    const nameCell = row.locator('td').first();
    return (await nameCell.textContent()) || '';
  }

  /**
   * Validate first character is capital
   */
  async validateFirstCharacterCapital(eventFormatName: string): Promise<boolean> {
    const firstChar = eventFormatName.charAt(0);
    return firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase();
  }
}
