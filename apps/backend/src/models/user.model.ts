import {
  Column,
  Table,
  DataType,
  Index,
  HasMany,
  Scopes,
  DefaultScope,
} from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { Exclude, Expose } from 'class-transformer';
import { OrganizationUserModel } from './organization-user.model';

/**
 * User model representing application users
 */
@DefaultScope(() => ({
  attributes: { exclude: ['password'] }, // Never include password by default
}))
@Scopes(() => ({
  active: {
    where: {
      inActiveAt: null,
    },
  },
  withProfile: {
    attributes: { exclude: ['password'] },
  },
  withOrganizations: {
    include: [
      {
        model: OrganizationUserModel,
        include: ['organization', 'role'],
      },
    ],
  },
}))
@Table({
  tableName: 'users',
  indexes: [
    {
      fields: ['email'],
      unique: true,
      name: 'idx_users_email',
    },
    {
      fields: ['uuid'],
      unique: true,
      name: 'idx_users_uuid',
    },
  ],
})
export class UserModel extends BaseModel {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    allowNull: false,
    comment: 'Unique identifier for external references',
  })
  @Index('idx_users_uuid')
  uuid: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100],
    },
    comment: 'User first name',
  })
  firstName: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100],
    },
    comment: 'User last name',
  })
  lastName: string;

  @Column({
    type: DataType.VIRTUAL,
  })
  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true,
      notEmpty: true,
      len: [5, 255],
    },
    comment: 'User email address (unique)',
  })
  @Index('idx_users_email')
  email: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: false,
    comment: 'Hashed user password',
  })
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    comment: 'Date when user was deactivated',
  })
  inActiveAt: Date;

  @Column({
    type: DataType.STRING(2048),
    allowNull: true,
    validate: {
      isUrl: true,
      len: [0, 2048],
    },
    comment: 'URL to user profile image',
  })
  profileImageUrl: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
    comment: 'User consent for receiving email alerts',
  })
  emailAlertsOptIn: boolean;

  // Define relationships
  @HasMany(() => OrganizationUserModel)
  organizationUsers: OrganizationUserModel[];

  // Helper methods
  isActive(): boolean {
    return this.inActiveAt === null;
  }
}
