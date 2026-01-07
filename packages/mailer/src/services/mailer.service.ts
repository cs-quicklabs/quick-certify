import { Inject, Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { exec } from 'child_process';
import { promisify } from 'util';
import { MAILER_OPTIONS } from '../constants';
import { MailerModuleOptions, SendMailOptions, MailResponse } from '../interfaces';

const execAsync = promisify(exec);

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: Transporter;

  constructor(
    @Inject(MAILER_OPTIONS)
    private readonly options: MailerModuleOptions,
  ) {
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    if (this.options.previewEmail) {
      // Use ethereal email for dev preview
      this.createTestAccount();
    } else {
      this.transporter = nodemailer.createTransport({
        host: this.options.host,
        port: this.options.port,
        secure: this.options.secure,
        auth: this.options.auth,
      });
    }
  }

  private async createTestAccount(): Promise<void> {
    try {
      // Create a test account on ethereal.email
      const testAccount = await nodemailer.createTestAccount();

      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      this.logger.log(`📧 Preview email account created: ${testAccount.user}`);
    } catch (error) {
      this.logger.warn('Failed to create test account, using configured settings');
      this.transporter = nodemailer.createTransport({
        host: this.options.host,
        port: this.options.port,
        secure: this.options.secure,
        auth: this.options.auth,
      });
    }
  }

  /**
   * Send an email
   * @param options - Email options (to, subject, html/text, etc.)
   * @returns MailResponse with success status and messageId/previewUrl
   */
  async sendMail(options: SendMailOptions): Promise<MailResponse> {
    try {
      const mailOptions = {
        from: options.from || this.options.defaultFrom,
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments,
      };

      const info = await this.transporter.sendMail(mailOptions);

      let previewUrl: string | undefined;

      // In preview mode, get the preview URL and open in browser
      if (this.options.previewEmail) {
        previewUrl = nodemailer.getTestMessageUrl(info) as string;
        if (previewUrl) {
          this.logger.log(`📧 Email Preview URL: ${previewUrl}`);
          await this.openInBrowser(previewUrl);
        }
      }

      this.logger.log(`📧 Email sent successfully to ${options.to}: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
        previewUrl,
      };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async openInBrowser(url: string): Promise<void> {
    try {
      const platform = process.platform;
      let command: string;

      switch (platform) {
        case 'darwin':
          command = `open "${url}"`;
          break;
        case 'win32':
          command = `start "" "${url}"`;
          break;
        default:
          command = `xdg-open "${url}"`;
      }

      await execAsync(command);
      this.logger.log(`📧 Opened email preview in browser`);
    } catch (error) {
      this.logger.warn(`Could not open browser automatically: ${error}`);
    }
  }

  /**
   * Verify the SMTP connection
   * @returns true if connection is valid
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('📧 Mail server connection verified');
      return true;
    } catch (error) {
      this.logger.error(`Mail server connection failed: ${error}`);
      return false;
    }
  }
}
