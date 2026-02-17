import { BelongsTo, Column, DataType, ForeignKey, Index, Table } from 'sequelize-typescript';
import { BaseEntity } from './base.entity';
import { OrganizationEntity } from './organization.entity';

@Table({
  tableName: 'event_type',
  underscored: true,
})
export class EventTypeEntity extends BaseEntity {
  // Override UUID with table-specific index
  @Index({ name: 'IDX_EVENT_TYPE_UUID', unique: true })
  declare uuid: string;

  @ForeignKey(() => OrganizationEntity)
  @Index({ name: 'IDX_EVENT_TYPE_ORGANIZATION_ID' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'organization_id',
  })
  declare organization_id: number;

  @BelongsTo(() => OrganizationEntity)
  declare organization: OrganizationEntity;

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
