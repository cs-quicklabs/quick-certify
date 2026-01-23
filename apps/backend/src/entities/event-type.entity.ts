import { Column, DataType, Index, Table } from 'sequelize-typescript';
import { BaseEntity } from './base.entity';

/**
 * Event Type Entity
 *
 * Represents a type/category of event (e.g., Workshop, Conference, Training)
 */
@Table({
  tableName: 'event_type',
  underscored: true,
})
export class EventTypeEntity extends BaseEntity {
  // Override UUID with table-specific index
  @Index({ name: 'IDX_EVENT_TYPE_UUID', unique: true })
  declare uuid: string;

  @Index({ name: 'IDX_EVENT_TYPE_NAME', unique: true })
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
