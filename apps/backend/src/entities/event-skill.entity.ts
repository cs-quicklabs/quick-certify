import { Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { EventEntity } from './event.entity';
import { SkillEntity } from './skill.entity';

/**
 * Event-Skill Junction Entity
 *
 * Many-to-many relationship between events and skills.
 * This is a simple junction table - no need to extend BaseEntity.
 */
@Table({
  tableName: 'event_skill',
  underscored: true,
  timestamps: true,
  updatedAt: false, // No updated_at needed for junction table
})
export class EventSkillEntity extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @ForeignKey(() => EventEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'event_id',
  })
  declare event_id: number;

  @ForeignKey(() => SkillEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'skill_id',
  })
  declare skill_id: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  declare createdAt: Date;
}
