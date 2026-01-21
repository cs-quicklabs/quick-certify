import { Injectable } from '@nestjs/common';
import { DEFAULT_LOCALE, I18nParams, Locale, t } from './i18n.config';
import { getCurrentLocale } from './i18n.context';

/**
 * Minimal backend i18n service.
 */
@Injectable()
export class I18nService {
  get locale(): Locale {
    return getCurrentLocale() ?? DEFAULT_LOCALE;
  }

  t(key: string, params?: I18nParams): string {
    return t(key, params, this.locale);
  }
}

