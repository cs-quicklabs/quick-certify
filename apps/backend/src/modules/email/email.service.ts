import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import mjml2html from 'mjml';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import { emailSubjects } from './constants/constants';
import { generatePreviewHTML } from '@/utils/emailTemplate';
import { BrowserUtils } from '@/utils/browser.utils';
import { EnvironmentEnum } from '@/common/enums';
import { AppConfig } from '@/config/app-config';

export type Message = {
  body: string;
  recipients: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
};

// handlebar helper functions
Handlebars.registerHelper('currentYear', function () {
  return new Date().getFullYear();
});

@Injectable()
export class EmailService {
  private readonly logger = new Logger('EmailService');
  private readonly frontendURL: string;
  private readonly accountEmail: string;
  private readonly transporter: nodemailer.Transporter;
  private readonly isDevelopment: boolean;

  constructor(
    private readonly configService: ConfigService<{ app: AppConfig }>
  ) {
    const appConfig = this.configService.get('app', { infer: true });

    this.accountEmail = appConfig.smtpEmail;
    this.isDevelopment = process.env.NODE_ENV !== EnvironmentEnum.Production;
    this.logger.log(`Current NODE_ENV: ${process.env.NODE_ENV}`);
    this.transporter = nodemailer.createTransport({
      host: appConfig.smtpHost,
      port: appConfig.smtpPort,
      secure: false,
      auth: {
        user: appConfig.smtpUser,
        pass: appConfig.smtpPass,
      },
    });
    this.frontendURL =
      this.configService.get('app.frontendDomain', { infer: true }) || '';
  }

  /**
   * Private method to send individual emails
   * @param message Email message configuration
   * @returns Promise<void>
   */
  private async sendEmail(message: Message): Promise<void> {
    if (!message.subject) {
      throw new Error('Subject is required');
    }

    const mailOptions = {
      from: this.accountEmail,
      to: message.recipients.join(', '),
      cc: message.cc ? message.cc.join(', ') : '',
      bcc: message.bcc ? message.bcc.join(', ') : '',
      subject: 'Quick Certify: ' + message.subject,
      html: message.body,
    };

    if (!this.isDevelopment) {
      try {
        const info = await this.transporter.sendMail(mailOptions);
        this.logger.log(
          `Email sent successfully to ${info.accepted.join(', ')}`
        );
      } catch (error) {
        this.logger.error('Error sending email:', error);
        throw error;
      }
    } else {
      // Preview in local development environment
      const previewHTML = generatePreviewHTML({
        subject: mailOptions.subject,
        to: mailOptions.to,
        cc: mailOptions.cc,
        bcc: mailOptions.bcc,
        html: mailOptions.html,
      });

      await BrowserUtils.previewHTML(previewHTML);
    }
  }

  /**
   * Send one or multiple email messages
   * @param message Single message or array of messages
   * @returns Promise<void>
   */
  async send(message: Message | Message[]): Promise<void> {
    try {
      if (Array.isArray(message)) {
        await Promise.all(message.map((msg) => this.sendEmail(msg)));
      } else {
        await this.sendEmail(message);
      }
    } catch (error) {
      this.logger.error('Failed to send email(s):', error);
      throw error;
    }
  }

  /**
   * Send email for the communication with the user
   * @param data of type Message { body: string; recipients: string[]; cc?: string[]; bcc?: string[]; subject: string; }
   * @returns true or throws error
   */
  async notify(data: Message): Promise<void> {
    try {
      const emailBody = await this.compileMjmlTemplate(
        { body: data.body },
        'notification'
      );

      await this.send({
        ...data,
        body: emailBody,
        subject: data.subject,
      });
    } catch (err) {
      this.logger.error('Failed to send notification email:', err);
      throw err;
    }
  }

  private async compileMjmlTemplate(
    body: Record<string, string>,
    templateName: string
  ): Promise<string> {
    const templatePath = path.join(
      process.cwd(),
      'apps/backend/src/modules/email/email-templates',
      `${templateName}.mjml`
    );
    const mjmlContent = await fs.readFile(templatePath, 'utf8');
    const { html } = mjml2html(mjmlContent);
    const compiledTemplate = Handlebars.compile(html);
    return compiledTemplate(body);
  }

  // This function is used to send the email to the user when the user forgets the password
  async forgetPasswordEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${this.frontendURL}/reset-password?token=${resetToken}`;

    try {
      const emailBody = await this.compileMjmlTemplate(
        { resetUrl },
        'forget-password'
      );

      await this.send({
        recipients: [email],
        body: emailBody,
        subject: emailSubjects.resetPassword,
      });
    } catch (err) {
      this.logger.error('Failed to send password reset email:', err);
      throw new Error('Failed to send password reset email.');
    }
  }

  // The below function is used to send the welcome email to the user
  async welcomeEmail(email: string) {
    const loginUrl = `${this.frontendURL}/`;
    const emailBody = await this.compileMjmlTemplate(
      { loginUrl },
      'welcome-Email'
    );
    try {
      await this.send({
        recipients: [email],
        body: emailBody,
        subject: emailSubjects.welcome,
      });
    } catch (err) {
      this.logger.error('Something went wrong:', JSON.stringify(err));
      throw new Error('Failed to send email.');
    }
  }
}
