import { BelongsTo, Column, DataType, ForeignKey, Index, Table } from 'sequelize-typescript';
import { BaseEntity } from './base.entity';
import { OrganizationEntity } from './organization.entity';

@Table({
  tableName: 'recipient',
  underscored: true,
})
export class RecipientEntity extends BaseEntity {
  @Index({ name: 'IDX_RECIPIENT_UUID', unique: true })
  declare uuid: string;

  @ForeignKey(() => OrganizationEntity)
  @Index({ name: 'IDX_RECIPIENT_ORGANIZATION_ID' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'organization_id',
  })
  declare organization_id: number;

  @BelongsTo(() => OrganizationEntity, { onDelete: 'CASCADE' })
  declare organization: OrganizationEntity;

  @Column({
    type: DataType.STRING(200),
    allowNull: false,
  })
  declare name: string;

  @Index({ name: 'IDX_RECIPIENT_EMAIL' })
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare email: string;
}
