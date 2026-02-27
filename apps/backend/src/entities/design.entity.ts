import { BelongsTo, Column, DataType, ForeignKey, Index, Table } from 'sequelize-typescript';
import { DesignLayout } from '@src/modules/design/interfaces/';
import { BaseEntity } from './base.entity';
import { OrganizationEntity } from './organization.entity';
import { Design } from '@src/modules/design/enums';

/**
 * Design Entity
 *
 * Design can either be for a Badge or a Certificate
 */

@Table({
  tableName: 'design',
  underscored: true,
})
export class DesignEntity extends BaseEntity {
  // Override UUID with table-specific index
  @Index({ name: 'IDX_DESIGN_UUID', unique: true })
  declare uuid: string;

  @Index({ name: 'IDX_DESIGN_NAME' })
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare name: string;

  @ForeignKey(() => OrganizationEntity)
  @Index({ name: 'IDX_DESIGN_ORGANIZATION_ID' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'organization_id',
    onDelete: 'CASCADE',
  })
  declare organization_id: number;

  @BelongsTo(() => OrganizationEntity, {
    onDelete: 'CASCADE',
  })
  declare organization: OrganizationEntity;

  @Column({
    type: DataType.STRING(15),
    allowNull: false,
  })
  declare type: Design;

  @Column({
    type: DataType.STRING(500),
    allowNull: false,
  })
  declare url: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  declare layout: DesignLayout | null;
}
