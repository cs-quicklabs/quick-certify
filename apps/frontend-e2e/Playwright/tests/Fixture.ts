/**
 * This file contains test fixtures and setup configurations for Playwright tests.
 * It provides custom test fixtures and global setup functionality.
 */

import { test as base, expect as baseExpect } from '@playwright/test';
import { LoginPage } from '../pageobjects/LoginPage';
import { RegistrationPage } from '../pageobjects/RegistrationPage';
import { ProfileSettingsPage } from '../pageobjects/ProfileSettingsPage';
import { AccountGeneralInfoPage } from '../pageobjects/AccountGeneralInfoPage';
import { AccountSocialLinksPage } from '../pageobjects/AccountSocialLinksPage';
import { AccountBrandingPage } from '../pageobjects/AccountBrandingPage';
import { AccountIssuerPortalPage } from '../pageobjects/AccountIssuerPortalPage';
import { AccountSkillsPage } from '../pageobjects/AccountSkillsPage';
import { RandomDataGenerator } from '../utils/RandomDataGenerator';
import registrationData from '../testData/registrationData.json';
import loginData from '../testData/loginData.json';
import profileData from '../testData/profileData.json';
import accountGeneralInfoData from '../testData/accountGeneralInfoData.json';
import socialLinksData from '../testData/socialLinksData.json';
import brandingData from '../testData/brandingData.json';
import issuerPortalData from '../testData/issuerPortalData.json';
import skillsData from '../testData/skillsData.json';

/**
 * Extends the base Playwright test with custom fixtures.
 * These fixtures provide page objects and test data for use in test cases.
 */
type Fixtures = {
  loginPage: LoginPage;
  registrationPage: RegistrationPage;
  profileSettingsPage: ProfileSettingsPage;
  accountGeneralInfoPage: AccountGeneralInfoPage;
  accountSocialLinksPage: AccountSocialLinksPage;
  accountBrandingPage: AccountBrandingPage;
  accountIssuerPortalPage: AccountIssuerPortalPage;
  accountSkillsPage: AccountSkillsPage;
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

  accountSocialLinksPage: async ({ page }, use) => {
    const accountSocialLinksPage = new AccountSocialLinksPage(page);
    await use(accountSocialLinksPage);
  },

  accountBrandingPage: async ({ page }, use) => {
    const accountBrandingPage = new AccountBrandingPage(page);
    await use(accountBrandingPage);
  },

  accountIssuerPortalPage: async ({ page }, use) => {
    const accountIssuerPortalPage = new AccountIssuerPortalPage(page);
    await use(accountIssuerPortalPage);
  },

  accountSkillsPage: async ({ page }, use) => {
    const accountSkillsPage = new AccountSkillsPage(page);
    await use(accountSkillsPage);
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
  socialLinksData,
  brandingData,
  issuerPortalData,
  skillsData,
  RandomDataGenerator,
};
