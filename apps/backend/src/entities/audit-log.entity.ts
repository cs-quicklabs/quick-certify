import { BelongsTo, Column, DataType, ForeignKey, Index, Table } from 'sequelize-typescript';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';
import { AuditAction } from '@src/modules/audit/audit-action.action';
import { AuditMetadata } from '@src/modules/audit/interfaces/audit.metadata.interface';

@Table({
  tableName: 'audit_log',
  underscored: true,
  updatedAt: false, // audit rows are immutable — never updated, only inserted
})
export class AuditLogEntity extends BaseEntity {
  @Index({ name: 'IDX_AUDIT_LOG_TARGET_USER_ID' })
  @ForeignKey(() => UserEntity)
  @Column({ type: DataType.INTEGER, allowNull: false })
  declare target_user_id: number;

  @BelongsTo(() => UserEntity, { foreignKey: 'target_user_id', onDelete: 'CASCADE' })
  declare target_user: UserEntity;

  @Index({ name: 'IDX_AUDIT_LOG_ACTOR_ID' })
  @ForeignKey(() => UserEntity)
  @Column({ type: DataType.INTEGER, allowNull: true }) // null = system / cron
  declare actor_id: number | null;

  @BelongsTo(() => UserEntity, { foreignKey: 'actor_id', onDelete: 'SET NULL' })
  declare actor: UserEntity;

  @Index({ name: 'IDX_AUDIT_LOG_ACTION' })
  @Column({ type: DataType.STRING(100), allowNull: false })
  declare action: AuditAction;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare previous_value: Record<string, unknown> | null;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare new_value: Record<string, unknown> | null;

  @Column({ type: DataType.JSONB, allowNull: true })
  declare metadata: AuditMetadata | null;
}
