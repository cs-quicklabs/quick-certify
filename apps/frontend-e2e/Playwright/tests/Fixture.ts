/**
 * This file contains test fixtures and setup configurations for Playwright tests.
 * It provides custom test fixtures and global setup functionality.
 */

import { test as base, expect as baseExpect } from '@playwright/test';
import { LoginPage } from '../pageobjects/LoginPage';
import { RegistrationPage } from '../pageobjects/RegistrationPage';
import { ProfileSettingsPage } from '../pageobjects/ProfileSettingsPage';
import { AccountGeneralInfoPage } from '../pageobjects/AccountGeneralInfoPage';
import { RandomDataGenerator } from '../utils/RandomDataGenerator';
import registrationData from '../testData/registrationData.json';
import loginData from '../testData/loginData.json';
import profileData from '../testData/profileData.json';
import accountGeneralInfoData from '../testData/accountGeneralInfoData.json';

/**
 * Extends the base Playwright test with custom fixtures.
 * These fixtures provide page objects and test data for use in test cases.
 */
type Fixtures = {
  loginPage: LoginPage;
  registrationPage: RegistrationPage;
  profileSettingsPage: ProfileSettingsPage;
  accountGeneralInfoPage: AccountGeneralInfoPage;
};

type WorkerFixtures = {
  randomDataGenerator: RandomDataGenerator;
};

export const test = base.extend<Fixtures, WorkerFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  registrationPage: async ({ page }, use) => {
    const registrationPage = new RegistrationPage(page);
    await use(registrationPage);
  },

  profileSettingsPage: async ({ page }, use) => {
    const profileSettingsPage = new ProfileSettingsPage(page);
    await use(profileSettingsPage);
  },

  accountGeneralInfoPage: async ({ page }, use) => {
    const accountGeneralInfoPage = new AccountGeneralInfoPage(page);
    await use(accountGeneralInfoPage);
  },

  randomDataGenerator: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const randomDataGenerator = new RandomDataGenerator();
      await use(randomDataGenerator);
    },
    { scope: 'worker' },
  ],
});

export {
  baseExpect as expect,
  registrationData,
  loginData,
  profileData,
  accountGeneralInfoData,
  RandomDataGenerator,
};
