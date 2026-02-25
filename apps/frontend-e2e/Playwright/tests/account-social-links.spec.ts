import { test, socialLinksData, AccountSocialLinksPage } from './Fixture';

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

test.beforeEach(async ({ accountSocialLinksPage: fixtureAccountSocialLinksPage }) => {
  accountSocialLinksPage = fixtureAccountSocialLinksPage;
  await accountSocialLinksPage.gotoAccountSocialLinkPage();
});

test.describe('Account Settings - Social Links', () => {
  test('SL01_Verify Super Admin can add valid social links for a company', async ({}) => {
    const data = {
      linkedin_url: socialLinksData.formData.validLinkedinUrl,
      facebook_url: socialLinksData.formData.validFacebookUrl,
      twitter_url: socialLinksData.formData.validTwitterUrl,
      website: socialLinksData.formData.validWebsiteUrl,
    };
    await accountSocialLinksPage.saveSocialLinks(data);
    await accountSocialLinksPage.validateSuccessMessage(
      socialLinksData.expectedMessages.successMessage,
    );
    await accountSocialLinksPage.validateFieldValues(data);
  });

  test('SL02_Verify error is shown when an invalid social link is entered (wrong LinkedIn domain)', async () => {
    await accountSocialLinksPage.enterLinkedInUrl(
      socialLinksData.formData.invalidLinkedinWrongDomain,
    );
    await accountSocialLinksPage.clickSaveButton();
    await accountSocialLinksPage.validateFieldError(
      'linkedin_url',
      socialLinksData.expectedMessages.linkedinInvalidUrl,
    );
    await accountSocialLinksPage.validateNoSuccessMessage();
  });

  test('SL03_Verify error is shown for incorrect URL format in social links (website must include protocol)', async () => {
    await accountSocialLinksPage.enterWebsite(
      socialLinksData.formData.invalidWebsiteMissingProtocol,
    );
    await accountSocialLinksPage.clickSaveButton();
    await accountSocialLinksPage.validateFieldError(
      'website',
      socialLinksData.expectedMessages.websiteInvalidUrlFormat,
    );
    await accountSocialLinksPage.validateNoSuccessMessage();
  });
});
