import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AuditLogEntity } from '@src/entities';
import { AuditAction } from './audit-action.action';
import { AuditContext } from './interfaces/audit.context.interface';

export interface CreateAuditLogParams {
  action: AuditAction;
  target_user_id: number;
  context: AuditContext;
  previous_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectModel(AuditLogEntity)
    private readonly auditLogRepo: typeof AuditLogEntity,
  ) {}

  /**
   * Write a single audit entry.
   * Never throws — a failed audit write must not break the calling operation.
   */
  async log(params: CreateAuditLogParams): Promise<void> {
    try {
      const { previous_value, new_value } = this.diffValues(
        params.previous_value,
        params.new_value,
      );

      await this.auditLogRepo.create({
        action: params.action,
        target_user_id: params.target_user_id,
        actor_id: params.context.actor_id,
        previous_value: previous_value ?? null,
        new_value: new_value ?? null,
        metadata: params.context.metadata ?? null,
      });
    } catch (error) {
      // Audit failure is non-fatal — log and continue
      this.logger.error(
        `Failed to write audit log [${params.action}] for user ${params.target_user_id}`,
        error,
      );
    }
  }

  /**
   * Returns only the fields that differ between previous and new values.
   * If either is null, returns them as-is (e.g. creation or deletion events).
   */
  private diffValues(
    previous: Record<string, unknown> | null | undefined,
    next: Record<string, unknown> | null | undefined,
  ): {
    previous_value: Record<string, unknown> | null;
    new_value: Record<string, unknown> | null;
  } {
    if (!previous || !next) {
      return {
        previous_value: previous ?? null,
        new_value: next ?? null,
      };
    }

    const changedKeys = Object.keys(next).filter(
      (key) => JSON.stringify(previous[key]) !== JSON.stringify(next[key]),
    );

    if (changedKeys.length === 0) {
      return { previous_value: null, new_value: null };
    }

    return {
      previous_value: changedKeys.reduce(
        (acc, key) => ({ ...acc, [key]: previous[key] }),
        {} as Record<string, unknown>,
      ),
      new_value: changedKeys.reduce(
        (acc, key) => ({ ...acc, [key]: next[key] }),
        {} as Record<string, unknown>,
      ),
    };
  }

  /**
   * Find all archive events for a specific user (who archived them, when).
   */
  async findArchiveHistory(targetUserId: number): Promise<AuditLogEntity[]> {
    return this.auditLogRepo.findAll({
      where: {
        target_user_id: targetUserId,
        action: AuditAction.USER_ARCHIVED,
      },
      include: [
        {
          association: 'actor',
          attributes: ['id', 'uuid', 'first_name', 'last_name', 'email'],
        },
      ],
      order: [['created_at', 'DESC']],
    });
  }
}
