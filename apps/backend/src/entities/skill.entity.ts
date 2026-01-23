import { BelongsTo, Column, DataType, ForeignKey, Index, Table } from 'sequelize-typescript';
import { BaseEntity } from './base.entity';
import { OrganizationEntity } from './organization.entity';

/**
 * Skill Entity
 *
 * Represents a skill that can be assigned to participants.
 * Skills are organization-specific.
 */
@Table({
  tableName: 'skill',
  underscored: true,
})
export class SkillEntity extends BaseEntity {
  // Override UUID with table-specific index
  @Index({ name: 'IDX_SKILL_UUID', unique: true })
  declare uuid: string;

  @ForeignKey(() => OrganizationEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'organization_id',
  })
  declare organization_id: number;

  @BelongsTo(() => OrganizationEntity)
  declare organization: OrganizationEntity;

  @Index({ name: 'IDX_SKILL_ORG_NAME', unique: true, fields: ['organization_id', 'name'] })
  @Column({
    type: DataType.STRING(150),
    allowNull: false,
  })
  declare name: string;
}
