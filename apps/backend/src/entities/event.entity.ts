import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Index,
  Table,
} from 'sequelize-typescript';
import { BaseEntity } from './base.entity';
import { OrganizationEntity } from './organization.entity';
import { EventTypeEntity } from './event-type.entity';
import { EventLevelEntity } from './event-level.entity';
import { EventFormatEntity } from './event-format.entity';
import { DesignEntity } from './design.entity';
import { SkillEntity } from './skill.entity';
import { EventSkillEntity } from './event-skill.entity';
import { CredentialEntity } from './credential.entity';

/**
 * Event Entity
 *
 * Represents an event/course/workshop that can have credentials issued for.
 * Supports progressive creation where only name is required initially,
 * and other fields can be added later.
 */
@Table({
  tableName: 'event',
  underscored: true,
})
export class EventEntity extends BaseEntity {
  // Override UUID with table-specific index
  @Index({ name: 'IDX_EVENT_UUID', unique: true })
  declare uuid: string;

  // Organization relationship (multi-tenant)
  @ForeignKey(() => OrganizationEntity)
  @Index({ name: 'IDX_EVENT_ORGANIZATION_ID' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'organization_id',
  })
  declare organization_id: number;

  @BelongsTo(() => OrganizationEntity, { onDelete: 'CASCADE' })
  declare organization: OrganizationEntity;

  // Event name (required)
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare name: string;

  // Event description (optional)
  @Column({
    type: DataType.TEXT,
    allowNull: true,
    field: 'description',
  })
  declare description: string | null;

  // External learning resources link (optional)
  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    field: 'learning_link',
  })
  declare learning_link: string | null;

  // Event Type (optional - can be set later)
  @ForeignKey(() => EventTypeEntity)
  @Index({ name: 'IDX_EVENT_TYPE_ID' })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'event_type_id',
  })
  declare event_type_id: number | null;

  @BelongsTo(() => EventTypeEntity, { onDelete: 'RESTRICT' })
  declare event_type: EventTypeEntity | null;

  // Event Level (optional - can be set later)
  @ForeignKey(() => EventLevelEntity)
  @Index({ name: 'IDX_EVENT_LEVEL_ID' })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'event_level_id',
  })
  declare event_level_id: number | null;

  @BelongsTo(() => EventLevelEntity, { onDelete: 'RESTRICT' })
  declare event_level: EventLevelEntity | null;

  // Event Format (optional - can be set later)
  @ForeignKey(() => EventFormatEntity)
  @Index({ name: 'IDX_EVENT_FORMAT_ID' })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'event_format_id',
  })
  declare event_format_id: number | null;

  @BelongsTo(() => EventFormatEntity, { onDelete: 'RESTRICT' })
  declare event_format: EventFormatEntity | null;

  // Soft delete flag
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
  })
  declare is_active: boolean;

  // Design attachment (optional)
  @ForeignKey(() => DesignEntity)
  @Index({ name: 'IDX_DESIGN_ID' })
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'design_id',
  })
  declare design_id: number | null;

  @BelongsTo(() => DesignEntity, { onDelete: 'SET NULL' })
  declare design: DesignEntity | null;

  // Duration type (optional - day, week, month)
  @Column({
    type: DataType.STRING(10),
    allowNull: true,
    field: 'duration_type',
  })
  declare duration_type: string | null;

  // Duration value (optional)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: 'duration_value',
  })
  declare duration_value: number | null;

  // Skills associated with this event (many-to-many)
  @BelongsToMany(() => SkillEntity, () => EventSkillEntity)
  declare skills: SkillEntity[];

  @HasMany(() => CredentialEntity)
  declare credentials: CredentialEntity[];
}
