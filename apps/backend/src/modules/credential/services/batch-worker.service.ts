import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { CredentialIssueBatchEntity } from '@src/entities/credential-issue-batch.entity';
import { CredentialEntity } from '@src/entities/credential.entity';
import { RecipientEntity } from '@src/entities/recipient.entity';
import { EventEntity } from '@src/entities/event.entity';
import { DesignEntity } from '@src/entities/design.entity';
import { OrganizationEntity } from '@src/entities/organization.entity';
import { BatchStatusEnum, CredentialStatusEnum } from '@src/commons/enums';
import {
  CertificateGenerationService,
  CertificateGenerationParams,
} from './certificate-generation.service';
import type { DesignLayout } from '@certify/certificate-core';
import { CredentialEmailService } from './credential-email.service';

@Injectable()
export class BatchWorkerService {
  private readonly logger = new Logger(BatchWorkerService.name);
  private isProcessing = false;

  constructor(
    @InjectModel(CredentialIssueBatchEntity)
    private readonly batchModel: typeof CredentialIssueBatchEntity,
    @InjectModel(CredentialEntity)
    private readonly credentialModel: typeof CredentialEntity,
    private readonly sequelize: Sequelize,
    private readonly certificateGenerationService: CertificateGenerationService,
    private readonly credentialEmailService: CredentialEmailService,
  ) {}

  @Interval(10_000)
  async processPendingBatches(): Promise<void> {
    if (this.isProcessing) return;

    try {
      this.isProcessing = true;
      await this.claimAndProcessBatch();
    } catch (err) {
      this.logger.error('Batch worker error:', err);
    } finally {
      this.isProcessing = false;
    }
  }

  private async claimAndProcessBatch(): Promise<void> {
    // Claim one PENDING batch using SELECT ... FOR UPDATE SKIP LOCKED within a transaction
    const claimTransaction = await this.sequelize.transaction();
    let batch: CredentialIssueBatchEntity | null = null;

    try {
      const rows = await this.sequelize.query<{ id: number }>(
        `SELECT id FROM credential_issue_batch
         WHERE status = :status
         ORDER BY created_at ASC
         LIMIT 1
         FOR UPDATE SKIP LOCKED`,
        {
          replacements: { status: BatchStatusEnum.PENDING },
          type: QueryTypes.SELECT,
          transaction: claimTransaction,
        },
      );

      if (!rows || rows.length === 0) {
        await claimTransaction.rollback();
        return;
      }

      const batchId = rows[0].id;

      batch = await this.batchModel.findByPk(batchId, {
        include: [
          {
            model: EventEntity,
            as: 'event',
            include: [{ model: DesignEntity, as: 'design' }],
          },
          { model: OrganizationEntity, as: 'organization' },
        ],
        transaction: claimTransaction,
      });

      if (!batch) {
        await claimTransaction.rollback();
        return;
      }

      // Update batch status to PROCESSING while lock is held
      await batch.update({ status: BatchStatusEnum.PROCESSING }, { transaction: claimTransaction });
      await claimTransaction.commit();
    } catch (err) {
      await claimTransaction.rollback();
      throw err;
    }

    this.logger.log(`Processing batch ${batch.uuid} with ${batch.total_count} credentials`);

    // Get design and validate
    const design = batch.event?.design;
    if (!design?.url) {
      await batch.update({
        status: BatchStatusEnum.FAILED,
        error_details: [{ credentialId: 0, error: 'Event has no design template assigned' }],
      });
      // Mark all credentials in this batch as FAILED
      await this.credentialModel.update(
        { status: CredentialStatusEnum.FAILED },
        { where: { batch_id: batch.id } },
      );
      return;
    }

    const effectiveLayout: DesignLayout = design.layout ?? {
      version: 2,
      canvasWidth: 1100,
      canvasHeight: 800,
      placeholders: [],
    };

    // Fetch all credentials for this batch
    const credentials = await this.credentialModel.findAll({
      where: {
        batch_id: batch.id,
        status: CredentialStatusEnum.PENDING,
      },
      include: [
        { model: RecipientEntity, as: 'recipient' },
        { model: EventEntity, as: 'event' },
      ],
    });

    let successCount = 0;
    let failedCount = 0;
    const errorDetails: Array<{ credentialId: number; error: string }> = [];

    for (const credential of credentials) {
      try {
        // Update credential status to PROCESSING
        await credential.update({ status: CredentialStatusEnum.PROCESSING });

        const genParams: CertificateGenerationParams = {
          recipientName: credential.recipient?.name ?? '',
          recipientEmail: credential.recipient?.email ?? '',
          credentialUuid: credential.uuid,
          issuedDate: credential.issued_date,
          expirationDate: credential.expiration_date,
          eventName: credential.event?.name ?? '',
        };

        const result = await this.certificateGenerationService.generateCertificate(
          design.url,
          effectiveLayout,
          genParams,
          batch.organization?.uuid ?? String(batch.organization_id),
        );

        // Update credential with generated URLs
        await credential.update({
          certificate_url: result.imageUrl,
          certificate_pdf_url: result.pdfUrl,
          status: CredentialStatusEnum.ISSUED,
        });

        successCount++;

        // Fire-and-forget email notification
        this.credentialEmailService
          .sendCredentialIssuedEmailFromEntity(credential)
          .catch((error_) => {
            this.logger.warn(
              `Failed to send email for credential ${credential.uuid}: ${error_ instanceof Error ? error_.message : 'Unknown error'}`,
            );
          });
      } catch (err) {
        failedCount++;
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        errorDetails.push({ credentialId: credential.id, error: errorMessage });

        await credential.update({ status: CredentialStatusEnum.FAILED });

        this.logger.warn(
          `Failed to generate certificate for credential ${credential.uuid}: ${errorMessage}`,
        );
      }

      // Update batch progress after each credential
      await batch.update({
        processed_count: successCount + failedCount,
        success_count: successCount,
        failed_count: failedCount,
      });
    }

    // Set final batch status
    let finalStatus: BatchStatusEnum;
    if (failedCount === 0) {
      finalStatus = BatchStatusEnum.COMPLETED;
    } else if (successCount === 0) {
      finalStatus = BatchStatusEnum.FAILED;
    } else {
      finalStatus = BatchStatusEnum.PARTIAL_FAILURE;
    }

    await batch.update({
      status: finalStatus,
      error_details: errorDetails.length > 0 ? errorDetails : null,
    });

    this.logger.log(
      `Batch ${batch.uuid} completed: ${successCount} success, ${failedCount} failed`,
    );
  }
}
