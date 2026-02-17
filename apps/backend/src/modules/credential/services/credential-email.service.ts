import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '@src/commons/services';
import { CredentialEntity } from '@src/entities/credential.entity';

export interface CredentialEmailParams {
  credentialUuid: string;
  recipientEmail: string;
  recipientName: string;
  eventName: string;
  pdfUrl?: string | null;
}

@Injectable()
export class CredentialEmailService {
  private readonly logger = new Logger(CredentialEmailService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {}

  getPublicCredentialUrl(uuid: string): string {
    const frontendDomain = this.configService.get<string>(
      'app.frontendDomain',
      'http://localhost:3000',
    );
    return `${frontendDomain}/public/credential/${uuid}`;
  }

  async sendCredentialIssuedEmail(params: CredentialEmailParams): Promise<void> {
    const { credentialUuid, recipientEmail, recipientName, eventName, pdfUrl } = params;

    if (!recipientEmail) return;

    const attachments = await this.buildPdfAttachment(pdfUrl, eventName);

    await this.emailService.sendTemplatedEmail(
      recipientEmail,
      `Your Certificate for ${eventName ?? 'Event'}`,
      'credential-issued',
      {
        name: recipientName ?? 'Participant',
        eventName: eventName ?? 'Event',
        certificateUrl: this.getPublicCredentialUrl(credentialUuid),
      },
      attachments,
    );
  }

  async sendCredentialIssuedEmailFromEntity(credential: CredentialEntity): Promise<void> {
    await this.sendCredentialIssuedEmail({
      credentialUuid: credential.uuid,
      recipientEmail: credential.recipient?.email ?? '',
      recipientName: credential.recipient?.name ?? 'Participant',
      eventName: credential.event?.name ?? 'Event',
      pdfUrl: credential.certificate_pdf_url,
    });
  }

  async buildPdfAttachment(
    pdfUrl: string | null | undefined,
    eventName: string | undefined,
  ): Promise<Array<{ filename: string; content: Buffer; contentType: string }>> {
    if (!pdfUrl) return [];

    try {
      const response = await fetch(pdfUrl);
      if (!response.ok) {
        this.logger.warn(`Failed to download PDF from ${pdfUrl}: ${response.status}`);
        return [];
      }
      const buffer = Buffer.from(await response.arrayBuffer());
      const filename = `${(eventName ?? 'Certificate').replaceAll(/[^a-zA-Z0-9-_ ]/g, '')}-Certificate.pdf`;
      return [{ filename, content: buffer, contentType: 'application/pdf' }];
    } catch (err) {
      this.logger.warn(
        `Failed to download PDF for attachment: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
      return [];
    }
  }
}
