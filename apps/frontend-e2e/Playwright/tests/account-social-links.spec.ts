import { test, socialLinksData } from './Fixture';
import type { AccountSocialLinksPage } from '../pageobjects/AccountSocialLinksPage';

/**
 * Test Suite: Account Settings - Social Links
 * Screen: /settings/account/social-links
 *
 * Coverage:
 * - Super Admin can add valid social links for a company
 * - Error shown when an invalid social link (wrong domain) is entered
 * - Error shown for incorrect URL format in social links
 */

let accountSocialLinksPage: AccountSocialLinksPage;

test.beforeEach(async ({ page, loginPage, accountSocialLinksPage: fixtureAccountSocialLinksPage }) => {
  accountSocialLinksPage = fixtureAccountSocialLinksPage;

  const userName = process.env.USER_EMAIL;
  const password = process.env.USER_PASS;

  if (!userName || !password) {
    throw new Error('USER_EMAIL / USER_PASS must be set for authenticated E2E tests');
  }

  await page.goto('/settings/account/social-links');

  const currentUrl = page.url();
  if (currentUrl.includes('/login')) {
    await loginPage.enterUserEmail(userName);
    await loginPage.enterPassword(password);
    await Promise.all([
      loginPage.clickOnSigninBtn(),
      page.waitForURL(/\/(dashboard|settings)/, { timeout: 20000 }),
    ]);
    await page.goto('/settings/account/social-links');
    await page.waitForLoadState('networkidle');
  } else {
    await page.waitForLoadState('networkidle');
  }
});

test.describe('Account Settings - Social Links', () => {
  test('SL01_Verify Super Admin can add valid social links for a company', async ({ page }) => {
    await accountSocialLinksPage.openUrl();
    await accountSocialLinksPage.waitForFormReady();
    await accountSocialLinksPage.validatePageLoaded();

    const data = {
      linkedin_url: socialLinksData.formData.validLinkedinUrl,
      facebook_url: socialLinksData.formData.validFacebookUrl,
      twitter_url: socialLinksData.formData.validTwitterUrl,
      website: socialLinksData.formData.validWebsiteUrl,
    };

    await Promise.all([
      accountSocialLinksPage.saveSocialLinks(data),
      page
        .waitForResponse(
          (resp) =>
            resp.url().includes('/organizations/settings/social-links') && resp.status() === 200,
          { timeout: 10000 },
        )
        .catch(() => {}),
    ]);

    await accountSocialLinksPage.validateSuccessMessage(socialLinksData.expectedMessages.successMessage);

    // Verify values persist after reload
    await page.reload();
    await accountSocialLinksPage.waitForFormReady();
    await accountSocialLinksPage.validateFieldValues(data);
  });

  test('SL02_Verify error is shown when an invalid social link is entered (wrong LinkedIn domain)', async () => {
    await accountSocialLinksPage.openUrl();
    await accountSocialLinksPage.waitForFormReady();

    await accountSocialLinksPage.enterLinkedInUrl(socialLinksData.formData.invalidLinkedinWrongDomain);
    await accountSocialLinksPage.clickSaveButton();

    await accountSocialLinksPage.page.waitForTimeout(1500);

    await accountSocialLinksPage.validateFieldError(
      'linkedin_url',
      socialLinksData.expectedMessages.linkedinInvalidUrl,
    );
    await accountSocialLinksPage.validateNoSuccessMessage();
  });

  test('SL03_Verify error is shown for incorrect URL format in social links (website must include protocol)', async () => {
    await accountSocialLinksPage.openUrl();
    await accountSocialLinksPage.waitForFormReady();

    await accountSocialLinksPage.enterWebsite(socialLinksData.formData.invalidWebsiteMissingProtocol);
    await accountSocialLinksPage.clickSaveButton();

    await accountSocialLinksPage.page.waitForTimeout(1500);

    await accountSocialLinksPage.validateFieldError(
      'website',
      socialLinksData.expectedMessages.websiteInvalidUrlFormat,
    );
    await accountSocialLinksPage.validateNoSuccessMessage();
  });
});
