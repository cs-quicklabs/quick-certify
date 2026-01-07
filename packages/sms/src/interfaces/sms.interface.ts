export interface SmsModuleOptions {
  isGlobal?: boolean;
  accountSid: string;
  authToken: string;
  fromNumber: string;
  previewMode?: boolean;
}

export interface SmsModuleAsyncOptions {
  isGlobal?: boolean;
  useFactory: (...args: unknown[]) => Promise<SmsModuleOptions> | SmsModuleOptions;
  inject?: unknown[];
}

export interface SendSmsOptions {
  to: string;
  body: string;
  from?: string;
  mediaUrl?: string[];
}

export interface SmsResponse {
  success: boolean;
  messageId?: string;
  status?: string;
  previewData?: {
    to: string;
    from: string;
    body: string;
    sentAt: string;
  };
  error?: string;
}
