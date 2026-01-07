import { Injectable } from '@nestjs/common';
import { MailerService, MailResponse } from '@crownstack/mailer';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class EmailService {
  private templates: Map<string, Handlebars.TemplateDelegate> = new Map();
  private templatesDir: string;

  constructor(private readonly mailerService: MailerService) {
    this.templatesDir = path.join(process.cwd(), 'templates');
  }

  private getTemplate(templateName: string): Handlebars.TemplateDelegate {
    if (this.templates.has(templateName)) {
      return this.templates.get(templateName)!;
    }

    const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);

    if (!fs.existsSync(templatePath)) {
      throw new Error(`Template "${templateName}" not found at ${templatePath}`);
    }

    const templateContent = fs.readFileSync(templatePath, 'utf-8');
    const compiledTemplate = Handlebars.compile(templateContent);
    this.templates.set(templateName, compiledTemplate);

    return compiledTemplate;
  }

  private renderTemplate(templateName: string, context: Record<string, unknown>): string {
    const template = this.getTemplate(templateName);
    return template(context);
  }

  /**
   * Send a welcome email
   */
  async sendWelcomeEmail(to: string, data: { name: string }): Promise<MailResponse> {
    const html = this.renderTemplate('welcome', data);
    return this.mailerService.sendMail({
      to,
      subject: 'Welcome to Our Platform!',
      html,
    });
  }

  /**
   * Send a password reset email
   */
  async sendPasswordResetEmail(
    to: string,
    data: { name: string; resetLink: string; expiresIn: string },
  ): Promise<MailResponse> {
    const html = this.renderTemplate('password-reset', data);
    return this.mailerService.sendMail({
      to,
      subject: 'Password Reset Request',
      html,
    });
  }

  /**
   * Send an invitation email
   */
  async sendInvitationEmail(
    to: string,
    data: { inviterName: string; organizationName: string; inviteLink: string },
  ): Promise<MailResponse> {
    const html = this.renderTemplate('invitation', data);
    return this.mailerService.sendMail({
      to,
      subject: `You've been invited to join ${data.organizationName}`,
      html,
    });
  }

  /**
   * Send a custom email with a template
   */
  async sendTemplatedEmail(
    to: string,
    subject: string,
    templateName: string,
    context: Record<string, unknown>,
  ): Promise<MailResponse> {
    const html = this.renderTemplate(templateName, context);
    return this.mailerService.sendMail({
      to,
      subject,
      html,
    });
  }

  /**
   * Send a simple text/html email without a template
   */
  async sendEmail(
    to: string | string[],
    subject: string,
    options: { text?: string; html?: string },
  ): Promise<MailResponse> {
    return this.mailerService.sendMail({
      to,
      subject,
      ...options,
    });
  }
}
