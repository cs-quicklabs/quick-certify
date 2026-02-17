import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { PaginatedResult } from '@src/commons/base';
import { CredentialEntity } from '@src/entities/credential.entity';
import { CredentialIssueBatchEntity } from '@src/entities/credential-issue-batch.entity';
import { RecipientEntity } from '@src/entities/recipient.entity';
import { EventEntity } from '@src/entities/event.entity';
import { OrganizationEntity } from '@src/entities/organization.entity';
import { CredentialStatusEnum } from '@src/commons/enums';
import { DesignLayout } from '@src/modules/design/interfaces/design.layout.interface';
import { OrganizationService } from '@src/modules/organization/organization.service';
import { EventService } from '@src/modules/event/services/event.service';
import { RecipientService } from '@src/modules/recipient/recipient.service';
import { DesignService } from '@src/modules/design/design.services';
import { CertificateGenerationService } from './services/certificate-generation.service';
import { CredentialEmailService } from './services/credential-email.service';
import {
  CreateCredentialDto,
  UpdateCredentialDto,
  CredentialFilterDto,
  BatchCreateCredentialDto,
  PreviewCredentialDto,
} from './dtos';

@Injectable()
export class CredentialService {
  private readonly logger = new Logger(CredentialService.name);

  private readonly defaultIncludes = [
    { model: RecipientEntity, as: 'recipient' as const, attributes: ['uuid', 'name', 'email'] },
    { model: EventEntity, as: 'event' as const, attributes: ['uuid', 'name'] },
  ];

  constructor(
    @InjectModel(CredentialEntity)
    private readonly credentialModel: typeof CredentialEntity,
    @InjectModel(CredentialIssueBatchEntity)
    private readonly batchModel: typeof CredentialIssueBatchEntity,
    private readonly sequelize: Sequelize,
    private readonly organizationService: OrganizationService,
    private readonly eventService: EventService,
    private readonly recipientService: RecipientService,
    private readonly designService: DesignService,
    private readonly certificateGenerationService: CertificateGenerationService,
    private readonly credentialEmailService: CredentialEmailService,
  ) {}

  async findAll(
    organizationUuid: string,
    filters: CredentialFilterDto,
  ): Promise<PaginatedResult<CredentialEntity>> {
    const ALLOWED_SORT_COLUMNS = ['created_at', 'issued_date', 'expiration_date', 'status'];
    const {
      page = 1,
      limit = 10,
      sortBy: rawSortBy = 'created_at',
      sortOrder = 'DESC',
      search,
      eventId,
    } = filters;
    const sortBy = ALLOWED_SORT_COLUMNS.includes(rawSortBy) ? rawSortBy : 'created_at';

    const organization = await this.organizationService.findByUuid(organizationUuid);
    if (!organization) {
      return {
        data: [],
        meta: { total: 0, page: 1, limit, totalPages: 0, hasNextPage: false, hasPrevPage: false },
      };
    }

    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    const whereClause: Record<string, unknown> = {
      organization_id: organization.id,
    };

    if (eventId) {
      const event = await this.eventService.findByUuid(eventId, organizationUuid);
      if (event) {
        whereClause.event_id = event.id;
      }
    }

    const recipientWhere: Record<string, unknown> | undefined = search
      ? {
          [Op.or]: [
            { name: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.iLike]: `%${search}%` } },
          ],
        }
      : undefined;

    const { count, rows } = await this.credentialModel.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: RecipientEntity,
          as: 'recipient',
          attributes: ['uuid', 'name', 'email'],
          where: recipientWhere,
        },
        {
          model: EventEntity,
          as: 'event',
          attributes: ['uuid', 'name'],
        },
      ],
      order: [[sortBy, sortOrder]],
      limit: safeLimit,
      offset,
    });

    const totalPages = Math.ceil(count / safeLimit);

    return {
      data: rows,
      meta: {
        total: count,
        page: safePage,
        limit: safeLimit,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
      },
    };
  }

  async findByUuid(uuid: string, organizationUuid: string): Promise<CredentialEntity | null> {
    const organization = await this.organizationService.findByUuid(organizationUuid);
    if (!organization) return null;

    return this.credentialModel.findOne({
      where: {
        uuid,
        organization_id: organization.id,
      },
      include: this.defaultIncludes,
    });
  }

  async create(organizationUuid: string, dto: CreateCredentialDto): Promise<CredentialEntity> {
    const organization = await this.requireOrganization(organizationUuid);

    const recipient = await this.recipientService.findOrCreate(organizationUuid, {
      name: dto.recipientName,
      email: dto.recipientEmail,
    });

    const event = await this.eventService.findByUuid(dto.eventId, organizationUuid);
    if (!event) {
      throw new BadRequestException(`Event with UUID ${dto.eventId} not found or inactive`);
    }

    const credential = await this.credentialModel.create({
      organization_id: organization.id,
      recipient_id: recipient.id,
      event_id: event.id,
      issued_date: dto.issuedDate || null,
      expiration_date: dto.expirationDate || null,
      certificate_url: dto.certificateUrl || null,
      status: dto.status || CredentialStatusEnum.DRAFT,
    });

    return credential.reload({ include: this.defaultIncludes });
  }

  async updateByUuid(
    uuid: string,
    organizationUuid: string,
    dto: UpdateCredentialDto,
  ): Promise<CredentialEntity> {
    const credential = await this.findByUuidOrFail(uuid, organizationUuid);

    const updateData: Record<string, unknown> = {};

    if (dto.recipientName !== undefined || dto.recipientEmail !== undefined) {
      const currentRecipient = credential.recipient;
      const recipient = await this.recipientService.findOrCreate(organizationUuid, {
        name: dto.recipientName ?? currentRecipient.name,
        email: dto.recipientEmail ?? currentRecipient.email,
      });
      updateData.recipient_id = recipient.id;
    }

    if (dto.eventId !== undefined) {
      const event = await this.eventService.findByUuid(dto.eventId, organizationUuid);
      if (!event) {
        throw new BadRequestException(`Event with UUID ${dto.eventId} not found or inactive`);
      }
      updateData.event_id = event.id;
    }

    if (dto.issuedDate !== undefined) updateData.issued_date = dto.issuedDate;
    if (dto.expirationDate !== undefined) updateData.expiration_date = dto.expirationDate;
    if (dto.certificateUrl !== undefined) updateData.certificate_url = dto.certificateUrl;
    if (dto.status !== undefined) updateData.status = dto.status;

    await credential.update(updateData);

    return credential.reload({ include: this.defaultIncludes });
  }

  /**
   * Create a batch of credentials for async processing.
   * Returns immediately with batch UUID — the BatchWorkerService processes them in the background.
   */
  async createBatch(
    organizationUuid: string,
    userId: number,
    dto: BatchCreateCredentialDto,
  ): Promise<{ batchUuid: string; totalCount: number }> {
    const organization = await this.requireOrganization(organizationUuid);

    // Idempotency check: if batch with same key exists for this org, return it
    const existingBatch = await this.batchModel.findOne({
      where: { idempotency_key: dto.idempotencyKey, organization_id: organization.id },
    });

    if (existingBatch) {
      return { batchUuid: existingBatch.uuid, totalCount: existingBatch.total_count };
    }

    const event = await this.eventService.findByUuid(dto.eventId, organizationUuid);
    if (!event) {
      throw new BadRequestException(`Event with UUID ${dto.eventId} not found or inactive`);
    }

    if (!event.design_id) {
      throw new BadRequestException('Event has no design template assigned');
    }

    // Deduplicate recipients by email (case-insensitive), keep first occurrence
    const seen = new Set<string>();
    const uniqueRecipients = dto.recipients.filter((r) => {
      const key = r.email.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const transaction = await this.sequelize.transaction();

    try {
      // Create batch record
      const batch = await this.batchModel.create(
        {
          organization_id: organization.id,
          event_id: event.id,
          idempotency_key: dto.idempotencyKey,
          total_count: uniqueRecipients.length,
          created_by: userId,
        },
        { transaction },
      );

      // Create credentials with PENDING status
      for (const recipient of uniqueRecipients) {
        const recipientEntity = await this.recipientService.findOrCreate(
          organizationUuid,
          { name: recipient.name, email: recipient.email },
          { transaction },
        );

        await this.credentialModel.create(
          {
            organization_id: organization.id,
            recipient_id: recipientEntity.id,
            event_id: event.id,
            issued_date: dto.issuedDate || new Date().toISOString().split('T')[0],
            expiration_date: dto.expirationDate || null,
            status: CredentialStatusEnum.PENDING,
            batch_id: batch.id,
          },
          { transaction },
        );
      }

      await transaction.commit();

      return { batchUuid: batch.uuid, totalCount: uniqueRecipients.length };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get batch status for progress tracking
   */
  async getBatchStatus(
    batchUuid: string,
    organizationUuid: string,
  ): Promise<{
    uuid: string;
    status: string;
    totalCount: number;
    processedCount: number;
    successCount: number;
    failedCount: number;
    errorDetails: Array<{ credentialId: number; error: string }> | null;
  }> {
    const organization = await this.requireOrganization(organizationUuid);

    const batch = await this.batchModel.findOne({
      where: {
        uuid: batchUuid,
        organization_id: organization.id,
      },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    return {
      uuid: batch.uuid,
      status: batch.status,
      totalCount: batch.total_count,
      processedCount: batch.processed_count,
      successCount: batch.success_count,
      failedCount: batch.failed_count,
      errorDetails: batch.error_details,
    };
  }

  /**
   * Generate a certificate preview using the same rendering pipeline as batch issuance.
   */
  async generatePreview(
    organizationUuid: string,
    dto: PreviewCredentialDto,
  ): Promise<{ previewUrl: string }> {
    const organization = await this.requireOrganization(organizationUuid);

    const event = await this.eventService.findByUuid(dto.eventId, organizationUuid);
    if (!event) {
      throw new BadRequestException(`Event with UUID ${dto.eventId} not found or inactive`);
    }

    if (!event.design_id) {
      throw new BadRequestException('Event has no design template assigned');
    }

    const design = await this.designService.findOne(event.design_id);
    if (!design?.layout) {
      throw new BadRequestException('Design has no layout configured');
    }

    const result = await this.certificateGenerationService.generateCertificate(
      design.url,
      design.layout,
      {
        recipientName: dto.recipientName,
        recipientEmail: dto.recipientEmail,
        credentialUuid: `PREVIEW-${Date.now()}`,
        issuedDate: dto.issuedDate || new Date().toISOString().split('T')[0],
        expirationDate: dto.expirationDate || null,
        eventName: event.name,
      },
      organization.uuid,
    );

    return { previewUrl: result.imageUrl };
  }

  async resend(uuid: string, organizationUuid: string): Promise<{ sent: boolean }> {
    const credential = await this.findByUuidOrFail(uuid, organizationUuid);

    if (
      credential.status !== CredentialStatusEnum.ISSUED &&
      credential.status !== CredentialStatusEnum.FAILED
    ) {
      throw new BadRequestException('Only issued or failed credentials can be resent');
    }

    if (!credential.recipient?.email) {
      throw new BadRequestException('Credential has no recipient email');
    }

    // For FAILED credentials, regenerate the certificate first
    if (credential.status === CredentialStatusEnum.FAILED) {
      await this.regenerateAndSend(credential, organizationUuid);
      return { sent: true };
    }

    if (!credential.certificate_url) {
      throw new BadRequestException('Credential has no generated certificate');
    }

    // Fire-and-forget email with PDF attachment for ISSUED credentials
    this.credentialEmailService.sendCredentialIssuedEmailFromEntity(credential).catch((err) => {
      this.logger.warn(
        `Failed to resend email for credential ${uuid}: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
    });

    return { sent: true };
  }

  /**
   * Regenerate certificate for a FAILED credential, update DB, and send email.
   * Runs in the background (fire-and-forget from the caller's perspective).
   */
  private async regenerateAndSend(
    credential: CredentialEntity,
    organizationUuid: string,
  ): Promise<void> {
    const organization = await this.requireOrganization(organizationUuid);

    const event = credential.event;
    if (!event?.design_id) {
      throw new BadRequestException('Event has no design template assigned');
    }

    const design = await this.designService.findOne(event.design_id);
    if (!design?.url || !design?.layout) {
      throw new BadRequestException('Event has no design template with layout');
    }

    // Mark as PROCESSING
    await credential.update({ status: CredentialStatusEnum.PROCESSING });

    // Fire-and-forget: generate, update, and email
    this.doRegenerateAndSend(
      credential,
      event,
      { url: design.url, layout: design.layout },
      organization.uuid,
    ).catch((err) => {
      this.logger.warn(
        `Failed to regenerate credential ${credential.uuid}: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
      credential.update({ status: CredentialStatusEnum.FAILED }).catch((updateErr) => {
        this.logger.error(
          `Failed to update credential ${credential.uuid} status to FAILED: ${updateErr instanceof Error ? updateErr.message : 'Unknown error'}`,
        );
      });
    });
  }

  private async doRegenerateAndSend(
    credential: CredentialEntity,
    event: EventEntity,
    design: { url: string; layout: DesignLayout },
    organizationUuid: string,
  ): Promise<void> {
    const result = await this.certificateGenerationService.generateCertificate(
      design.url,
      design.layout,
      {
        recipientName: credential.recipient?.name ?? '',
        recipientEmail: credential.recipient?.email ?? '',
        credentialUuid: credential.uuid,
        issuedDate: credential.issued_date,
        expirationDate: credential.expiration_date,
        eventName: event.name,
      },
      organizationUuid,
    );

    await credential.update({
      certificate_url: result.imageUrl,
      certificate_pdf_url: result.pdfUrl,
      status: CredentialStatusEnum.ISSUED,
    });

    await this.credentialEmailService.sendCredentialIssuedEmail({
      credentialUuid: credential.uuid,
      recipientEmail: credential.recipient?.email ?? '',
      recipientName: credential.recipient?.name ?? 'Participant',
      eventName: event.name,
      pdfUrl: result.pdfUrl,
    });
  }

  async findPublicByUuid(uuid: string) {
    const credential = await this.credentialModel.findOne({
      where: { uuid, status: CredentialStatusEnum.ISSUED },
      include: [
        ...this.defaultIncludes,
        {
          model: OrganizationEntity,
          as: 'organization',
          attributes: ['uuid', 'name', 'description', 'logo_url', 'website', 'slogan'],
        },
      ],
    });

    if (!credential) {
      throw new NotFoundException('Credential not found');
    }

    return {
      uuid: credential.uuid,
      recipientName: credential.recipient?.name ?? '',
      eventName: credential.event?.name ?? '',
      issuedDate: credential.issued_date,
      expirationDate: credential.expiration_date,
      certificateUrl: credential.certificate_url,
      certificatePdfUrl: credential.certificate_pdf_url,
      organization: {
        name: credential.organization?.name ?? '',
        description: credential.organization?.description ?? '',
        logoUrl: credential.organization?.logo_url ?? null,
        website: credential.organization?.website ?? '',
        slogan: credential.organization?.slogan ?? null,
      },
    };
  }

  async deleteByUuid(uuid: string, organizationUuid: string): Promise<boolean> {
    const credential = await this.findByUuidOrFail(uuid, organizationUuid);
    await credential.destroy();
    return true;
  }

  async findByUuidOrFail(uuid: string, organizationUuid: string): Promise<CredentialEntity> {
    const credential = await this.findByUuid(uuid, organizationUuid);
    if (!credential) {
      throw new NotFoundException('Credential not found');
    }
    return credential;
  }

  private async requireOrganization(uuid: string) {
    const organization = await this.organizationService.findByUuid(uuid);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }
}
