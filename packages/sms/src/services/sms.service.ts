import { Inject, Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { SMS_OPTIONS } from '../constants';
import { SendSmsOptions, SmsModuleOptions, SmsResponse } from '../interfaces';

const execAsync = promisify(exec);

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private client: Twilio | null = null;
  private previewLogPath: string;

  constructor(
    @Inject(SMS_OPTIONS)
    private readonly options: SmsModuleOptions,
  ) {
    this.previewLogPath = path.join(os.tmpdir(), 'sms-preview');
    this.initializeClient();
  }

  private initializeClient(): void {
    if (!this.options.previewMode) {
      this.client = new Twilio(this.options.accountSid, this.options.authToken);
      this.logger.log('📱 Twilio SMS client initialized');
    } else {
      this.logger.log('📱 SMS service running in PREVIEW MODE');
      // Ensure preview directory exists
      if (!fs.existsSync(this.previewLogPath)) {
        fs.mkdirSync(this.previewLogPath, { recursive: true });
      }
    }
  }

  /**
   * Send an SMS message
   * @param options - SMS options (to, body, from)
   * @returns SmsResponse with success status and messageId
   */
  async sendSms(options: SendSmsOptions): Promise<SmsResponse> {
    const from = options.from || this.options.fromNumber;

    if (this.options.previewMode) {
      return this.sendPreviewSms(options, from);
    }

    return this.sendTwilioSms(options, from);
  }

  private async sendTwilioSms(options: SendSmsOptions, from: string): Promise<SmsResponse> {
    try {
      if (!this.client) {
        throw new Error('Twilio client not initialized');
      }

      const message = await this.client.messages.create({
        to: options.to,
        from,
        body: options.body,
        mediaUrl: options.mediaUrl,
      });

      this.logger.log(`📱 SMS sent successfully to ${options.to}: ${message.sid}`);

      return {
        success: true,
        messageId: message.sid,
        status: message.status,
      };
    } catch (error) {
      this.logger.error(`Failed to send SMS: ${error}`);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async sendPreviewSms(options: SendSmsOptions, from: string): Promise<SmsResponse> {
    const timestamp = new Date().toISOString();
    const previewData = {
      to: options.to,
      from,
      body: options.body,
      sentAt: timestamp,
    };

    // Generate a unique message ID for preview
    const messageId = `preview_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create HTML preview file
    const htmlContent = this.generatePreviewHtml(previewData, messageId);
    const previewFilePath = path.join(this.previewLogPath, `${messageId}.html`);

    fs.writeFileSync(previewFilePath, htmlContent);

    this.logger.log(`📱 SMS Preview saved: ${previewFilePath}`);
    this.logger.log(`📱 SMS Preview Details:`);
    this.logger.log(`   To: ${options.to}`);
    this.logger.log(`   From: ${from}`);
    this.logger.log(`   Body: ${options.body}`);

    // Open in browser
    await this.openInBrowser(previewFilePath);

    return {
      success: true,
      messageId,
      status: 'preview',
      previewData,
    };
  }

  private generatePreviewHtml(
    data: { to: string; from: string; body: string; sentAt: string },
    messageId: string,
  ): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SMS Preview - ${messageId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }
    .phone-container {
      width: 375px;
      background: #000;
      border-radius: 40px;
      padding: 15px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    }
    .phone-screen {
      background: linear-gradient(180deg, #f5f5f7 0%, #e5e5ea 100%);
      border-radius: 30px;
      overflow: hidden;
      min-height: 600px;
    }
    .status-bar {
      background: #f5f5f7;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      font-weight: 600;
    }
    .header {
      background: #f5f5f7;
      padding: 15px 20px;
      text-align: center;
      border-bottom: 1px solid #d1d1d6;
    }
    .header h2 { font-size: 18px; color: #1c1c1e; }
    .header .from { font-size: 13px; color: #8e8e93; margin-top: 4px; }
    .messages {
      padding: 20px;
      min-height: 400px;
    }
    .message {
      max-width: 85%;
      padding: 12px 16px;
      border-radius: 20px;
      margin-bottom: 10px;
      font-size: 16px;
      line-height: 1.4;
    }
    .incoming {
      background: #e5e5ea;
      color: #1c1c1e;
      border-bottom-left-radius: 4px;
    }
    .timestamp {
      text-align: center;
      font-size: 12px;
      color: #8e8e93;
      margin: 20px 0;
    }
    .preview-badge {
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
      color: white;
      padding: 10px 20px;
      border-radius: 25px;
      font-weight: 600;
      font-size: 14px;
      box-shadow: 0 4px 15px rgba(238,90,90,0.4);
    }
    .meta-info {
      background: rgba(255,255,255,0.1);
      color: white;
      padding: 20px;
      border-radius: 15px;
      margin-top: 20px;
      font-size: 13px;
    }
    .meta-info p { margin: 8px 0; }
    .meta-info strong { color: #4facfe; }
  </style>
</head>
<body>
  <div class="preview-badge">📱 SMS PREVIEW MODE</div>
  
  <div style="text-align: center;">
    <div class="phone-container">
      <div class="phone-screen">
        <div class="status-bar">
          <span>9:41</span>
          <span>📶 📡 🔋</span>
        </div>
        <div class="header">
          <h2>Messages</h2>
          <p class="from">From: ${data.from}</p>
        </div>
        <div class="messages">
          <div class="timestamp">${new Date(data.sentAt).toLocaleString()}</div>
          <div class="message incoming">${data.body}</div>
        </div>
      </div>
    </div>
    
    <div class="meta-info">
      <p><strong>Message ID:</strong> ${messageId}</p>
      <p><strong>To:</strong> ${data.to}</p>
      <p><strong>From:</strong> ${data.from}</p>
      <p><strong>Sent At:</strong> ${data.sentAt}</p>
    </div>
  </div>
</body>
</html>`;
  }

  private async openInBrowser(filePath: string): Promise<void> {
    try {
      const platform = process.platform;
      let command: string;

      const fileUrl = `file://${filePath}`;

      switch (platform) {
        case 'darwin':
          command = `open "${fileUrl}"`;
          break;
        case 'win32':
          command = `start "" "${fileUrl}"`;
          break;
        default:
          command = `xdg-open "${fileUrl}"`;
      }

      await execAsync(command);
      this.logger.log(`📱 Opened SMS preview in browser`);
    } catch (error) {
      this.logger.warn(`Could not open browser automatically: ${error}`);
    }
  }
}
