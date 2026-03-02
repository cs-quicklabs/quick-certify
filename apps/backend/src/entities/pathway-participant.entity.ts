import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import { PathwayEntity } from './pathway.entity';
import { RecipientEntity } from './recipient.entity';

/**
 * Pathway-Participant Junction Entity
 *
 * Many-to-many relationship between pathways and recipients (participants).
 * Tracks enrollment status: invited, in_progress, completed.
 * This is a junction table - no need to extend BaseEntity.
 */
@Table({
  tableName: 'pathway_participant',
  underscored: true,
  timestamps: true,
})
export class PathwayParticipantEntity extends Model {
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

  @ForeignKey(() => RecipientEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: 'recipient_id',
  })
  declare recipient_id: number;

  @BelongsTo(() => RecipientEntity, { onDelete: 'CASCADE' })
  declare recipient: RecipientEntity;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: 'invited',
  })
  declare status: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'created_at',
  })
  declare createdAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'updated_at',
  })
  declare updatedAt: Date;
}
