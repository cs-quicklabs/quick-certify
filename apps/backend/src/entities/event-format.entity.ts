import { Column, DataType, Index, Table } from 'sequelize-typescript';
import { BaseNanoidEntity } from './base-nanoid.entity';

/**
 * Event Format Entity
 *
 * Represents the format of an event (e.g., Online, In-Person, Hybrid)
 */
@Table({
  tableName: 'event_formats',
  underscored: true,
})
export class EventFormatEntity extends BaseNanoidEntity {
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

