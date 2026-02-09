import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  Index,
  Model,
  Table,
} from 'sequelize-typescript';
import { EventEntity } from './event.entity';

/**
 * Event Participant Entity
 *
 * Represents a participant registered for a specific event.
 * Each participant has a name and email and belongs to one event.
 */
@Table({
  tableName: 'event_participant',
  underscored: true,
  timestamps: true,
  updatedAt: false, // No updated_at needed - participants are added/removed, not edited
})
export class EventParticipantEntity extends Model {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  declare id: number;

  @Index({ name: 'IDX_EVENT_PARTICIPANT_UUID', unique: true })
  @Column({
    type: DataType.STRING(21),
    allowNull: false,
  })
  declare uuid: string;

  @ForeignKey(() => EventEntity)
  @Index({ name: 'IDX_EVENT_PARTICIPANT_EVENT_ID' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'event_id',
  })
  declare event_id: number;

  @BelongsTo(() => EventEntity)
  declare event: EventEntity;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare email: string;

  @CreatedAt
  @Column({
    field: 'created_at',
    type: DataType.DATE,
    allowNull: false,
  })
  declare createdAt: Date;
}
