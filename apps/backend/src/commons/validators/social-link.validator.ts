import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

/**
 * Social Link URL Patterns
 */
const SOCIAL_PATTERNS = {
  linkedin: /^https?:\/\/(www\.)?linkedin\.com\/(company|in|school)\/[\w-]+\/?$/i,
  facebook: /^https?:\/\/(www\.)?(facebook|fb)\.com\/[\w.-]+\/?$/i,
  twitter: /^https?:\/\/(www\.)?(twitter|x)\.com\/[\w]+\/?$/i,
  website: /^https?:\/\/.+$/i,
} as const;

/**
 * LinkedIn URL Validator
 */
@ValidatorConstraint({ async: false })
export class IsLinkedInUrlConstraint implements ValidatorConstraintInterface {
  validate(url: string): boolean {
    if (!url || url.trim() === '') return true; // Optional field
    return SOCIAL_PATTERNS.linkedin.test(url);
  }

  defaultMessage(): string {
    return 'Please provide a valid LinkedIn URL (e.g., https://linkedin.com/company/your-company)';
  }
}

/**
 * Facebook URL Validator
 */
@ValidatorConstraint({ async: false })
export class IsFacebookUrlConstraint implements ValidatorConstraintInterface {
  validate(url: string): boolean {
    if (!url || url.trim() === '') return true; // Optional field
    return SOCIAL_PATTERNS.facebook.test(url);
  }

  defaultMessage(): string {
    return 'Please provide a valid Facebook URL (e.g., https://facebook.com/your-page)';
  }
}

/**
 * Twitter/X URL Validator
 */
@ValidatorConstraint({ async: false })
export class IsTwitterUrlConstraint implements ValidatorConstraintInterface {
  validate(url: string): boolean {
    if (!url || url.trim() === '') return true; // Optional field
    return SOCIAL_PATTERNS.twitter.test(url);
  }

  defaultMessage(): string {
    return 'Please provide a valid Twitter/X URL (e.g., https://twitter.com/your-handle)';
  }
}

/**
 * Website URL Validator
 */
@ValidatorConstraint({ async: false })
export class IsWebsiteUrlConstraint implements ValidatorConstraintInterface {
  validate(url: string): boolean {
    if (!url || url.trim() === '') return true; // Optional field
    return SOCIAL_PATTERNS.website.test(url);
  }

  defaultMessage(): string {
    return 'Please provide a valid website URL (must start with http:// or https://)';
  }
}

/**
 * Decorator for LinkedIn URL validation
 */
export function IsLinkedInUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsLinkedInUrlConstraint,
    });
  };
}

/**
 * Decorator for Facebook URL validation
 */
export function IsFacebookUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsFacebookUrlConstraint,
    });
  };
}

/**
 * Decorator for Twitter/X URL validation
 */
export function IsTwitterUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsTwitterUrlConstraint,
    });
  };
}

/**
 * Decorator for Website URL validation
 */
export function IsWebsiteUrl(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsWebsiteUrlConstraint,
    });
  };
}

