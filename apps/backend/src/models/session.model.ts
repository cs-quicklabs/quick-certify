import {
  Column,
  DataType,
  Table,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { UserModel } from './user.model';

/**
 * Session model representing user sessions
 */
@Table({
  tableName: 'session',
})
export class SessionModel extends BaseModel {
  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Foreign key to users table',
  })
  userId: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: 'Session hash for authentication',
  })
  hash: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    comment: 'Session expiration timestamp',
  })
  expires: string;

  // Define relationships
  @BelongsTo(() => UserModel, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
  })
  user: UserModel;
}
