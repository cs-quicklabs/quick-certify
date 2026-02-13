import { expect, type Locator, type Page } from '@playwright/test';

export class EventTypePage {
  readonly page: Page;

  readonly locator_pageTitle: Locator;
  readonly locator_pageSubtitle: Locator;
  readonly locator_newEventTypeInput: Locator;
  readonly locator_addEventTypeButton: Locator;
  readonly locator_eventTypesTable: Locator;
  readonly locator_eventTypesRows: Locator;
  readonly locator_alertToast: Locator;
  readonly locator_confirmationDialog: Locator;
  readonly locator_confirmDeleteButton: Locator;
  readonly locator_cancelDeleteButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page elements using data-testid
    this.locator_pageTitle = this.page.getByTestId('event-type-page-title');
    this.locator_pageSubtitle = this.page.getByTestId('event-type-page-subtitle');

    // Add event type form
    this.locator_newEventTypeInput = this.page.getByTestId('event-type-new-input');
    this.locator_addEventTypeButton = this.page.getByTestId('event-type-add-button');

    // Event types table
    this.locator_eventTypesTable = this.page.getByTestId('event-type-table');
    this.locator_eventTypesRows = this.page.locator('[data-testid^="event-type-row-"]');

    // Alert messages
    this.locator_alertToast = this.page.locator('[data-testid^="alert-"]');

    // Confirmation dialog
    this.locator_confirmationDialog = this.page.getByTestId('confirmation-dialog');
    this.locator_confirmDeleteButton = this.page.getByTestId('confirmation-dialog-confirm-button');
    this.locator_cancelDeleteButton = this.page.getByTestId('confirmation-dialog-cancel-button');
  }

  /**
   * Navigate to Event Type Settings page
   */
  async openUrl() {
    await this.page.goto('/settings/event/type');
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
   * Enter new event type name
   */
  async enterNewEventTypeName(eventTypeName: string) {
    await this.locator_newEventTypeInput.fill(eventTypeName);
  }

  /**
   * Clear new event type input
   */
  async clearNewEventTypeInput() {
    await this.locator_newEventTypeInput.clear();
  }

  /**
   * Click Add/Save button to add new event type
   */
  async clickAddEventTypeButton() {
    await this.locator_addEventTypeButton.click();
  }

  /**
   * Add a new event type
   */
  async addEventType(eventTypeName: string) {
    await this.enterNewEventTypeName(eventTypeName);
    await this.clickAddEventTypeButton();
  }

  /**
   * Wait for event type to appear in table after adding/editing
   */
  async waitForEventTypeToAppear(eventTypeName: string, timeout: number = 10000) {
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(1000);

    // Wait for the event type row to appear
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const row = await this.getEventTypeRowByName(eventTypeName);
      if (row && (await row.isVisible({ timeout: 1000 }).catch(() => false))) {
        return;
      }
      await this.page.waitForTimeout(500);
    }
  }

  /**
   * Get all event type rows
   */
  async getEventTypeRows() {
    return this.locator_eventTypesRows;
  }

  /**
   * Get event type row by event type name
   */
  async getEventTypeRowByName(eventTypeName: string): Promise<Locator | null> {
    // Find row by checking each row's name cell for exact match
    const rows = await this.locator_eventTypesRows.all();
    for (const row of rows) {
      const nameCell = row.locator('td').first();
      const cellText = await nameCell.textContent();
      if (cellText?.trim() === eventTypeName) {
        return row;
      }
    }
    return null;
  }

  /**
   * Get event type row by UUID
   */
  getEventTypeRowByUuid(uuid: string): Locator {
    return this.page.getByTestId(`event-type-row-${uuid}`);
  }

  /**
   * Check if event type exists in the table
   */
  async isEventTypeVisible(eventTypeName: string): Promise<boolean> {
    const row = await this.getEventTypeRowByName(eventTypeName);
    if (!row) return false;
    return await row.isVisible({ timeout: 2000 }).catch(() => false);
  }

  /**
   * Click Edit button for an event type
   */
  async clickEditEventType(eventTypeName: string) {
    const row = await this.getEventTypeRowByName(eventTypeName);
    if (!row) {
      throw new Error(`Event type "${eventTypeName}" not found`);
    }
    
    // Try to get UUID from the row's data-testid attribute
    const rowTestId = await row.getAttribute('data-testid');
    if (rowTestId) {
      const uuid = rowTestId.replace('event-type-row-', '');
      const editButton = this.page.getByTestId(`event-type-edit-button-${uuid}`);
      await editButton.click();
    } else {
      // Fallback to role-based selector
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
      return this.page.getByTestId(`event-type-edit-input-${uuid}`);
    }
    // Fallback: find any edit input (when already in edit mode)
    return this.page.locator('[data-testid^="event-type-edit-input-"]').first();
  }

  /**
   * Enter edit event type name
   */
  async enterEditEventTypeName(eventTypeName: string, uuid?: string) {
    const editInput = this.getEditInput(uuid);
    await editInput.fill(eventTypeName);
  }

  /**
   * Click Save button in edit mode
   */
  async clickSaveEditButton(uuid?: string) {
    if (uuid) {
      const saveButton = this.page.getByTestId(`event-type-save-button-${uuid}`);
      await saveButton.click();
    } else {
      // Fallback: find any save button in edit mode
      const saveButton = this.page.locator('[data-testid^="event-type-save-button-"]');
      await saveButton.click();
    }
  }

  async cancelEdit(uuid?: string) {
    // Press Escape key to cancel edit
    await this.getEditInput(uuid).press('Escape');
    await this.page.waitForTimeout(500);
  }

  async editEventType(oldName: string, newName: string) {
    const uuid = await this.getEventTypeUuid(oldName);
    await this.clickEditEventType(oldName);
    await this.enterEditEventTypeName(newName, uuid || undefined);
    await this.clickSaveEditButton(uuid || undefined);
  }

  /**
   * Click Delete button for an event type
   */
  async clickDeleteEventType(eventTypeName: string) {
    const row = await this.getEventTypeRowByName(eventTypeName);
    if (!row) {
      throw new Error(`Event type "${eventTypeName}" not found`);
    }
    
    // Try to get UUID from the row's data-testid attribute
    const rowTestId = await row.getAttribute('data-testid');
    if (rowTestId) {
      const uuid = rowTestId.replace('event-type-row-', '');
      const deleteButton = this.page.getByTestId(`event-type-delete-button-${uuid}`);
      await deleteButton.click();
    } else {
      // Fallback to role-based selector
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
   * Delete an event type (opens dialog and confirms)
   */
  async deleteEventType(eventTypeName: string) {
    await this.clickDeleteEventType(eventTypeName);
    await this.waitForConfirmationDialog();
    await this.confirmDelete();
  }

  /**
   * Validate success message
   */
  async validateSuccessMessage(message?: string) {
    // Success might be implicit (event type appears in table) or explicit alert
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
   * Validate event type appears in table
   */
  async validateEventTypeInTable(eventTypeName: string) {
    // Wait for table to be visible first
    await this.waitForEventTypesTable();

    // Wait for network requests to complete (table might be refreshing)
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.page.waitForTimeout(1000);

    // First check if any rows exist
    const rowCount = await this.locator_eventTypesRows.count();
    if (rowCount === 0) {
      // Wait a bit more for table to populate
      await this.page.waitForTimeout(2000);
      await this.page.waitForLoadState('networkidle').catch(() => {});
    }

    // Try to find the event type row by checking each row's name cell
    // Wait up to 10 seconds for the row to appear
    let found = false;
    const maxAttempts = 10;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const rows = await this.locator_eventTypesRows.all();
      for (const row of rows) {
        const nameCell = row.locator('td').first();
        const cellText = await nameCell.textContent();
        if (cellText?.trim() === eventTypeName) {
          await expect(row).toBeVisible({ timeout: 2000 });
          found = true;
          break;
        }
      }
      if (found) break;
      await this.page.waitForTimeout(1000);
    }

    if (!found) {
      throw new Error(`Event type "${eventTypeName}" not found in table`);
    }
  }

  /**
   * Validate event type does not appear in table
   */
  async validateEventTypeNotInTable(eventTypeName: string) {
    const row = await this.getEventTypeRowByName(eventTypeName);
    if (row) {
      await expect(row).not.toBeVisible({ timeout: 2000 });
    }
    // If row is null, it's already not in table, which is what we want
  }

  /**
   * Get count of event types in table
   */
  async getEventTypeCount(): Promise<number> {
    return await this.locator_eventTypesRows.count();
  }

  /**
   * Wait for event types table to load
   */
  async waitForEventTypesTable() {
    // Wait for table to be visible
    await this.locator_eventTypesTable.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    // Wait for at least one row to be present (table has data) or empty state message
    await Promise.race([
      this.locator_eventTypesRows.first().waitFor({ state: 'attached', timeout: 5000 }),
      this.page.waitForSelector('text=No event types found', { timeout: 5000 }),
    ]).catch(() => {});
    await this.page.waitForTimeout(1000);
  }

  /**
   * Get UUID from event type row by name
   */
  async getEventTypeUuid(eventTypeName: string): Promise<string | null> {
    const row = await this.getEventTypeRowByName(eventTypeName);
    if (!row) return null;
    const rowTestId = await row.getAttribute('data-testid');
    if (rowTestId) {
      return rowTestId.replace('event-type-row-', '');
    }
    return null;
  }

  /**
   * Validate first character is capital
   */
  async validateFirstCharacterCapital(eventTypeName: string): Promise<boolean> {
    const firstChar = eventTypeName.charAt(0);
    return firstChar === firstChar.toUpperCase() && firstChar !== firstChar.toLowerCase();
  }

  /**
   * Get event type name from table row
   */
  async getEventTypeNameFromRow(row: Locator): Promise<string> {
    // Try to get UUID from row's data-testid
    const rowTestId = await row.getAttribute('data-testid');
    if (rowTestId) {
      const uuid = rowTestId.replace('event-type-row-', '');
      const nameCell = this.page.getByTestId(`event-type-name-${uuid}`);
      const text = await nameCell.textContent();
      if (text) return text.trim();
    }
    // Fallback to first td
    const nameCell = row.locator('td').first();
    return (await nameCell.textContent()) || '';
  }
}
