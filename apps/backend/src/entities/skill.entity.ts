import { BelongsTo, Column, DataType, ForeignKey, Index, Table } from 'sequelize-typescript';
import { BaseNanoidEntity } from './base-nanoid.entity';
import { OrganizationEntity } from './organization.entity';

/**
 * Skill Entity
 *
 * Represents a skill that can be assigned to participants.
 * Skills are organization-specific.
 */
@Table({
  tableName: 'skill',
})
export class SkillEntity extends BaseNanoidEntity {
  @ForeignKey(() => OrganizationEntity)
  @Column({
    type: DataType.STRING(21),
    allowNull: false,
    field: 'organization_id',
  })
  declare organizationId: string;

  @BelongsTo(() => OrganizationEntity)
  declare organization: OrganizationEntity;

  @Index({ name: 'IDX_SKILL_ORG_NAME', unique: true, fields: ['organization_id', 'name'] })
  @Column({
    type: DataType.STRING(150),
    allowNull: false,
  })
  declare name: string;
}

