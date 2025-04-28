import {
  Column,
  DataType,
  Table,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { UserModel } from './user.model';

/**
 * User Reset Token model representing user reset token sessions
 */
@Table({
  tableName: 'user_reset_tokens',
})
export class UserResetTokenModel extends BaseModel {
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
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether the token is valid',
  })
  isValid: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    comment: 'Session expiration timestamp',
  })
  expiryAt: Date;

  // Define relationships
  @BelongsTo(() => UserModel, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
  })
  user: UserModel;
}
