import {
  BeforeValidate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Table,
} from 'sequelize-typescript';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';
import { generateNanoid } from '@src/commons/utils/nanoid.util';

/**
 * Password Reset Entity
 *
 * Represents a password reset token with expiration and usage tracking.
 * Used for secure password reset flows.
 */
@Table({
  tableName: 'password_reset',
  underscored: true,
})
export class PasswordResetEntity extends BaseEntity {
  // Override UUID with table-specific index
  @Index({ name: 'IDX_PASSWORD_RESET_UUID', unique: true })
  declare uuid: string;

  @Index({ name: 'IDX_PASSWORD_RESET_TOKEN_UUID', unique: true })
  @Column({
    type: DataType.STRING(21),
    allowNull: false,
  })
  declare token_uuid: string;

  @BeforeValidate
  static generateTokenUuid<T extends PasswordResetEntity>(instance: T): void {
    if (!instance.token_uuid) {
      instance.token_uuid = generateNanoid();
    }
  }

  @ForeignKey(() => UserEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare user_id: number;

  @BelongsTo(() => UserEntity, { onDelete: 'CASCADE' })
  declare user: UserEntity;

  @Index({ name: 'IDX_PASSWORD_RESET_TOKEN' })
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare token: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare expires_at: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare is_used: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare used_at: Date | null;

  get isExpired(): boolean {
    return new Date() > this.expires_at;
  }
}
