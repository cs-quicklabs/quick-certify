import { BelongsTo, Column, DataType, ForeignKey, HasMany, Index, Table } from 'sequelize-typescript';
import { BaseEntity } from './base.entity';
import { RoleEntity } from './role.entity';
import { OrganizationEntity } from './organization.entity';
import { Exclude } from 'class-transformer';
import { SessionEntity } from './session.entity';
import { PasswordResetEntity } from './password-reset.entity';

/**
 * User Entity
 *
 * Represents a user in the system with authentication, profile, and organization association.
 * Supports multiple auth providers (email, Google OAuth).
 */
@Table({
  tableName: 'user',
  underscored: true,
})
export class UserEntity extends BaseEntity {
  // Override UUID with table-specific index
  @Index({ name: 'IDX_USER_UUID', unique: true })
  declare uuid: string;

  @ForeignKey(() => OrganizationEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare organization_id: number;

  @BelongsTo(() => OrganizationEntity, { onDelete: 'CASCADE' })
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

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare google_id: string | null;

  @ForeignKey(() => RoleEntity)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  declare role_id: number;

  @BelongsTo(() => RoleEntity, { onDelete: 'RESTRICT' })
  declare role: RoleEntity;

  @HasMany(() => SessionEntity)
  declare sessions: SessionEntity[];

  @HasMany(() => PasswordResetEntity)
  declare passwordResets: PasswordResetEntity[];

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
    defaultValue: 'active',
  })
  declare status: 'active' | 'inactive' | 'invited' | 'archived';

  @Column({
    type: DataType.STRING(500),
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

  @Index({ name: 'IDX_USER_INVITATION_TOKEN', unique: true })
  @Column({
    type: DataType.STRING(64),
    allowNull: true,
  })
  declare invitation_token: string | null;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare invitation_expires_at: Date | null;
}
