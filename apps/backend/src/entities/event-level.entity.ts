import { Column, DataType, Index, Table } from 'sequelize-typescript';
import { BaseNanoidEntity } from './base-nanoid.entity';

/**
 * Event Level Entity
 *
 * Represents the level of an event (e.g., Beginner, Intermediate, Advanced)
 */
@Table({
  tableName: 'event_levels',
  underscored: true,
})
export class EventLevelEntity extends BaseNanoidEntity {
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

