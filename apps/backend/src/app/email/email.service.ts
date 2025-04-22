import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import mjml2html from 'mjml';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs/promises';
import { emailSubjects } from './constants/constants';
import { SuccessResponse } from '../common/dtos/success-response.dto';
import { EnvironmentEnum } from '../common/constants/constant';
import { generatePreviewHTML } from '../common/utils/emailTemplate';
import { BrowserUtils } from '../common/utils/browser.utils';

// Import browser utils if needed for local development

// Type definition formerly from EmailNotification
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
  private readonly emailTransporter: nodemailer.Transporter;
  private readonly isDevelopment: boolean;

  constructor(private readonly configService: ConfigService) {
    this.accountEmail = this.configService.getOrThrow<string>('SMTP_EMAIL');

    const options = {
      host: this.configService.getOrThrow<string>('SMTP_HOST'),
      port: this.configService.getOrThrow<number>('SMTP_PORT'),
      auth: {
        user: this.configService.getOrThrow<string>('SMTP_USER'),
        pass: this.configService.getOrThrow<string>('SMTP_PASS'),
      },
      secure: false,
    };

    this.isDevelopment = process.env.NODE_ENV !== 'production';
    this.logger.log(`Current NODE_ENV: ${process.env.NODE_ENV}`);
    this.emailTransporter = nodemailer.createTransport(options);
    this.frontendURL = this.configService.get<string>('FRONTEND_DOMAIN') || '';
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
        const info = await this.emailTransporter.sendMail(mailOptions);
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
      'apps/backend/src/app/email/email-templates',
      `${templateName}.mjml`
    );
    const mjmlContent = await fs.readFile(templatePath, 'utf8');
    const { html } = mjml2html(mjmlContent);
    const compiledTemplate = Handlebars.compile(html);
    return compiledTemplate(body);
  }

  // This function is used to send the email to the user when the user forgets the password
  async forgetPasswordEmail(resetURL: string, email: string) {
    const emailBody = await this.compileMjmlTemplate(
      { resetURL },
      'forget-password'
    );
    await this.send({
      body: emailBody,
      recipients: [email],
      subject: emailSubjects.resetPassword,
    });
    return new SuccessResponse('Reset password link has been shared.');
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
