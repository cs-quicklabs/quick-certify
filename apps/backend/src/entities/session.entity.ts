import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  IsUUID,
  Table,
} from 'sequelize-typescript';
import { Sequelize } from 'sequelize';
import { BaseEntity } from './base.entity';
import { UserEntity } from './user.entity';

@Table({
  tableName: 'session',
})
export class SessionEntity extends BaseEntity {
  @IsUUID(4)
  @Index({ name: 'IDX_SESSION_HASH', unique: true })
  @Column({
    type: DataType.UUID,
    allowNull: false,
    defaultValue: Sequelize.literal('gen_random_uuid()'),
  })
  declare hash: string;

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
