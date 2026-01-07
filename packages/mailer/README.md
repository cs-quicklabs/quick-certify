# @crownstack/mailer

A lightweight NestJS email service package using Nodemailer with development preview support.

## ✨ Features

- 📧 Send emails via SMTP (Nodemailer)
- 🔍 **Dev Preview Mode** - Opens emails in browser instead of sending
- 🏗️ NestJS module with async configuration
- 📎 Attachment support
- 🌐 Multiple recipients (to, cc, bcc)

## 📦 Installation

This package is part of the monorepo. It's automatically available via workspace linking.

```bash
# From workspace root
npm install
```

## 🚀 Quick Start

### 1. Import the Module

```typescript
// app.module.ts
import { MailerModule } from '@crownstack/mailer';

@Module({
  imports: [
    MailerModule.forRoot({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'your-email@example.com',
        pass: 'your-password',
      },
      defaultFrom: 'noreply@example.com',
      previewEmail: true, // Set to true for dev mode
    }),
  ],
})
export class AppModule {}
```

### 2. Async Configuration (Recommended)

```typescript
import { MailerModule } from '@crownstack/mailer';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) => ({
        host: configService.get('MAIL_HOST'),
        port: configService.get('MAIL_PORT'),
        secure: configService.get('MAIL_SECURE') === 'true',
        auth: {
          user: configService.get('MAIL_USER'),
          pass: configService.get('MAIL_PASS'),
        },
        defaultFrom: configService.get('MAIL_FROM'),
        previewEmail: configService.get('ENV') === 'dev',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### 3. Send Emails

```typescript
import { Injectable } from '@nestjs/common';
import { MailerService } from '@crownstack/mailer';

@Injectable()
export class NotificationService {
  constructor(private readonly mailerService: MailerService) {}

  async sendWelcomeEmail(email: string, name: string) {
    const result = await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome!',
      html: `<h1>Hello ${name}!</h1><p>Welcome to our platform.</p>`,
    });

    if (result.success) {
      console.log('Email sent:', result.messageId);
      // In preview mode, result.previewUrl contains the Ethereal URL
    }
  }
}
```

## 📖 API Reference

### MailerModule

#### `forRoot(options: MailerModuleOptions)`

Static configuration.

#### `forRootAsync(options: MailerModuleAsyncOptions)`

Async configuration with factory function.

### MailerModuleOptions

| Property       | Type      | Required | Description                                   |
| -------------- | --------- | -------- | --------------------------------------------- |
| `host`         | `string`  | Yes      | SMTP server host                              |
| `port`         | `number`  | Yes      | SMTP server port                              |
| `secure`       | `boolean` | Yes      | Use TLS (true for 465, false for other ports) |
| `auth.user`    | `string`  | Yes      | SMTP username                                 |
| `auth.pass`    | `string`  | Yes      | SMTP password                                 |
| `defaultFrom`  | `string`  | Yes      | Default sender address                        |
| `previewEmail` | `boolean` | No       | Enable dev preview mode (default: false)      |
| `isGlobal`     | `boolean` | No       | Register as global module (default: false)    |

### MailerService

#### `sendMail(options: SendMailOptions): Promise<MailResponse>`

Send an email.

**SendMailOptions:**

| Property      | Type                 | Required | Description             |
| ------------- | -------------------- | -------- | ----------------------- |
| `to`          | `string \| string[]` | Yes      | Recipient(s)            |
| `subject`     | `string`             | Yes      | Email subject           |
| `text`        | `string`             | No       | Plain text body         |
| `html`        | `string`             | No       | HTML body               |
| `from`        | `string`             | No       | Override default sender |
| `cc`          | `string \| string[]` | No       | CC recipients           |
| `bcc`         | `string \| string[]` | No       | BCC recipients          |
| `attachments` | `Attachment[]`       | No       | File attachments        |

**MailResponse:**

```typescript
{
  success: boolean;
  messageId?: string;    // Nodemailer message ID
  previewUrl?: string;   // Ethereal preview URL (dev mode only)
  error?: string;        // Error message if failed
}
```

#### `verifyConnection(): Promise<boolean>`

Test the SMTP connection.

```typescript
const isConnected = await this.mailerService.verifyConnection();
```

## 🔍 Dev Preview Mode

When `previewEmail: true`, the package:

1. Creates a test account on [Ethereal Email](https://ethereal.email/)
2. Sends emails to the test account
3. **Automatically opens the preview URL in your browser**
4. Returns the preview URL in the response

This is perfect for development - you can see exactly what emails look like without actually sending them!

```typescript
const result = await this.mailerService.sendMail({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<h1>Hello World</h1>',
});

// In dev mode:
console.log(result.previewUrl);
// → https://ethereal.email/message/...
// Browser opens automatically!
```

## 📎 Attachments

```typescript
await this.mailerService.sendMail({
  to: 'user@example.com',
  subject: 'Your Report',
  html: '<p>Please find attached your report.</p>',
  attachments: [
    {
      filename: 'report.pdf',
      path: '/path/to/report.pdf',
    },
    {
      filename: 'data.json',
      content: JSON.stringify({ data: 'value' }),
      contentType: 'application/json',
    },
  ],
});
```

## 🔧 Environment Variables Example

```env
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@example.com
MAIL_PASS=your-password
MAIL_FROM="My App <noreply@example.com>"
MAIL_PREVIEW=true   # Set to false in production
```

## 📝 Notes

- This package only handles **sending** emails
- For templates, use Handlebars or similar in your application
- The backend includes an `EmailService` that wraps this package with template support

## 📄 License

MIT
