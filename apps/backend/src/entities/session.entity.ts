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
 * Session Entity
 *
 * Represents a user session with authentication token, expiration, and activity tracking.
 * Supports single active session policy per user.
 */
@Table({
  tableName: 'session',
  underscored: true,
})
export class SessionEntity extends BaseEntity {
  // Override UUID with table-specific index
  @Index({ name: 'IDX_SESSION_UUID', unique: true })
  declare uuid: string;

  @Index({ name: 'IDX_SESSION_HASH', unique: true })
  @Column({
    type: DataType.STRING(21),
    allowNull: false,
  })
  declare hash: string;

  @BeforeValidate
  static generateHash<T extends SessionEntity>(instance: T): void {
    if (!instance.hash) {
      instance.hash = generateNanoid();
    }
  }

  @ForeignKey(() => UserEntity)
  @Index({ name: 'IDX_SESSION_USER_ID' })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare user_id: number;

  @BelongsTo(() => UserEntity)
  declare user: UserEntity;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  declare expires_at: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare ip_address: string | null;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare user_agent: string | null;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare device_type: string | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare is_active: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare last_activity_at: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare revoked_at: Date | null;

  // Helper method to check if session is expired
  get isExpired(): boolean {
    return new Date() > this.expires_at;
  }

  // Helper method to check if session is valid
  get isValid(): boolean {
    return this.is_active && !this.revoked_at && !this.isExpired;
  }
}
