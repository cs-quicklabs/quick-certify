import { Column, DataType, Index, Table } from 'sequelize-typescript';
import { BaseEntity } from './base.entity';

/**
 * Event Format Entity
 *
 * Represents the format of an event (e.g., Online, In-Person, Hybrid)
 */
@Table({
  tableName: 'event_format',
  underscored: true,
})
export class EventFormatEntity extends BaseEntity {
  // Override UUID with table-specific index
  @Index({ name: 'IDX_EVENT_FORMAT_UUID', unique: true })
  declare uuid: string;

  @Index({ name: 'IDX_EVENT_FORMAT_NAME', unique: true })
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
