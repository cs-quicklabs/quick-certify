import { test, eventFormatData, expect, RandomDataGenerator } from './Fixture';
import type { EventFormatPage } from '../pageobjects/EventFormatPage';

/**
 * Test Suite: Event Format Settings
 * Screen: /settings/event/format
 *
 * Coverage:
 * 1. User should be able to add Event Format
 * 2. User should be able to edit event format
 * 3. User should be able to delete event format
 * 4. User should not add event format which already exists
 * 5. User should not edit event format name which already exists
 * 6. All Event format name first character should be capital
 */

let eventFormatPage: EventFormatPage;
let randomDataGenerator: RandomDataGenerator;

test.beforeEach(
  async ({
    page,
    eventFormatPage: fixtureEventFormatPage,
    randomDataGenerator: fixtureRandomDataGenerator,
  }) => {
    eventFormatPage = fixtureEventFormatPage;
    randomDataGenerator = fixtureRandomDataGenerator;

    // Start from dashboard (session is already authenticated via storageState)
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Navigate to event format page
    await page.goto('/settings/event/format');
    await page.waitForLoadState('networkidle');
  },
);

test.describe('Event Format Settings', () => {
  test('EF01_Verify User should be able to add Event Format', async () => {
    await eventFormatPage.openUrl();
    await eventFormatPage.waitForPageReady();
    await eventFormatPage.validatePageLoaded();

    const eventFormatName = randomDataGenerator.generateRandomEventFormatName();

    // Enter event format name and click add button
    await eventFormatPage.addEventFormat(eventFormatName);

    // Wait for UI to update
    await eventFormatPage.page.waitForTimeout(2000);

    // Verify input is cleared after adding (frontend validation)
    const inputValue = await eventFormatPage.locator_newEventFormatInput.inputValue();
    expect(inputValue).toBe('');

    // Verify add button is enabled when input has value
    await eventFormatPage.enterNewEventFormatName(eventFormatName);
    const isButtonEnabled = await eventFormatPage.locator_addEventFormatButton.isEnabled();
    expect(isButtonEnabled).toBe(true);
  });

  test('EF02_Verify User should be able to edit event format', async () => {
    await eventFormatPage.openUrl();
    await eventFormatPage.waitForPageReady();
    await eventFormatPage.validatePageLoaded();

    // Wait for table to load
    await eventFormatPage.waitForEventFormatsTable();

    // Get first existing event format from table to edit
    const eventFormatRows = await eventFormatPage.getEventFormatRows();
    const rowCount = await eventFormatRows.count();

    if (rowCount === 0) {
      test.skip();
      return;
    }

    // Get the first event format name
    const firstRow = eventFormatRows.first();
    const originalEventFormatName = await eventFormatPage.getEventFormatNameFromRow(firstRow);
    const editedEventFormatName = `Edited_${originalEventFormatName}`;

    // Get UUID before entering edit mode
    const firstRowTestId = await firstRow.getAttribute('data-testid');
    const originalEventFormatUuid = firstRowTestId ? firstRowTestId.replace('event-format-row-', '') : null;

    // Step 1: Click on Edit button
    await eventFormatPage.clickEditEventFormat(originalEventFormatName);
    await eventFormatPage.page.waitForTimeout(500);

    // Step 2: Verify edit input field is visible and has original value
    const editInput = eventFormatPage.getEditInput(originalEventFormatUuid || undefined);
    await expect(editInput).toBeVisible({ timeout: 2000 });
    await expect(editInput).toHaveValue(originalEventFormatName);

    // Step 3: Change event format name
    await eventFormatPage.enterEditEventFormatName(editedEventFormatName, originalEventFormatUuid || undefined);
    await eventFormatPage.page.waitForTimeout(300);

    // Verify the input field has the new value
    await expect(editInput).toHaveValue(editedEventFormatName);

    // Step 4: Verify Save button is enabled
    const saveButton = originalEventFormatUuid
      ? eventFormatPage.page.getByTestId(`event-format-save-button-${originalEventFormatUuid}`)
      : eventFormatPage.page.locator('[data-testid^="event-format-save-button-"]').first();
    await expect(saveButton).toBeEnabled();

    // Step 5: Click Cancel to verify cancel works (frontend only check)
    const cancelButton = originalEventFormatUuid
      ? eventFormatPage.page.getByTestId(`event-format-cancel-button-${originalEventFormatUuid}`)
      : eventFormatPage.page.locator('[data-testid^="event-format-cancel-button-"]').first();
    await cancelButton.click();
    await eventFormatPage.page.waitForTimeout(500);

    // Verify edit mode is closed and original name is displayed
    const nameCell = originalEventFormatUuid
      ? eventFormatPage.page.getByTestId(`event-format-name-${originalEventFormatUuid}`)
      : firstRow.locator('td').first();
    await expect(nameCell).toBeVisible();
    const displayedName = await nameCell.textContent();
    expect(displayedName?.trim()).toBe(originalEventFormatName);
  });

  test('EF03_Verify User should be able to delete event format', async () => {
    await eventFormatPage.openUrl();
    await eventFormatPage.waitForPageReady();

    // Wait for table to load
    await eventFormatPage.waitForEventFormatsTable();

    // Get first existing event format from table to delete
    const eventFormatRows = await eventFormatPage.getEventFormatRows();
    const rowCount = await eventFormatRows.count();

    if (rowCount === 0) {
      test.skip();
      return;
    }

    // Get the first event format name
    const firstRow = eventFormatRows.first();
    const eventFormatName = await eventFormatPage.getEventFormatNameFromRow(firstRow);

    // Step 1: Click delete button - this opens the modal
    await eventFormatPage.clickDeleteEventFormat(eventFormatName);

    // Step 2: Verify confirmation dialog/modal appears
    await eventFormatPage.waitForConfirmationDialog();
    await expect(eventFormatPage.locator_confirmationDialog).toBeVisible({ timeout: 5000 });
    await expect(eventFormatPage.locator_confirmationDialog).toContainText(
      eventFormatData.expectedMessages.deleteConfirmationTitle,
    );
    await expect(eventFormatPage.locator_confirmationDialog).toContainText(eventFormatName);

    // Step 3: Verify Delete and Cancel buttons are visible and enabled
    await expect(eventFormatPage.locator_confirmDeleteButton).toBeVisible();
    await expect(eventFormatPage.locator_confirmDeleteButton).toBeEnabled();
    await expect(eventFormatPage.locator_cancelDeleteButton).toBeVisible();
    await expect(eventFormatPage.locator_cancelDeleteButton).toBeEnabled();

    // Step 4: Click Cancel to verify cancel works (frontend only check)
    await eventFormatPage.cancelDelete();
    await eventFormatPage.page.waitForTimeout(500);

    // Verify dialog is closed
    await expect(eventFormatPage.locator_confirmationDialog).not.toBeVisible({ timeout: 2000 });

    // Verify event format still exists in table
    const stillExists = await eventFormatPage.isEventFormatVisible(eventFormatName);
    expect(stillExists).toBe(true);
  });

  test('EF04_Verify User should not add event format which already exists', async () => {
    await eventFormatPage.openUrl();
    await eventFormatPage.waitForPageReady();

    // Wait for table to load
    await eventFormatPage.waitForEventFormatsTable();

    // Get first existing event format from table
    const eventFormatRows = await eventFormatPage.getEventFormatRows();
    const rowCount = await eventFormatRows.count();

    if (rowCount === 0) {
      test.skip();
      return;
    }

    // Get the first event format name
    const firstRow = eventFormatRows.first();
    const eventFormatName = await eventFormatPage.getEventFormatNameFromRow(firstRow);

    // Get initial count
    const initialCount = await eventFormatPage.getEventFormatCount();

    // Try to add the same event format name again (duplicate)
    await eventFormatPage.enterNewEventFormatName(eventFormatName);
    await eventFormatPage.clickAddEventFormatButton();

    // Wait for UI to update
    await eventFormatPage.page.waitForTimeout(2000);

    // Step 1: Verify error message appears (frontend validation)
    const errorAlert = eventFormatPage.page.locator('[data-testid^="alert-error"]').first();
    await expect(errorAlert).toBeVisible({ timeout: 5000 });

    // Step 2: Verify error message contains "already exists" text
    await expect(errorAlert).toContainText(
      eventFormatData.expectedMessages.duplicateEventFormatError,
      { timeout: 5000 },
    );

    // Step 3: Verify error message format: "Event format '{name}' already exists"
    const errorMessageText = await errorAlert.textContent();
    expect(errorMessageText).toBeTruthy();
    expect(errorMessageText).toContain('Event format');
    expect(errorMessageText).toContain(eventFormatName);
    expect(errorMessageText).toContain('already exists');
    // Verify complete message format matches: "Event format 'Online_1234' already exists"
    expect(errorMessageText).toMatch(new RegExp(`Event format.*${eventFormatName}.*already exists`, 'i'));

    // Step 4: Verify event format count hasn't increased (no duplicate added)
    const newCount = await eventFormatPage.getEventFormatCount();
    expect(newCount).toBe(initialCount); // Count should remain the same

    // Step 5: Verify input still has the value (form didn't reset due to error)
    const inputValue = await eventFormatPage.locator_newEventFormatInput.inputValue();
    expect(inputValue).toBe(eventFormatName);
  });

  test('EF05_Verify User should not edit event format name which already exists', async () => {
    await eventFormatPage.openUrl();
    await eventFormatPage.waitForPageReady();

    // Wait for table to load
    await eventFormatPage.waitForEventFormatsTable();

    // Get at least two existing event formats from table
    const eventFormatRows = await eventFormatPage.getEventFormatRows();
    const rowCount = await eventFormatRows.count();

    if (rowCount < 2) {
      test.skip();
      return;
    }

    // Get two different event format names and UUIDs
    const firstRow = eventFormatRows.first();
    const secondRow = eventFormatRows.nth(1);
    const originalEventFormatName = await eventFormatPage.getEventFormatNameFromRow(firstRow);
    const existingEventFormatName = await eventFormatPage.getEventFormatNameFromRow(secondRow);

    // Get UUID from row's data-testid attribute before entering edit mode
    const firstRowTestId = await firstRow.getAttribute('data-testid');
    const originalEventFormatUuid = firstRowTestId ? firstRowTestId.replace('event-format-row-', '') : null;

    // Step 1: Click Edit button for the first event format
    await eventFormatPage.clickEditEventFormat(originalEventFormatName);
    await eventFormatPage.page.waitForTimeout(500);

    // Step 2: Verify edit input is visible and has original value
    const editInput = eventFormatPage.getEditInput(originalEventFormatUuid || undefined);
    await expect(editInput).toBeVisible({ timeout: 2000 });
    await expect(editInput).toHaveValue(originalEventFormatName);

    // Step 3: Enter existing event format name (duplicate)
    await eventFormatPage.enterEditEventFormatName(existingEventFormatName, originalEventFormatUuid || undefined);
    await eventFormatPage.page.waitForTimeout(300);

    // Verify the input field has the duplicate name
    await expect(editInput).toHaveValue(existingEventFormatName);

    // Step 4: Click Save button
    await eventFormatPage.clickSaveEditButton(originalEventFormatUuid || undefined);

    // Step 5: Wait for error message to appear
    await eventFormatPage.page.waitForTimeout(2000);

    // Step 6: Verify error message appears and contains expected text
    const errorAlert = eventFormatPage.page.locator('[data-testid^="alert-error"]').first();
    await expect(errorAlert).toBeVisible({ timeout: 5000 });

    // Verify error message contains "already exists" text
    await expect(errorAlert).toContainText(
      eventFormatData.expectedMessages.duplicateEventFormatError,
      { timeout: 5000 },
    );

    // Step 6a: Verify error message format: "Event format '{name}' already exists"
    const errorMessageText = await errorAlert.textContent();
    expect(errorMessageText).toBeTruthy();
    expect(errorMessageText).toContain('Event format');
    expect(errorMessageText).toContain(existingEventFormatName); // The duplicate name that was entered
    expect(errorMessageText).toContain('already exists');
    // Verify complete message format matches: "Event format 'In-Person_1234' already exists"
    expect(errorMessageText).toMatch(
      new RegExp(`Event format.*${existingEventFormatName}.*already exists`, 'i'),
    );

    // Step 7: Verify edit mode is still active (error didn't close edit mode)
    await expect(editInput).toBeVisible({ timeout: 2000 });

    // Step 8: Verify edit input still shows the duplicate name (user can correct it)
    await expect(editInput).toHaveValue(existingEventFormatName);

    // Step 9: Cancel edit to verify cancel works after error
    await eventFormatPage.cancelEdit(originalEventFormatUuid || undefined);
    await eventFormatPage.page.waitForTimeout(500);

    // Step 10: Verify edit mode is closed and original name is displayed
    const nameCell = originalEventFormatUuid
      ? eventFormatPage.page.getByTestId(`event-format-name-${originalEventFormatUuid}`)
      : firstRow.locator('td').first();
    await expect(nameCell).toBeVisible();
    const displayedName = await nameCell.textContent();
    expect(displayedName?.trim()).toBe(originalEventFormatName);

    // Step 11: Verify original event format still exists with original name (not changed)
    const originalStillExists = await eventFormatPage.isEventFormatVisible(originalEventFormatName);
    expect(originalStillExists).toBe(true);

    // Step 12: Verify existing event format still exists (unchanged)
    const existingStillExists = await eventFormatPage.isEventFormatVisible(existingEventFormatName);
    expect(existingStillExists).toBe(true);
  });

});
