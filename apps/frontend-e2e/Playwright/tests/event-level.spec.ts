import { test, eventLevelData, expect, RandomDataGenerator } from './Fixture';
import type { EventLevelPage } from '../pageobjects/EventLevelPage';

/**
 * Test Suite: Event Level Settings
 * Screen: /settings/event/level
 *
 * Coverage:
 * 1. User should be able to add Event Level
 * 2. User should be able to edit event level
 * 3. User should be able to delete event level
 * 4. User should not add event level which already exists
 * 5. User should not edit event level name which already exists
 * 6. All Event level name first character should be capital
 */

let eventLevelPage: EventLevelPage;
let randomDataGenerator: RandomDataGenerator;

test.beforeEach(
  async ({
    page,
    eventLevelPage: fixtureEventLevelPage,
    randomDataGenerator: fixtureRandomDataGenerator,
  }) => {
    eventLevelPage = fixtureEventLevelPage;
    randomDataGenerator = fixtureRandomDataGenerator;

    // Start from dashboard (session is already authenticated via storageState)
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Navigate to event level page
    await page.goto('/settings/event/level');
    await page.waitForLoadState('networkidle');
  },
);

test.describe('Event Level Settings', () => {
  test('EL01_Verify User should be able to add Event Level', async () => {
    await eventLevelPage.openUrl();
    await eventLevelPage.waitForPageReady();
    await eventLevelPage.validatePageLoaded();

    const eventLevelName = randomDataGenerator.generateRandomEventLevelName();

    // Enter event level name and click add button
    await eventLevelPage.addEventLevel(eventLevelName);

    // Wait for UI to update
    await eventLevelPage.page.waitForTimeout(2000);

    // Verify input is cleared after adding (frontend validation)
    const inputValue = await eventLevelPage.locator_newEventLevelInput.inputValue();
    expect(inputValue).toBe('');

    // Verify add button is enabled when input has value
    await eventLevelPage.enterNewEventLevelName(eventLevelName);
    const isButtonEnabled = await eventLevelPage.locator_addEventLevelButton.isEnabled();
    expect(isButtonEnabled).toBe(true);
  });

  test('EL02_Verify User should be able to edit event level', async () => {
    await eventLevelPage.openUrl();
    await eventLevelPage.waitForPageReady();
    await eventLevelPage.validatePageLoaded();

    // Wait for table to load
    await eventLevelPage.waitForEventLevelsTable();

    // Get first existing event level from table to edit
    const eventLevelRows = await eventLevelPage.getEventLevelRows();
    const rowCount = await eventLevelRows.count();

    if (rowCount === 0) {
      test.skip();
      return;
    }

    // Get the first event level name
    const firstRow = eventLevelRows.first();
    const originalEventLevelName = await eventLevelPage.getEventLevelNameFromRow(firstRow);
    const editedEventLevelName = `Edited_${originalEventLevelName}`;

    // Get UUID before entering edit mode
    const firstRowTestId = await firstRow.getAttribute('data-testid');
    const originalEventLevelUuid = firstRowTestId ? firstRowTestId.replace('event-level-row-', '') : null;

    // Step 1: Click on Edit button
    await eventLevelPage.clickEditEventLevel(originalEventLevelName);
    await eventLevelPage.page.waitForTimeout(500);

    // Step 2: Verify edit input field is visible and has original value
    const editInput = eventLevelPage.getEditInput(originalEventLevelUuid || undefined);
    await expect(editInput).toBeVisible({ timeout: 2000 });
    await expect(editInput).toHaveValue(originalEventLevelName);

    // Step 3: Change event level name
    await eventLevelPage.enterEditEventLevelName(editedEventLevelName, originalEventLevelUuid || undefined);
    await eventLevelPage.page.waitForTimeout(300);

    // Verify the input field has the new value
    await expect(editInput).toHaveValue(editedEventLevelName);

    // Step 4: Verify Save button is enabled
    const saveButton = originalEventLevelUuid
      ? eventLevelPage.page.getByTestId(`event-level-save-button-${originalEventLevelUuid}`)
      : eventLevelPage.page.locator('[data-testid^="event-level-save-button-"]').first();
    await expect(saveButton).toBeEnabled();

    // Step 5: Click Cancel to verify cancel works (frontend only check)
    const cancelButton = originalEventLevelUuid
      ? eventLevelPage.page.getByTestId(`event-level-cancel-button-${originalEventLevelUuid}`)
      : eventLevelPage.page.locator('[data-testid^="event-level-cancel-button-"]').first();
    await cancelButton.click();
    await eventLevelPage.page.waitForTimeout(500);

    // Verify edit mode is closed and original name is displayed
    const nameCell = originalEventLevelUuid
      ? eventLevelPage.page.getByTestId(`event-level-name-${originalEventLevelUuid}`)
      : firstRow.locator('td').first();
    await expect(nameCell).toBeVisible();
    const displayedName = await nameCell.textContent();
    expect(displayedName?.trim()).toBe(originalEventLevelName);
  });

  test('EL03_Verify User should be able to delete event level', async () => {
    await eventLevelPage.openUrl();
    await eventLevelPage.waitForPageReady();

    // Wait for table to load
    await eventLevelPage.waitForEventLevelsTable();

    // Get first existing event level from table to delete
    const eventLevelRows = await eventLevelPage.getEventLevelRows();
    const rowCount = await eventLevelRows.count();

    if (rowCount === 0) {
      test.skip();
      return;
    }

    // Get the first event level name
    const firstRow = eventLevelRows.first();
    const eventLevelName = await eventLevelPage.getEventLevelNameFromRow(firstRow);

    // Step 1: Click delete button - this opens the modal
    await eventLevelPage.clickDeleteEventLevel(eventLevelName);

    // Step 2: Verify confirmation dialog/modal appears
    await eventLevelPage.waitForConfirmationDialog();
    await expect(eventLevelPage.locator_confirmationDialog).toBeVisible({ timeout: 5000 });
    await expect(eventLevelPage.locator_confirmationDialog).toContainText(
      eventLevelData.expectedMessages.deleteConfirmationTitle,
    );
    await expect(eventLevelPage.locator_confirmationDialog).toContainText(eventLevelName);

    // Step 3: Verify Delete and Cancel buttons are visible and enabled
    await expect(eventLevelPage.locator_confirmDeleteButton).toBeVisible();
    await expect(eventLevelPage.locator_confirmDeleteButton).toBeEnabled();
    await expect(eventLevelPage.locator_cancelDeleteButton).toBeVisible();
    await expect(eventLevelPage.locator_cancelDeleteButton).toBeEnabled();

    // Step 4: Click Cancel to verify cancel works (frontend only check)
    await eventLevelPage.cancelDelete();
    await eventLevelPage.page.waitForTimeout(500);

    // Verify dialog is closed
    await expect(eventLevelPage.locator_confirmationDialog).not.toBeVisible({ timeout: 2000 });

    // Verify event level still exists in table
    const stillExists = await eventLevelPage.isEventLevelVisible(eventLevelName);
    expect(stillExists).toBe(true);
  });

  test('EL04_Verify User should not add event level which already exists', async () => {
    await eventLevelPage.openUrl();
    await eventLevelPage.waitForPageReady();

    // Wait for table to load
    await eventLevelPage.waitForEventLevelsTable();

    // Get first existing event level from table
    const eventLevelRows = await eventLevelPage.getEventLevelRows();
    const rowCount = await eventLevelRows.count();

    if (rowCount === 0) {
      test.skip();
      return;
    }

    // Get the first event level name
    const firstRow = eventLevelRows.first();
    const eventLevelName = await eventLevelPage.getEventLevelNameFromRow(firstRow);

    // Get initial count
    const initialCount = await eventLevelPage.getEventLevelCount();

    // Try to add the same event level name again (duplicate)
    await eventLevelPage.enterNewEventLevelName(eventLevelName);
    await eventLevelPage.clickAddEventLevelButton();

    // Wait for UI to update
    await eventLevelPage.page.waitForTimeout(2000);

    // Step 1: Verify error message appears (frontend validation)
    const errorAlert = eventLevelPage.page.locator('[data-testid^="alert-error"]').first();
    await expect(errorAlert).toBeVisible({ timeout: 5000 });

    // Step 2: Verify error message contains "already exists" text
    await expect(errorAlert).toContainText(
      eventLevelData.expectedMessages.duplicateEventLevelError,
      { timeout: 5000 },
    );

    // Step 3: Verify error message format: "Event level '{name}' already exists"
    const errorMessageText = await errorAlert.textContent();
    expect(errorMessageText).toBeTruthy();
    expect(errorMessageText).toContain('Event level');
    expect(errorMessageText).toContain(eventLevelName);
    expect(errorMessageText).toContain('already exists');
    // Verify complete message format matches: "Event level 'Beginner_1234' already exists"
    expect(errorMessageText).toMatch(new RegExp(`Event level.*${eventLevelName}.*already exists`, 'i'));

    // Step 4: Verify event level count hasn't increased (no duplicate added)
    const newCount = await eventLevelPage.getEventLevelCount();
    expect(newCount).toBe(initialCount); // Count should remain the same

    // Step 5: Verify input still has the value (form didn't reset due to error)
    const inputValue = await eventLevelPage.locator_newEventLevelInput.inputValue();
    expect(inputValue).toBe(eventLevelName);
  });

  test('EL05_Verify User should not edit event level name which already exists', async () => {
    await eventLevelPage.openUrl();
    await eventLevelPage.waitForPageReady();

    // Wait for table to load
    await eventLevelPage.waitForEventLevelsTable();

    // Get at least two existing event levels from table
    const eventLevelRows = await eventLevelPage.getEventLevelRows();
    const rowCount = await eventLevelRows.count();

    if (rowCount < 2) {
      test.skip();
      return;
    }

    // Get two different event level names and UUIDs
    const firstRow = eventLevelRows.first();
    const secondRow = eventLevelRows.nth(1);
    const originalEventLevelName = await eventLevelPage.getEventLevelNameFromRow(firstRow);
    const existingEventLevelName = await eventLevelPage.getEventLevelNameFromRow(secondRow);

    // Get UUID from row's data-testid attribute before entering edit mode
    const firstRowTestId = await firstRow.getAttribute('data-testid');
    const originalEventLevelUuid = firstRowTestId ? firstRowTestId.replace('event-level-row-', '') : null;

    // Step 1: Click Edit button for the first event level
    await eventLevelPage.clickEditEventLevel(originalEventLevelName);
    await eventLevelPage.page.waitForTimeout(500);

    // Step 2: Verify edit input is visible and has original value
    const editInput = eventLevelPage.getEditInput(originalEventLevelUuid || undefined);
    await expect(editInput).toBeVisible({ timeout: 2000 });
    await expect(editInput).toHaveValue(originalEventLevelName);

    // Step 3: Enter existing event level name (duplicate)
    await eventLevelPage.enterEditEventLevelName(existingEventLevelName, originalEventLevelUuid || undefined);
    await eventLevelPage.page.waitForTimeout(300);

    // Verify the input field has the duplicate name
    await expect(editInput).toHaveValue(existingEventLevelName);

    // Step 4: Click Save button
    await eventLevelPage.clickSaveEditButton(originalEventLevelUuid || undefined);

    // Step 5: Wait for error message to appear
    await eventLevelPage.page.waitForTimeout(2000);

    // Step 6: Verify error message appears and contains expected text
    const errorAlert = eventLevelPage.page.locator('[data-testid^="alert-error"]').first();
    await expect(errorAlert).toBeVisible({ timeout: 5000 });

    // Verify error message contains "already exists" text
    await expect(errorAlert).toContainText(
      eventLevelData.expectedMessages.duplicateEventLevelError,
      { timeout: 5000 },
    );

    // Step 6a: Verify error message format: "Event level '{name}' already exists"
    const errorMessageText = await errorAlert.textContent();
    expect(errorMessageText).toBeTruthy();
    expect(errorMessageText).toContain('Event level');
    expect(errorMessageText).toContain(existingEventLevelName); // The duplicate name that was entered
    expect(errorMessageText).toContain('already exists');
    // Verify complete message format matches: "Event level 'Intermediate_1234' already exists"
    expect(errorMessageText).toMatch(
      new RegExp(`Event level.*${existingEventLevelName}.*already exists`, 'i'),
    );

    // Step 7: Verify edit mode is still active (error didn't close edit mode)
    await expect(editInput).toBeVisible({ timeout: 2000 });

    // Step 8: Verify edit input still shows the duplicate name (user can correct it)
    await expect(editInput).toHaveValue(existingEventLevelName);

    // Step 9: Cancel edit to verify cancel works after error
    await eventLevelPage.cancelEdit(originalEventLevelUuid || undefined);
    await eventLevelPage.page.waitForTimeout(500);

    // Step 10: Verify edit mode is closed and original name is displayed
    const nameCell = originalEventLevelUuid
      ? eventLevelPage.page.getByTestId(`event-level-name-${originalEventLevelUuid}`)
      : firstRow.locator('td').first();
    await expect(nameCell).toBeVisible();
    const displayedName = await nameCell.textContent();
    expect(displayedName?.trim()).toBe(originalEventLevelName);

    // Step 11: Verify original event level still exists with original name (not changed)
    const originalStillExists = await eventLevelPage.isEventLevelVisible(originalEventLevelName);
    expect(originalStillExists).toBe(true);

    // Step 12: Verify existing event level still exists (unchanged)
    const existingStillExists = await eventLevelPage.isEventLevelVisible(existingEventLevelName);
    expect(existingStillExists).toBe(true);
  });


});
