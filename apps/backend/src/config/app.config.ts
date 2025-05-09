import { registerAs } from '@nestjs/config';
import { AppConfig } from './app-config';
import { EnvironmentEnum } from '@/common/enums';
import validateConfig from '@/utils/validate-config';
import { AppVariablesValidator } from './app-variables.validator';

export default registerAs<AppConfig>('app', () => {
  validateConfig(process.env, AppVariablesValidator);

  return {
    env: process.env.NODE_ENV || EnvironmentEnum.Development,
    name: process.env.APP_NAME || 'Quick Certify',
    port: process.env.APP_PORT ? parseInt(process.env.APP_PORT, 10) : 8080,
    apiPrefix: process.env.API_PREFIX || 'api',
    smtpEmail: process.env.SMTP_EMAIL,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
    frontendDomain: process.env.FRONTEND_DOMAIN,
    enableHtmlEmailPreview: process.env.ENABLE_HTML_EMAIL_PREVIEW === 'true',
  };
});
