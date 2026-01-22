import { Column, DataType, Index, Table } from 'sequelize-typescript';
import { BaseNanoidEntity } from './base-nanoid.entity';

/**
 * Event Type Entity
 *
 * Represents a type/category of event (e.g., Workshop, Conference, Training)
 */
@Table({
  tableName: 'event_type',
  underscored: true,
})
export class EventTypeEntity extends BaseNanoidEntity {
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
