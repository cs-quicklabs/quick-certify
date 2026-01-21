import { BelongsTo, Column, DataType, ForeignKey, Index, Table } from 'sequelize-typescript';
import { BaseNanoidEntity } from './base-nanoid.entity';
import { RoleEntity } from './role.entity';
import { OrganizationEntity } from './organization.entity';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';

// TODO: Move to config
const SALT_ROUNDS = 10;

@Table({
  tableName: 'user',
})
export class UserEntity extends BaseNanoidEntity {
  @ForeignKey(() => OrganizationEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare organization_id: number;

  @BelongsTo(() => OrganizationEntity)
  declare organization: OrganizationEntity;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
  })
  declare first_name: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare last_name: string | null;

  @Column({
    type: DataType.VIRTUAL,
  })
  get full_name(): string {
    return `${this.first_name} ${this.last_name || ''}`.trim();
  }

  @Index({ name: 'IDX_USER_EMAIL', unique: true })
  @Column({
    type: DataType.STRING(255),
    allowNull: false,
  })
  declare email: string;

  @Exclude({ toPlainOnly: true })
  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare password_hash: string | null;

  @Exclude({ toPlainOnly: true })
  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    defaultValue: 'email',
  })
  declare auth_provider: string;

  @Exclude({ toPlainOnly: true })
  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare google_id: string | null;

  @ForeignKey(() => RoleEntity)
  @Column({
    type: DataType.STRING(21),
    allowNull: false,
  })
  declare role_id: string;

  @BelongsTo(() => RoleEntity)
  declare role: RoleEntity;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: 'active',
  })
  declare status: 'active' | 'inactive' | 'invited' | 'archived';

  @Column({
    type: DataType.STRING(2048),
    allowNull: true,
  })
  declare avatar_url: string | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare is_email_notifications_enabled: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare deleted_at: Date | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare last_login_at: Date | null;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
