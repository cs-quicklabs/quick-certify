/**
 * This file contains test fixtures and setup configurations for Playwright tests.
 * It provides custom test fixtures and global setup functionality.
 */

import { test as base, expect as baseExpect } from '@playwright/test';
import { LoginPage } from '../pageobjects/LoginPage';
import { RegistrationPage } from '../pageobjects/RegistrationPage';
import { RandomDataGenerator } from '../utils/RandomDataGenerator';
import registrationData from '../testData/registrationData.json';
import loginData from '../testData/loginData.json';

/**
 * Extends the base Playwright test with custom fixtures.
 * These fixtures provide page objects and test data for use in test cases.
 */
type Fixtures = {
  loginPage: LoginPage;
  registrationPage: RegistrationPage;
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

  randomDataGenerator: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const randomDataGenerator = new RandomDataGenerator();
      await use(randomDataGenerator);
    },
    { scope: 'worker' },
  ],
});

export { baseExpect as expect, registrationData, loginData, RandomDataGenerator };
