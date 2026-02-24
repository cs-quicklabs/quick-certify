import { Injectable, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Order, Transaction, WhereOptions } from 'sequelize';
import { PathwayParticipantEntity } from '@src/entities/pathway-participant.entity';
import { PathwayEventEntity } from '@src/entities/pathway-event.entity';
import { CredentialEntity } from '@src/entities/credential.entity';
import { RecipientEntity } from '@src/entities/recipient.entity';
import { PathwayEntity } from '@src/entities/pathway.entity';
import { RecipientService } from '@src/modules/recipient/recipient.service';
import { EmailService } from '@src/commons/services';
import { CredentialStatusEnum } from '@src/commons/enums';
import { PaginatedResult } from '@src/commons/base';

@Injectable()
export class PathwayParticipantService {
  private readonly logger = new Logger(PathwayParticipantService.name);

  constructor(
    @InjectModel(PathwayParticipantEntity)
    private readonly pathwayParticipantModel: typeof PathwayParticipantEntity,
    @InjectModel(PathwayEventEntity)
    private readonly pathwayEventModel: typeof PathwayEventEntity,
    @InjectModel(CredentialEntity)
    private readonly credentialModel: typeof CredentialEntity,
    private readonly recipientService: RecipientService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Add a participant to a pathway.
   * Finds or creates the recipient, then links to pathway with 'invited' status.
   */
  async addParticipant(
    pathway: PathwayEntity,
    name: string,
    email: string,
    organizationUuid: string,
    transaction?: Transaction,
  ): Promise<PathwayParticipantEntity> {
    const recipient = await this.recipientService.findOrCreate(
      organizationUuid,
      { name, email },
      { transaction },
    );

    // Check if already linked
    const existing = await this.pathwayParticipantModel.findOne({
      where: {
        pathway_id: pathway.id,
        recipient_id: recipient.id,
      },
      ...(transaction && { transaction }),
    });

    if (existing) {
      throw new ConflictException('Participant is already added to this pathway');
    }

    // Compute initial status based on existing credentials
    const initialStatus = await this.computeRecipientStatus(pathway.id, recipient.id, transaction);

    const participant = await this.pathwayParticipantModel.create(
      {
        pathway_id: pathway.id,
        recipient_id: recipient.id,
        status: initialStatus,
      },
      { ...(transaction && { transaction }) },
    );

    // Reload with recipient association for response
    await participant.reload({ include: [{ model: RecipientEntity, as: 'recipient' }] });

    // Fire-and-forget: send invitation email
    this.sendInvitationEmail(email, name, pathway).catch((err) => {
      this.logger.warn(
        `Failed to send pathway invitation email to ${email}: ${err instanceof Error ? err.message : 'Unknown error'}`,
      );
    });

    return participant;
  }

  /**
   * Send pathway invitation email to a participant.
   */
  private async sendInvitationEmail(
    email: string,
    name: string,
    pathway: PathwayEntity,
  ): Promise<void> {
    await this.emailService.sendTemplatedEmail(
      email,
      `You're invited to the ${pathway.name} pathway`,
      'pathway-invitation',
      {
        name,
        pathwayName: pathway.name,
        description: pathway.description ?? '',
      },
    );
  }

  /**
   * Compute status for a single recipient based on their credential progress in a pathway.
   */
  private async computeRecipientStatus(
    pathwayId: number,
    recipientId: number,
    transaction?: Transaction,
  ): Promise<string> {
    const pathwayEvents = await this.pathwayEventModel.findAll({
      where: { pathway_id: pathwayId },
      attributes: ['event_id'],
      ...(transaction && { transaction }),
    });
    const eventIds = pathwayEvents.map((pe) => pe.event_id);

    if (eventIds.length === 0) return 'invited';

    const issuedCount = await this.credentialModel.count({
      where: {
        recipient_id: recipientId,
        event_id: { [Op.in]: eventIds },
        status: CredentialStatusEnum.ISSUED,
      },
      ...(transaction && { transaction }),
    });

    if (issuedCount >= eventIds.length) return 'completed';
    if (issuedCount > 0) return 'in_progress';
    return 'invited';
  }

  /**
   * Get participants for a pathway with pagination
   */
  async getParticipants(
    pathwayId: number,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: string;
    } = {},
  ): Promise<PaginatedResult<PathwayParticipantEntity>> {
    const { page = 1, limit = 10, search, sortBy, sortOrder = 'DESC' } = options;

    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    let includeWhere: WhereOptions | undefined;
    if (search?.trim()) {
      includeWhere = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search.trim()}%` } },
          { email: { [Op.iLike]: `%${search.trim()}%` } },
        ],
      };
    }

    // Build order clause
    const safeSortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';
    const order: Order = [];

    if (sortBy === 'name') {
      order.push([{ model: RecipientEntity, as: 'recipient' }, 'name', safeSortOrder]);
    } else {
      order.push(['created_at', safeSortOrder]);
    }

    const { count, rows } = await this.pathwayParticipantModel.findAndCountAll({
      where: { pathway_id: pathwayId },
      include: [
        {
          model: RecipientEntity,
          as: 'recipient',
          where: search?.trim() ? includeWhere : undefined,
          required: !!search?.trim(),
        },
      ],
      distinct: true,
      order,
      limit: safeLimit,
      offset,
    });

    // Compute status for each participant based on credential progress
    await this.computeStatuses(pathwayId, rows);

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

  /**
   * Compute participant statuses based on credential progress.
   * - invited: no credentials issued for pathway events
   * - in_progress: some credentials issued
   * - completed: all pathway event credentials issued
   */
  private async computeStatuses(
    pathwayId: number,
    participants: PathwayParticipantEntity[],
  ): Promise<void> {
    if (participants.length === 0) return;

    // Get all event IDs for this pathway
    const pathwayEvents = await this.pathwayEventModel.findAll({
      where: { pathway_id: pathwayId },
      attributes: ['event_id'],
    });
    const eventIds = pathwayEvents.map((pe) => pe.event_id);

    // If pathway has no events, everyone stays invited
    if (eventIds.length === 0) return;

    const recipientIds = participants.map((p) => p.recipient_id);

    // Get issued credentials for these recipients and events
    const issuedCredentials = await this.credentialModel.findAll({
      where: {
        recipient_id: { [Op.in]: recipientIds },
        event_id: { [Op.in]: eventIds },
        status: CredentialStatusEnum.ISSUED,
      },
      attributes: ['recipient_id', 'event_id'],
    });

    // Group issued event IDs by recipient
    const issuedMap = new Map<number, Set<number>>();
    for (const cred of issuedCredentials) {
      let eventSet = issuedMap.get(cred.recipient_id);
      if (!eventSet) {
        eventSet = new Set();
        issuedMap.set(cred.recipient_id, eventSet);
      }
      eventSet.add(cred.event_id);
    }

    const totalEvents = eventIds.length;
    for (const participant of participants) {
      const issuedCount = issuedMap.get(participant.recipient_id)?.size ?? 0;

      let status: string;
      if (issuedCount >= totalEvents) {
        status = 'completed';
      } else if (issuedCount > 0) {
        status = 'in_progress';
      } else {
        status = 'invited';
      }

      participant.setDataValue('status', status);
    }
  }

  /**
   * Update participant status
   */
  async updateStatus(
    pathwayId: number,
    recipientUuid: string,
    status: string,
    organizationUuid: string,
  ): Promise<PathwayParticipantEntity> {
    const recipient = await this.recipientService.findByUuid(recipientUuid, organizationUuid);
    if (!recipient) {
      throw new NotFoundException('Participant not found');
    }

    const participant = await this.pathwayParticipantModel.findOne({
      where: {
        pathway_id: pathwayId,
        recipient_id: recipient.id,
      },
      include: [{ model: RecipientEntity, as: 'recipient' }],
    });

    if (!participant) {
      throw new NotFoundException('Participant not found in this pathway');
    }

    await participant.update({ status });
    return participant;
  }
}
