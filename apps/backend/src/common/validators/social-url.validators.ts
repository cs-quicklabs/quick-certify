import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

// Helper function to validate URL structure
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

// LinkedIn URL validator with pattern matching
export function IsLinkedInUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isLinkedInUrl',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string | null | undefined, _args: ValidationArguments) {
          if (value === null || value === undefined || value === '')
            return true; // Allow empty values
          if (!isValidUrl(value)) return false;

          const url = new URL(value);

          // LinkedIn URLs should be on linkedin.com domain
          const isLinkedInDomain =
            url.hostname === 'linkedin.com' ||
            url.hostname === 'www.linkedin.com' ||
            url.hostname.endsWith('.linkedin.com');

          if (!isLinkedInDomain) return false;

          // Common LinkedIn URL patterns
          const validPatterns = [
            /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i, // Profile URLs
            /^https?:\/\/(www\.)?linkedin\.com\/company\/[\w-]+\/?$/i, // Company pages
            /^https?:\/\/(www\.)?linkedin\.com\/school\/[\w-]+\/?$/i, // School pages
            /^https?:\/\/(www\.)?linkedin\.com\/(showcase|pub|groups)\/[\w-]+/i, // Other LinkedIn entities
          ];

          return validPatterns.some((pattern) => pattern.test(value));
        },
        defaultMessage(_args: ValidationArguments) {
          return 'The provided URL is not a valid LinkedIn profile or company URL. It should be in the format https://www.linkedin.com/in/username or https://www.linkedin.com/company/company-name';
        },
      },
    });
  };
}

// Facebook URL validator with pattern matching
export function IsFacebookUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isFacebookUrl',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string | null | undefined, _args: ValidationArguments) {
          if (value === null || value === '') return true; // Allow empty values
          if (!isValidUrl(value)) return false;

          const url = new URL(value);

          // Facebook URLs should be on facebook.com domain
          const isFacebookDomain =
            url.hostname === 'facebook.com' ||
            url.hostname === 'www.facebook.com' ||
            url.hostname.endsWith('.facebook.com');

          if (!isFacebookDomain) return false;

          // Common Facebook URL patterns
          const validPatterns = [
            /^https?:\/\/(www\.)?facebook\.com\/[\w.]+\/?$/i, // Profile/Page URLs
            /^https?:\/\/(www\.)?facebook\.com\/pages\/[\w-]+\/\d+\/?$/i, // Pages with IDs
            /^https?:\/\/(www\.)?facebook\.com\/groups\/[\w-]+\/?$/i, // Groups
            /^https?:\/\/(www\.)?facebook\.com\/profile\.php\?id=\d+\/?$/i, // Profile URLs with IDs
          ];

          return validPatterns.some((pattern) => pattern.test(value));
        },
        defaultMessage(_args: ValidationArguments) {
          return 'The provided URL is not a valid Facebook page or profile URL. It should be in the format https://www.facebook.com/pagename';
        },
      },
    });
  };
}

// Twitter/X URL validator with pattern matching
export function IsTwitterUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isTwitterUrl',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string | null | undefined, _args: ValidationArguments) {
          if (value === null || value === '') return true; // Allow empty values
          if (!isValidUrl(value)) return false;

          const url = new URL(value);

          // Twitter URLs can be on twitter.com or x.com domains
          const isTwitterDomain =
            url.hostname === 'twitter.com' ||
            url.hostname === 'www.twitter.com' ||
            url.hostname === 'x.com' ||
            url.hostname === 'www.x.com';

          if (!isTwitterDomain) return false;

          // Common Twitter URL patterns
          const validPatterns = [
            /^https?:\/\/(www\.)?(twitter|x)\.com\/[a-zA-Z0-9_]{1,15}\/?$/i, // Profile URLs
            /^https?:\/\/(www\.)?(twitter|x)\.com\/[a-zA-Z0-9_]{1,15}\/status\/\d+$/i, // Tweet URLs
          ];

          return validPatterns.some((pattern) => pattern.test(value));
        },
        defaultMessage(_args: ValidationArguments) {
          return 'The provided URL is not a valid Twitter/X profile URL. It should be in the format https://twitter.com/username or https://x.com/username';
        },
      },
    });
  };
}

// Website URL validator with more comprehensive checks
export function IsWebsiteUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isWebsiteUrl',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: string | null | undefined, _args: ValidationArguments) {
          if (value === null || value === '') return true; // Allow empty values
          if (!isValidUrl(value)) return false;

          const url = new URL(value);

          // Website URLs should have a valid protocol (http or https)
          const hasValidProtocol =
            url.protocol === 'http:' || url.protocol === 'https:';

          // Must have a valid domain with at least one dot
          const hasValidDomain =
            url.hostname.includes('.') && url.hostname.length >= 3;

          // Known invalid TLDs to filter out
          const invalidTLDs = ['.invalid', '.example', '.test', '.localhost'];
          const hasValidTLD = !invalidTLDs.some((tld) =>
            url.hostname.endsWith(tld)
          );

          return hasValidProtocol && hasValidDomain && hasValidTLD;
        },
        defaultMessage(_args: ValidationArguments) {
          return 'The provided URL is not a valid website URL. It should start with http:// or https:// and contain a valid domain name';
        },
      },
    });
  };
}
