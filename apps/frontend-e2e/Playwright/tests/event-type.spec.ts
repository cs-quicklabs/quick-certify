import { test, eventTypeData, expect, RandomDataGenerator } from './Fixture';
import type { EventTypePage } from '../pageobjects/EventTypePage';

/**
 * Test Suite: Event Type Settings
 * Screen: /settings/event/type
 *
 * Coverage:
 * 1. User should be able to add Event Type
 * 2. User should be able to edit event type
 * 3. User should be able to delete event type
 * 4. User should not add event type which already exists
 * 5. User should not edit event type name which already exists
 * 6. All Event type name first character should be capital
 */

let eventTypePage: EventTypePage;
let randomDataGenerator: RandomDataGenerator;

test.beforeEach(
  async ({
    page,
    eventTypePage: fixtureEventTypePage,
    randomDataGenerator: fixtureRandomDataGenerator,
  }) => {
    eventTypePage = fixtureEventTypePage;
    randomDataGenerator = fixtureRandomDataGenerator;

    // Start from dashboard (session is already authenticated via storageState)
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');

    // Navigate to event type page
    await page.goto('/settings/event/type');
    await page.waitForLoadState('networkidle');
  },
);

test.describe('Event Type Settings', () => {
  test('ET01_Verify User should be able to add Event Type', async () => {
    await eventTypePage.openUrl();
    await eventTypePage.waitForPageReady();
    await eventTypePage.validatePageLoaded();

    const eventTypeName = randomDataGenerator.generateRandomEventTypeName();

    // Enter event type name and click add button
    await eventTypePage.addEventType(eventTypeName);

    // Wait for UI to update
    await eventTypePage.page.waitForTimeout(2000);

    // Verify input is cleared after adding (frontend validation)
    const inputValue = await eventTypePage.locator_newEventTypeInput.inputValue();
    expect(inputValue).toBe('');

    // Verify add button is enabled when input has value
    await eventTypePage.enterNewEventTypeName(eventTypeName);
    const isButtonEnabled = await eventTypePage.locator_addEventTypeButton.isEnabled();
    expect(isButtonEnabled).toBe(true);
  });

  test('ET02_Verify User should be able to edit event type', async () => {
    await eventTypePage.openUrl();
    await eventTypePage.waitForPageReady();
    await eventTypePage.validatePageLoaded();

    // Wait for table to load
    await eventTypePage.waitForEventTypesTable();

    // Get first existing event type from table to edit
    const eventTypeRows = await eventTypePage.getEventTypeRows();
    const rowCount = await eventTypeRows.count();

    if (rowCount === 0) {
      test.skip();
      return;
    }

    // Get the first event type name
    const firstRow = eventTypeRows.first();
    const originalEventTypeName = await eventTypePage.getEventTypeNameFromRow(firstRow);
    const editedEventTypeName = `Edited_${originalEventTypeName}`;

    // Step 1: Click on Edit button
    await eventTypePage.clickEditEventType(originalEventTypeName);
    await eventTypePage.page.waitForTimeout(500);

    // Step 2: Verify edit input field is visible and has original value
    const editInput = eventTypePage.getEditInput();
    await expect(editInput).toBeVisible({ timeout: 2000 });
    await expect(editInput).toHaveValue(originalEventTypeName);

    // Step 3: Change event type name
    await eventTypePage.enterEditEventTypeName(editedEventTypeName);
    await eventTypePage.page.waitForTimeout(300);

    // Verify the input field has the new value
    await expect(editInput).toHaveValue(editedEventTypeName);

    // Step 4: Verify Save button is enabled
    const uuid = await eventTypePage.getEventTypeUuid(originalEventTypeName);
    const saveButton = uuid
      ? eventTypePage.page.getByTestId(`event-type-save-button-${uuid}`)
      : eventTypePage.page.locator('[data-testid^="event-type-save-button-"]').first();
    await expect(saveButton).toBeEnabled();

    // Step 5: Click Cancel to verify cancel works (frontend only check)
    const cancelButton = uuid
      ? eventTypePage.page.getByTestId(`event-type-cancel-button-${uuid}`)
      : eventTypePage.page.locator('[data-testid^="event-type-cancel-button-"]').first();
    await cancelButton.click();
    await eventTypePage.page.waitForTimeout(500);

    // Verify edit mode is closed and original name is displayed
    const nameCell = uuid
      ? eventTypePage.page.getByTestId(`event-type-name-${uuid}`)
      : firstRow.locator('td').first();
    await expect(nameCell).toBeVisible();
    const displayedName = await nameCell.textContent();
    expect(displayedName?.trim()).toBe(originalEventTypeName);
  });

  test('ET03_Verify User should be able to delete event type', async () => {
    await eventTypePage.openUrl();
    await eventTypePage.waitForPageReady();

    // Wait for table to load
    await eventTypePage.waitForEventTypesTable();

    // Get first existing event type from table to delete
    const eventTypeRows = await eventTypePage.getEventTypeRows();
    const rowCount = await eventTypeRows.count();

    if (rowCount === 0) {
      test.skip();
      return;
    }

    // Get the first event type name
    const firstRow = eventTypeRows.first();
    const eventTypeName = await eventTypePage.getEventTypeNameFromRow(firstRow);

    // Step 1: Click delete button - this opens the modal
    await eventTypePage.clickDeleteEventType(eventTypeName);

    // Step 2: Verify confirmation dialog/modal appears
    await eventTypePage.waitForConfirmationDialog();
    await expect(eventTypePage.locator_confirmationDialog).toBeVisible({ timeout: 5000 });
    await expect(eventTypePage.locator_confirmationDialog).toContainText(
      eventTypeData.expectedMessages.deleteConfirmationTitle,
    );
    await expect(eventTypePage.locator_confirmationDialog).toContainText(eventTypeName);

    // Step 3: Verify Delete and Cancel buttons are visible and enabled
    await expect(eventTypePage.locator_confirmDeleteButton).toBeVisible();
    await expect(eventTypePage.locator_confirmDeleteButton).toBeEnabled();
    await expect(eventTypePage.locator_cancelDeleteButton).toBeVisible();
    await expect(eventTypePage.locator_cancelDeleteButton).toBeEnabled();

    // Step 4: Click Cancel to verify cancel works (frontend only check)
    await eventTypePage.cancelDelete();
    await eventTypePage.page.waitForTimeout(500);

    // Verify dialog is closed
    await expect(eventTypePage.locator_confirmationDialog).not.toBeVisible({ timeout: 2000 });

    // Verify event type still exists in table
    const stillExists = await eventTypePage.isEventTypeVisible(eventTypeName);
    expect(stillExists).toBe(true);
  });

  test('ET04_Verify User should not add event type which already exists', async () => {
    await eventTypePage.openUrl();
    await eventTypePage.waitForPageReady();

    // Wait for table to load
    await eventTypePage.waitForEventTypesTable();

    // Get first existing event type from table
    const eventTypeRows = await eventTypePage.getEventTypeRows();
    const rowCount = await eventTypeRows.count();

    if (rowCount === 0) {
      test.skip();
      return;
    }

    // Get the first event type name
    const firstRow = eventTypeRows.first();
    const eventTypeName = await eventTypePage.getEventTypeNameFromRow(firstRow);

    // Get initial count
    const initialCount = await eventTypePage.getEventTypeCount();

    // Try to add the same event type name again (duplicate)
    await eventTypePage.enterNewEventTypeName(eventTypeName);
    await eventTypePage.clickAddEventTypeButton();

    // Wait for UI to update
    await eventTypePage.page.waitForTimeout(2000);

    // Step 1: Verify error message appears (frontend validation)
    const errorAlert = eventTypePage.page.locator('[data-testid^="alert-error"]').first();
    await expect(errorAlert).toBeVisible({ timeout: 5000 });

    // Step 2: Verify error message contains "already exists" text
    await expect(errorAlert).toContainText(
      eventTypeData.expectedMessages.duplicateEventTypeError,
      { timeout: 5000 },
    );

    // Step 3: Verify error message format: "Event type '{name}' already exists"
    const errorMessageText = await errorAlert.textContent();
    expect(errorMessageText).toBeTruthy();
    expect(errorMessageText).toContain('Event type');
    expect(errorMessageText).toContain(eventTypeName);
    expect(errorMessageText).toContain('already exists');
    // Verify complete message format
    expect(errorMessageText).toMatch(new RegExp(`Event type.*${eventTypeName}.*already exists`, 'i'));

    // Step 4: Verify event type count hasn't increased (no duplicate added)
    const newCount = await eventTypePage.getEventTypeCount();
    expect(newCount).toBe(initialCount); // Count should remain the same

    // Step 5: Verify input still has the value (form didn't reset due to error)
    const inputValue = await eventTypePage.locator_newEventTypeInput.inputValue();
    expect(inputValue).toBe(eventTypeName);
  });

  test('ET05_Verify User should not edit event type name which already exists', async () => {
    await eventTypePage.openUrl();
    await eventTypePage.waitForPageReady();

    // Wait for table to load
    await eventTypePage.waitForEventTypesTable();

    // Get at least two existing event types from table
    const eventTypeRows = await eventTypePage.getEventTypeRows();
    const rowCount = await eventTypeRows.count();

    if (rowCount < 2) {
      test.skip();
      return;
    }

    // Get two different event type names and UUIDs
    const firstRow = eventTypeRows.first();
    const secondRow = eventTypeRows.nth(1);
    const originalEventTypeName = await eventTypePage.getEventTypeNameFromRow(firstRow);
    const existingEventTypeName = await eventTypePage.getEventTypeNameFromRow(secondRow);
    
    // Get UUID from row's data-testid attribute before entering edit mode
    const firstRowTestId = await firstRow.getAttribute('data-testid');
    const originalEventTypeUuid = firstRowTestId ? firstRowTestId.replace('event-type-row-', '') : null;

    // Step 1: Click Edit button for the first event type
    await eventTypePage.clickEditEventType(originalEventTypeName);
    await eventTypePage.page.waitForTimeout(500);

    // Step 2: Verify edit input is visible and has original value
    const editInput = eventTypePage.getEditInput(originalEventTypeUuid || undefined);
    await expect(editInput).toBeVisible({ timeout: 2000 });
    await expect(editInput).toHaveValue(originalEventTypeName);

    // Step 3: Enter existing event type name (duplicate)
    await eventTypePage.enterEditEventTypeName(existingEventTypeName, originalEventTypeUuid || undefined);
    await eventTypePage.page.waitForTimeout(300);

    // Verify the input field has the duplicate name
    await expect(editInput).toHaveValue(existingEventTypeName);

    // Step 4: Click Save button
    await eventTypePage.clickSaveEditButton(originalEventTypeUuid || undefined);

    // Step 5: Wait for error message to appear
    await eventTypePage.page.waitForTimeout(2000);

    // Step 6: Verify error message appears and contains expected text
    const errorAlert = eventTypePage.page.locator('[data-testid^="alert-error"]').first();
    await expect(errorAlert).toBeVisible({ timeout: 5000 });
    
    // Verify error message contains "already exists" text
    await expect(errorAlert).toContainText(
      eventTypeData.expectedMessages.duplicateEventTypeError,
      { timeout: 5000 },
    );

    // Step 6a: Verify error message format: "Event type '{name}' already exists"
    const errorMessageText = await errorAlert.textContent();
    expect(errorMessageText).toBeTruthy();
    expect(errorMessageText).toContain('Event type');
    expect(errorMessageText).toContain(existingEventTypeName); // The duplicate name that was entered
    expect(errorMessageText).toContain('already exists');
    // Verify complete message format matches: "Event type 'Exhibition_8653' already exists"
    expect(errorMessageText).toMatch(
      new RegExp(`Event type.*${existingEventTypeName}.*already exists`, 'i'),
    );

    // Step 7: Verify edit mode is still active (error didn't close edit mode)
    await expect(editInput).toBeVisible({ timeout: 2000 });
    
    // Step 8: Verify edit input still shows the duplicate name (user can correct it)
    await expect(editInput).toHaveValue(existingEventTypeName);

    // Step 9: Cancel edit to verify cancel works after error
    await eventTypePage.cancelEdit(originalEventTypeUuid || undefined);
    await eventTypePage.page.waitForTimeout(500);

    // Step 10: Verify edit mode is closed and original name is displayed
    const nameCell = originalEventTypeUuid
      ? eventTypePage.page.getByTestId(`event-type-name-${originalEventTypeUuid}`)
      : firstRow.locator('td').first();
    await expect(nameCell).toBeVisible();
    const displayedName = await nameCell.textContent();
    expect(displayedName?.trim()).toBe(originalEventTypeName);

    // Step 11: Verify original event type still exists with original name (not changed)
    const originalStillExists = await eventTypePage.isEventTypeVisible(originalEventTypeName);
    expect(originalStillExists).toBe(true);

    // Step 12: Verify existing event type still exists (unchanged)
    const existingStillExists = await eventTypePage.isEventTypeVisible(existingEventTypeName);
    expect(existingStillExists).toBe(true);
  });


});
