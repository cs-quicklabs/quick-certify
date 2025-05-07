import {
  Column,
  Table,
  DataType,
  Index,
  HasMany,
  Scopes,
  BelongsToMany,
} from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { OrganizationUserModel } from './organization-user.model';
import { UserModel } from './user.model';

/**
 * Organization model representing groups that users can belong to
 */
@Scopes(() => ({
  withUsers: {
    include: [
      {
        model: OrganizationUserModel,
        include: ['user', 'role'],
      },
    ],
  },
}))
@Table({
  tableName: 'organizations',
  indexes: [
    {
      fields: ['slug'],
      unique: true,
      name: 'idx_organizations_slug',
    },
  ],
})
export class OrganizationModel extends BaseModel {
  @Column({
    type: DataType.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200],
    },
    comment: 'Organization name',
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      is: /^[a-z0-9-]+$/i, // Only alphanumeric and hyphens
      len: [2, 100],
    },
    comment: 'URL-friendly unique identifier',
  })
  @Index('idx_organizations_slug')
  slug: string;

  @Column({
    type: DataType.STRING(1024),
    allowNull: true,
    validate: {
      isUrl: true,
      len: [0, 1024],
    },
    comment: 'LinkedIn profile URL',
  })
  linkedInUrl: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    validate: {
      isInt: true,
    },
    comment: 'LinkedIn Company ID',
  })
  linkedInCompanyId: number;

  @Column({
    type: DataType.STRING(1024),
    allowNull: true,
    validate: {
      isUrl: true,
      len: [0, 1024],
    },
    comment: 'Facebook page URL',
  })
  facebookUrl: string;

  @Column({
    type: DataType.STRING(1024),
    allowNull: true,
    validate: {
      isUrl: true,
      len: [0, 1024],
    },
    comment: 'Twitter/X profile URL',
  })
  twitterUrl: string;

  @Column({
    type: DataType.STRING(1024),
    allowNull: true,
    validate: {
      isUrl: true,
      len: [0, 1024],
    },
    comment: 'Organization website URL',
  })
  websiteUrl: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: 'Indicates whether the organization has been verified',
  })
  isVerified: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    comment: 'Organization description',
  })
  description: string;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true,
    },
    comment: 'Support email address for the organization',
  })
  supportEmail: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    validate: {
      len: [0, 500],
    },
    comment: 'Organization slogan or tagline',
  })
  slogan: string;

  @Column({
    type: DataType.STRING(2048),
    allowNull: true,
    validate: {
      isUrl: true,
      len: [0, 2048],
    },
    comment: 'S3 URL for issuer/organization logo image',
  })
  issuerLogo: string;

  @Column({
    type: DataType.STRING(2048),
    allowNull: true,
    validate: {
      isUrl: true,
      len: [0, 2048],
    },
    comment: 'S3 URL for organization favicon',
  })
  favIcon: string;

  @Column({
    type: DataType.STRING(2048),
    allowNull: true,
    validate: {
      isUrl: true,
      len: [0, 2048],
    },
    comment: 'S3 URL for organization banner image',
  })
  bannerImage: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment:
      'Indicates whether the issuer portal is enabled for this organization',
  })
  isEnabledIssuerPortal: boolean;

  // Define relationships
  @HasMany(() => OrganizationUserModel)
  organizationUsers: OrganizationUserModel[];

  @BelongsToMany(() => UserModel, () => OrganizationUserModel)
  users: UserModel[];

  // Helper methods
  getSocialLinks(): Record<string, string> {
    return {
      website: this.websiteUrl,
      linkedin: this.linkedInUrl,
      facebook: this.facebookUrl,
      twitter: this.twitterUrl,
    };
  }
}
