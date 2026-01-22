import { BelongsTo, Column, DataType, ForeignKey, Index, Table } from 'sequelize-typescript';
import { BaseEntity } from './base.entity';
import { EventTypeEntity } from './event-type.entity';
import { EventLevelEntity } from './event-level.entity';
import { EventFormatEntity } from './event-format.entity';

/**
 * Event Entity
 *
 * Represents an event with references to type, level, and format
 */
@Table({
  tableName: 'event',
  underscored: true,
})
export class EventEntity extends BaseEntity {
  // Override UUID with table-specific index
  @Index({ name: 'IDX_EVENT_UUID', unique: true })
  declare uuid: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare name: string;

  @ForeignKey(() => EventTypeEntity)
  @Index({ name: 'IDX_EVENT_TYPE_ID' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'event_type_id',
  })
  declare event_type_id: number;

  @BelongsTo(() => EventTypeEntity)
  declare event_type: EventTypeEntity;

  @ForeignKey(() => EventLevelEntity)
  @Index({ name: 'IDX_EVENT_LEVEL_ID' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'event_level_id',
  })
  declare event_level_id: number;

  @BelongsTo(() => EventLevelEntity)
  declare event_level: EventLevelEntity;

  @ForeignKey(() => EventFormatEntity)
  @Index({ name: 'IDX_EVENT_FORMAT_ID' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'event_format_id',
  })
  declare event_format_id: number;

  @BelongsTo(() => EventFormatEntity)
  declare event_format: EventFormatEntity;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
  })
  declare is_active: boolean;
}
