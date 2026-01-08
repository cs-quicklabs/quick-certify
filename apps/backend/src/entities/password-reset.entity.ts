import {
  BeforeValidate,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Table,
} from 'sequelize-typescript';
import { BaseNanoidEntity } from './base-nanoid.entity';
import { UserEntity } from './user.entity';
import { generateNanoid } from '@src/commons/utils/nanoid.util';

@Table({
  tableName: 'password_reset',
})
export class PasswordResetEntity extends BaseNanoidEntity {
  @Index({ name: 'IDX_PASSWORD_RESET_UUID', unique: true })
  @Column({
    type: DataType.STRING(21),
    allowNull: false,
  })
  declare uuid: string;

  @BeforeValidate
  static generateUuid<T extends PasswordResetEntity>(instance: T): void {
    if (!instance.uuid) {
      instance.uuid = generateNanoid();
    }
  }

  @ForeignKey(() => UserEntity)
  @Column({
    type: DataType.STRING(21),
    allowNull: false,
  })
  declare user_id: string;

  @BelongsTo(() => UserEntity)
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
