# @crownstack/sms

A lightweight NestJS SMS service package using Twilio with development preview support.

## ✨ Features

- 📱 Send SMS via Twilio
- 🔍 **Dev Preview Mode** - Opens SMS preview in browser instead of sending
- 🏗️ NestJS module with async configuration
- 🖼️ MMS support (media URLs)

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
import { SmsModule } from '@crownstack/sms';

@Module({
  imports: [
    SmsModule.forRoot({
      accountSid: 'your-twilio-account-sid',
      authToken: 'your-twilio-auth-token',
      fromNumber: '+1234567890',
      previewMode: true, // Set to true for dev mode
    }),
  ],
})
export class AppModule {}
```

### 2. Async Configuration (Recommended)

```typescript
import { SmsModule } from '@crownstack/sms';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    SmsModule.forRootAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) => ({
        accountSid: configService.get('TWILIO_ACCOUNT_SID'),
        authToken: configService.get('TWILIO_AUTH_TOKEN'),
        fromNumber: configService.get('TWILIO_FROM_NUMBER'),
        previewMode: configService.get('ENV') === 'dev',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### 3. Send SMS

```typescript
import { Injectable } from '@nestjs/common';
import { SmsService } from '@crownstack/sms';

@Injectable()
export class NotificationService {
  constructor(private readonly smsService: SmsService) {}

  async sendOtp(phone: string, code: string) {
    const result = await this.smsService.sendSms({
      to: phone,
      body: `Your verification code is: ${code}. Valid for 10 minutes.`,
    });

    if (result.success) {
      console.log('SMS sent:', result.messageId);
    }
  }
}
```

## 📖 API Reference

### SmsModule

#### `forRoot(options: SmsModuleOptions)`

Static configuration.

#### `forRootAsync(options: SmsModuleAsyncOptions)`

Async configuration with factory function.

### SmsModuleOptions

| Property      | Type      | Required | Description                                |
| ------------- | --------- | -------- | ------------------------------------------ |
| `accountSid`  | `string`  | Yes      | Twilio Account SID                         |
| `authToken`   | `string`  | Yes      | Twilio Auth Token                          |
| `fromNumber`  | `string`  | Yes      | Twilio phone number (sender)               |
| `previewMode` | `boolean` | No       | Enable dev preview mode (default: false)   |
| `isGlobal`    | `boolean` | No       | Register as global module (default: false) |

### SmsService

#### `sendSms(options: SendSmsOptions): Promise<SmsResponse>`

Send an SMS message.

**SendSmsOptions:**

| Property   | Type       | Required | Description                           |
| ---------- | ---------- | -------- | ------------------------------------- |
| `to`       | `string`   | Yes      | Recipient phone number (E.164 format) |
| `body`     | `string`   | Yes      | Message content                       |
| `from`     | `string`   | No       | Override default sender number        |
| `mediaUrl` | `string[]` | No       | MMS media URLs                        |

**SmsResponse:**

```typescript
{
  success: boolean;
  messageId?: string;     // Twilio message SID
  status?: string;        // Message status
  previewData?: {         // Only in preview mode
    to: string;
    from: string;
    body: string;
    sentAt: string;
  };
  error?: string;         // Error message if failed
}
```

## 🔍 Dev Preview Mode

When `previewMode: true`, the package:

1. Generates a beautiful HTML preview of the SMS
2. Saves it to a temporary file
3. **Automatically opens the preview in your browser**
4. Shows a simulated phone interface with your message

This is perfect for development - you can see exactly what SMS messages look like without actually sending them or using Twilio credits!

```typescript
const result = await this.smsService.sendSms({
  to: '+1234567890',
  body: 'Your verification code is: 123456',
});

// In dev mode:
// Browser opens automatically with a phone mockup showing the message!
console.log(result.previewData);
// → { to: '+1234567890', from: '+0987654321', body: '...', sentAt: '...' }
```

### Preview Screenshot

The preview shows:

- 📱 A phone mockup
- 💬 Your message in a chat bubble
- 📞 To/From numbers
- ⏰ Timestamp
- 🏷️ Message ID

## 📱 Phone Number Format

Always use E.164 format for phone numbers:

```typescript
// ✅ Correct
'+14155552671';
'+447911123456';

// ❌ Incorrect
'4155552671';
'(415) 555-2671';
```

## 🖼️ MMS (Media Messages)

Send images or media with your messages:

```typescript
await this.smsService.sendSms({
  to: '+1234567890',
  body: 'Check out this image!',
  mediaUrl: ['https://example.com/image.jpg'],
});
```

## 🔧 Environment Variables Example

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_FROM_NUMBER=+1234567890
TWILIO_PREVIEW_MODE=true   # Set to false in production
```

## 🌐 Getting Twilio Credentials

1. Sign up at [Twilio](https://www.twilio.com/)
2. Get your Account SID and Auth Token from the Console Dashboard
3. Purchase or use a trial phone number
4. Verify recipient numbers in trial mode

## 💡 Usage Examples

### OTP Verification

```typescript
async sendOtp(phone: string): Promise<string> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await this.smsService.sendSms({
    to: phone,
    body: `Your verification code is: ${code}. Valid for 10 minutes.`,
  });

  return code;
}
```

### Order Notification

```typescript
async notifyOrderShipped(phone: string, orderId: string, trackingUrl: string) {
  await this.smsService.sendSms({
    to: phone,
    body: `Your order #${orderId} has shipped! Track it here: ${trackingUrl}`,
  });
}
```

### Appointment Reminder

```typescript
async sendReminder(phone: string, appointment: { date: string; time: string }) {
  await this.smsService.sendSms({
    to: phone,
    body: `Reminder: You have an appointment on ${appointment.date} at ${appointment.time}. Reply CONFIRM to confirm.`,
  });
}
```

## 📝 Notes

- This package only handles **sending** SMS
- Phone numbers must be in E.164 format
- In trial mode, you can only send to verified numbers
- Media URLs must be publicly accessible for MMS

## 📄 License

MIT
