import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { PathwayEntity } from './pathway.entity';
import { EventEntity } from './event.entity';

/**
 * Pathway-Event Junction Entity
 *
 * Many-to-many relationship between pathways and events.
 * Includes an order column for sequencing credentials within a pathway.
 * This is a junction table - no need to extend BaseEntity.
 */
@Table({
  tableName: 'pathway_event',
  underscored: true,
  timestamps: true,
  updatedAt: false,
})
export class PathwayEventEntity extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => PathwayEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'pathway_id',
  })
  declare pathway_id: number;

  @ForeignKey(() => EventEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'event_id',
  })
  declare event_id: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare order: number | null;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  declare createdAt: Date;
}
