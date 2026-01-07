export interface MailerConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  defaultFrom: string;
  previewEmail: boolean;
}

export interface SendMailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
  }>;
}

export interface MailerModuleOptions {
  isGlobal?: boolean;
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  defaultFrom: string;
  previewEmail?: boolean;
}

export interface MailerModuleAsyncOptions {
  isGlobal?: boolean;
  useFactory: (...args: unknown[]) => Promise<MailerModuleOptions> | MailerModuleOptions;
  inject?: unknown[];
}

export interface MailResponse {
  success: boolean;
  messageId?: string;
  previewUrl?: string;
  error?: string;
}
