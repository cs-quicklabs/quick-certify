export type AppConfig = {
  env: string;
  name: string;
  port: number;
  apiPrefix: string;
  smtpEmail?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  frontendDomain?: string;
  enableHtmlEmailPreview: boolean;
};
