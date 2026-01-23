import { Column, DataType, Index, Table } from 'sequelize-typescript';
import { BaseEntity } from './base.entity';

/**
 * Event Level Entity
 *
 * Represents the level of an event (e.g., Beginner, Intermediate, Advanced)
 */
@Table({
  tableName: 'event_level',
  underscored: true,
})
export class EventLevelEntity extends BaseEntity {
  // Override UUID with table-specific index
  @Index({ name: 'IDX_EVENT_LEVEL_UUID', unique: true })
  declare uuid: string;

  @Index({ name: 'IDX_EVENT_LEVEL_NAME', unique: true })
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
