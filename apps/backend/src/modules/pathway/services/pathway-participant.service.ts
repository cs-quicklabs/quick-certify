import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Order, Transaction } from 'sequelize';
import { PathwayParticipantEntity } from '@src/entities/pathway-participant.entity';
import { RecipientEntity } from '@src/entities/recipient.entity';
import { PathwayEntity } from '@src/entities/pathway.entity';
import { RecipientService } from '@src/modules/recipient/recipient.service';
import { PaginatedResult } from '@src/commons/base';

@Injectable()
export class PathwayParticipantService {
  constructor(
    @InjectModel(PathwayParticipantEntity)
    private readonly pathwayParticipantModel: typeof PathwayParticipantEntity,
    private readonly recipientService: RecipientService,
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

    return this.pathwayParticipantModel.create(
      {
        pathway_id: pathway.id,
        recipient_id: recipient.id,
        status: 'invited',
      },
      { ...(transaction && { transaction }) },
    );
  }

  /**
   * Get participants for a pathway with pagination
   */
  async getParticipants(
    pathwayId: number,
    options: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: string } = {},
  ): Promise<PaginatedResult<PathwayParticipantEntity>> {
    const { page = 1, limit = 10, search, sortBy, sortOrder = 'DESC' } = options;

    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    const includeWhere: Record<string, unknown> = {};
    if (search?.trim()) {
      includeWhere[Op.or as unknown as string] = [
        { name: { [Op.iLike]: `%${search.trim()}%` } },
        { email: { [Op.iLike]: `%${search.trim()}%` } },
      ];
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
