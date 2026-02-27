import { Injectable, ConflictException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Order, Transaction, WhereOptions } from 'sequelize';
import {
  PathwayParticipantEntity,
  PathwayEventEntity,
  RecipientEntity,
  PathwayEntity,
} from '@src/entities';
import { RecipientService } from '@src/modules/recipient/recipient.service';
import { CredentialService } from '@src/modules/credential/credential.service';
import { EmailService } from '@src/commons/services';
import { PathwayParticipantStatusEnum } from '@src/commons/enums';
import { PaginatedResult, PaginationDto } from '@src/commons/base';
import { escapeLikePattern } from '@src/commons/utils';
import { IPathwayParticipantService } from './interfaces';

@Injectable()
export class PathwayParticipantService implements IPathwayParticipantService {
  private readonly logger = new Logger(PathwayParticipantService.name);

  constructor(
    @InjectModel(PathwayParticipantEntity)
    private readonly pathwayParticipantModel: typeof PathwayParticipantEntity,
    @InjectModel(PathwayEventEntity)
    private readonly pathwayEventModel: typeof PathwayEventEntity,
    private readonly credentialService: CredentialService,
    private readonly recipientService: RecipientService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Add a participant to a pathway.
   * Finds or creates the recipient, then links to pathway with 'invited' status.
   */
  async addParticipant(
    pathway: PathwayEntity,
    dto: { name: string; email: string },
    organizationUuid: string,
    transaction?: Transaction,
  ): Promise<PathwayParticipantEntity> {
    const { name, email } = dto;
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
  ): Promise<PathwayParticipantStatusEnum> {
    const pathwayEvents = await this.pathwayEventModel.findAll({
      where: { pathway_id: pathwayId },
      attributes: ['event_id'],
      ...(transaction && { transaction }),
    });
    const eventIds = pathwayEvents.map((pe) => pe.event_id);

    if (eventIds.length === 0) return PathwayParticipantStatusEnum.INVITED;

    const issuedCount = await this.credentialService.countIssuedForRecipient(
      recipientId,
      eventIds,
      transaction,
    );

    if (issuedCount >= eventIds.length) return PathwayParticipantStatusEnum.COMPLETED;
    if (issuedCount > 0) return PathwayParticipantStatusEnum.IN_PROGRESS;
    return PathwayParticipantStatusEnum.INVITED;
  }

  /**
   * Get participants for a pathway with pagination
   */
  async getParticipants(
    pathwayId: number,
    pagination: PaginationDto = {},
  ): Promise<PaginatedResult<PathwayParticipantEntity>> {
    const { page = 1, limit = 10, search, sortBy, sortOrder = 'DESC' } = pagination;

    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    let includeWhere: WhereOptions | undefined;
    if (search?.trim()) {
      const escaped = escapeLikePattern(search.trim());
      includeWhere = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${escaped}%` } },
          { email: { [Op.iLike]: `%${escaped}%` } },
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
    const issuedCredentials = await this.credentialService.findIssuedForRecipients(
      recipientIds,
      eventIds,
    );

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

      let status: PathwayParticipantStatusEnum;
      if (issuedCount >= totalEvents) {
        status = PathwayParticipantStatusEnum.COMPLETED;
      } else if (issuedCount > 0) {
        status = PathwayParticipantStatusEnum.IN_PROGRESS;
      } else {
        status = PathwayParticipantStatusEnum.INVITED;
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

  // ─── Public (unauthenticated) methods ───

  /**
   * Get a single participant's progress in a pathway.
   * Returns participant info with credential-level earned/not-earned status.
   */
  async getParticipantPublic(
    pathwayId: number,
    recipientUuid: string,
  ): Promise<PathwayParticipantEntity | null> {
    const participant = await this.pathwayParticipantModel.findOne({
      where: { pathway_id: pathwayId },
      include: [
        {
          model: RecipientEntity,
          as: 'recipient',
          where: { uuid: recipientUuid },
          required: true,
        },
      ],
    });

    if (!participant) return null;

    // Compute the latest status
    const status = await this.computeRecipientStatus(pathwayId, participant.recipient_id);
    participant.setDataValue('status', status);

    return participant;
  }

  /**
   * Get paginated participants for a pathway (public, no auth).
   * Same as getParticipants but exposed for public controller use.
   */
  async getParticipantsPublic(
    pathwayId: number,
    pagination: PaginationDto = {},
  ): Promise<PaginatedResult<PathwayParticipantEntity>> {
    return this.getParticipants(pathwayId, pagination);
  }

  /**
   * Get credential-level progress for a participant in a pathway.
   * Returns which events are earned and which are not.
   */
  async getCredentialProgress(
    pathwayId: number,
    recipientId: number,
  ): Promise<
    Array<{
      event_id: number;
      status: 'earned' | 'not_earned';
      earned_date: string | null;
    }>
  > {
    const pathwayEvents = await this.pathwayEventModel.findAll({
      where: { pathway_id: pathwayId },
      attributes: ['event_id', 'order', 'is_final'],
      order: [['order', 'ASC']],
    });

    const eventIds = pathwayEvents.map((pe) => pe.event_id);
    if (eventIds.length === 0) return [];

    const issuedCredentials = await this.credentialService.findIssuedForRecipients(
      [recipientId],
      eventIds,
    );

    const credentialMap = new Map(issuedCredentials.map((c) => [c.event_id, c.issued_date]));

    return pathwayEvents.map((pe) => ({
      event_id: pe.event_id,
      status: credentialMap.has(pe.event_id) ? ('earned' as const) : ('not_earned' as const),
      earned_date: credentialMap.get(pe.event_id) ?? null,
    }));
  }
}
