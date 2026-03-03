import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FindOptions, Op, Transaction } from 'sequelize';
import { EventEntity } from '@src/entities/event.entity';
import { EventTypeEntity } from '@src/entities/event-type.entity';
import { EventLevelEntity } from '@src/entities/event-level.entity';
import { EventFormatEntity } from '@src/entities/event-format.entity';
import { DesignEntity } from '@src/entities/design.entity';
import { SkillEntity } from '@src/entities/skill.entity';
import { FindAllOptions, PaginatedResult } from '@src/commons/base';
import { sanitizePagination, buildPaginatedResult } from '@src/commons/utils';

export interface EventFindAllOptions extends FindAllOptions {
  typeUuids?: string[];
  levelUuids?: string[];
  formatUuids?: string[];
}

/**
 * Default include configuration for Event queries
 * Used consistently across find operations to avoid duplication
 */
export const DEFAULT_EVENT_INCLUDES = [
  {
    model: EventTypeEntity,
    as: 'event_type',
    where: { is_active: true },
    required: false,
  },
  {
    model: EventLevelEntity,
    as: 'event_level',
    where: { is_active: true },
    required: false,
  },
  {
    model: EventFormatEntity,
    as: 'event_format',
    where: { is_active: true },
    required: false,
  },
  {
    model: DesignEntity,
    as: 'design',
    required: false,
  },
  {
    model: SkillEntity,
    as: 'skills',
    required: false,
    through: { attributes: [] },
  },
];

/**
 * Event Repository
 *
 * Abstracts data access for EventEntity.
 * Follows Repository Pattern for better testability and separation of concerns.
 *
 * Single Responsibility: Only handles data access, no business logic
 */
@Injectable()
export class EventRepository {
  constructor(
    @InjectModel(EventEntity)
    private readonly model: typeof EventEntity,
  ) {}

  /**
   * Get the Sequelize instance for transaction management
   */
  getSequelize() {
    const sequelize = this.model.sequelize;
    if (!sequelize) {
      throw new Error('Database connection not available');
    }
    return sequelize;
  }

  /**
   * Find all events with pagination
   */
  async findAll(
    organizationId: number,
    options: EventFindAllOptions = {},
  ): Promise<PaginatedResult<EventEntity>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      where = {},
      search,
      typeUuids,
      levelUuids,
      formatUuids,
    } = options;

    const pagination = sanitizePagination(page, limit);

    const baseWhere: Record<string, unknown> = {
      organization_id: organizationId,
      is_active: true,
      ...where,
    };

    // If searching, pre-fetch IDs matching event name OR design name
    let searchIdFilter: Record<string, unknown> = {};
    if (search?.trim()) {
      const [nameMatches, designMatches] = await Promise.all([
        this.model.findAll({
          where: { ...baseWhere, name: { [Op.iLike]: `%${search.trim()}%` } },
          attributes: ['id'],
          raw: true,
        }),
        this.model.findAll({
          where: baseWhere,
          attributes: ['id'],
          include: [
            {
              model: DesignEntity,
              as: 'design',
              required: true,
              attributes: [],
              where: { name: { [Op.iLike]: `%${search.trim()}%` } },
            },
          ],
          raw: true,
        }),
      ]);

      const ids = [
        ...new Set([
          ...nameMatches.map((e: EventEntity) => e.id),
          ...designMatches.map((e: EventEntity) => e.id),
        ]),
      ];

      // If no matches found, use -1 to guarantee empty result
      searchIdFilter = { id: { [Op.in]: ids.length ? ids : [-1] } };
    }

    const queryWhere: Record<string, unknown> = {
      ...baseWhere,
      ...searchIdFilter,
    };

    const includes = this.buildIncludes({ typeUuids, levelUuids, formatUuids });

    const { count, rows } = await this.model.findAndCountAll({
      where: queryWhere,
      include: includes,
      distinct: true,
      order: [[sortBy, sortOrder]],
      limit: pagination.safeLimit,
      offset: pagination.offset,
    });

    return buildPaginatedResult(rows, count, pagination);
  }

  /**
   * Find event by UUID
   */
  async findByUuid(uuid: string, organizationId: number): Promise<EventEntity | null> {
    return this.model.findOne({
      where: {
        uuid,
        organization_id: organizationId,
        is_active: true,
      },
      include: DEFAULT_EVENT_INCLUDES,
    });
  }

  /**
   * Find event by name (case-insensitive)
   * @param activeOnly - When true, only matches active events (use for update name validation).
   *                     When false/undefined, matches all including soft-deleted (use for create/restore flow).
   */
  async findByName(
    name: string,
    organizationId: number,
    excludeId?: number,
    activeOnly?: boolean,
  ): Promise<EventEntity | null> {
    const where: Record<string, unknown> = {
      organization_id: organizationId,
      name: { [Op.iLike]: name.trim() },
    };

    if (excludeId) {
      where.id = { [Op.ne]: excludeId };
    }

    if (activeOnly) {
      where.is_active = true;
    }

    return this.model.findOne({ where });
  }

  /**
   * Create a new event
   */
  async create(data: Partial<EventEntity>, transaction?: Transaction): Promise<EventEntity> {
    return this.model.create(data as EventEntity['_creationAttributes'], {
      ...(transaction && { transaction }),
    });
  }

  /**
   * Update an event
   */
  async update(
    event: EventEntity,
    data: Partial<EventEntity>,
    transaction?: Transaction,
  ): Promise<EventEntity> {
    await event.update(data, { ...(transaction && { transaction }) });
    return event;
  }

  /**
   * Soft delete an event
   */
  async softDelete(event: EventEntity): Promise<void> {
    await event.update({ is_active: false });
  }

  /**
   * Reload event with includes
   */
  async reload(event: EventEntity): Promise<EventEntity> {
    return event.reload({
      include: DEFAULT_EVENT_INCLUDES,
    });
  }

  /**
   * Find with custom options
   */
  async findOne(options: FindOptions): Promise<EventEntity | null> {
    return this.model.findOne(options);
  }

  /**
   * Build include configuration with optional UUID filters.
   * When filter UUIDs are provided, the join becomes INNER (required: true)
   * so only events matching those associations are returned.
   */
  private buildIncludes(filters: {
    typeUuids?: string[];
    levelUuids?: string[];
    formatUuids?: string[];
  }) {
    return [
      {
        model: EventTypeEntity,
        as: 'event_type',
        where: filters.typeUuids?.length
          ? { is_active: true, uuid: { [Op.in]: filters.typeUuids } }
          : { is_active: true },
        required: !!filters.typeUuids?.length,
      },
      {
        model: EventLevelEntity,
        as: 'event_level',
        where: filters.levelUuids?.length
          ? { is_active: true, uuid: { [Op.in]: filters.levelUuids } }
          : { is_active: true },
        required: !!filters.levelUuids?.length,
      },
      {
        model: EventFormatEntity,
        as: 'event_format',
        where: filters.formatUuids?.length
          ? { is_active: true, uuid: { [Op.in]: filters.formatUuids } }
          : { is_active: true },
        required: !!filters.formatUuids?.length,
      },
      {
        model: DesignEntity,
        as: 'design',
        required: false,
      },
      {
        model: SkillEntity,
        as: 'skills',
        required: false,
        through: { attributes: [] },
      },
    ];
  }

  /**
   * Check whether any active event references the given design
   */
  async existsByDesignId(designId: number): Promise<boolean> {
    const count = await this.model.count({
      where: { design_id: designId, is_active: true },
    });
    return count > 0;
  }

  async countActiveByTypeId(typeId: number): Promise<number> {
    return this.model.count({ where: { event_type_id: typeId, is_active: true } });
  }

  async countActiveByLevelId(levelId: number): Promise<number> {
    return this.model.count({ where: { event_level_id: levelId, is_active: true } });
  }

  async countActiveByFormatId(formatId: number): Promise<number> {
    return this.model.count({ where: { event_format_id: formatId, is_active: true } });
  }

  /**
   * Count events
   */
  async count(organizationId: number): Promise<number> {
    return this.model.count({
      where: {
        organization_id: organizationId,
        is_active: true,
      },
    });
  }

  /**
   * Find active events by UUIDs for an organization
   */
  async findActiveByUuids(
    uuids: string[],
    organizationId: number,
    transaction?: Transaction,
  ): Promise<EventEntity[]> {
    return this.model.findAll({
      where: {
        uuid: uuids,
        organization_id: organizationId,
        is_active: true,
      },
      ...(transaction && { transaction }),
    });
  }
}
