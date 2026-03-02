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

@Table({
  tableName: 'event_format',
  underscored: true,
})
export class EventFormatEntity extends BaseEntity {
  // Override UUID with table-specific index
  @Index({ name: 'IDX_EVENT_FORMAT_UUID', unique: true })
  declare uuid: string;

  // Organization relationship (multi-tenant)
  @ForeignKey(() => OrganizationEntity)
  @Index({ name: 'IDX_EVENT_FORMAT_ORGANIZATION_ID' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'organization_id',
  })
  declare organization_id: number;

  @BelongsTo(() => OrganizationEntity, { onDelete: 'CASCADE' })
  declare organization: OrganizationEntity;

  @HasMany(() => EventEntity)
  declare events: EventEntity[];

  // Composite unique index on (organization_id, name) - defined in migration
  @Column({
    type: DataType.STRING(150),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
  })
  declare is_active: boolean;
}
