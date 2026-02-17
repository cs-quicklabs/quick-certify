import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Index,
  Table,
} from 'sequelize-typescript';
import { BaseEntity } from './base.entity';
import { OrganizationEntity } from './organization.entity';
import { EventEntity } from './event.entity';
import { UserEntity } from './user.entity';
import { CredentialEntity } from './credential.entity';
import { BatchStatusEnum } from '@src/commons/enums';

@Table({
  tableName: 'credential_issue_batch',
  underscored: true,
})
export class CredentialIssueBatchEntity extends BaseEntity {
  @Index({ name: 'IDX_BATCH_UUID', unique: true })
  declare uuid: string;

  @ForeignKey(() => OrganizationEntity)
  @Index({ name: 'IDX_BATCH_ORGANIZATION_ID' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'organization_id',
  })
  declare organization_id: number;

  @BelongsTo(() => OrganizationEntity)
  declare organization: OrganizationEntity;

  @ForeignKey(() => EventEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'event_id',
  })
  declare event_id: number;

  @BelongsTo(() => EventEntity)
  declare event: EventEntity;

  @Index({ name: 'IDX_BATCH_IDEMPOTENCY', unique: true })
  @Column({
    type: DataType.STRING(64),
    allowNull: false,
    field: 'idempotency_key',
  })
  declare idempotency_key: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'total_count',
  })
  declare total_count: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'processed_count',
  })
  declare processed_count: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'success_count',
  })
  declare success_count: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'failed_count',
  })
  declare failed_count: number;

  @Index({ name: 'IDX_BATCH_STATUS' })
  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: BatchStatusEnum.PENDING,
  })
  declare status: BatchStatusEnum;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
    field: 'error_details',
  })
  declare error_details: Array<{ credentialId: number; error: string }> | null;

  @ForeignKey(() => UserEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'created_by',
  })
  declare created_by: number;

  @BelongsTo(() => UserEntity)
  declare creator: UserEntity;

  @HasMany(() => CredentialEntity, 'batch_id')
  declare credentials: CredentialEntity[];
}
