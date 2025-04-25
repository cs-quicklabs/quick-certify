import {
  Column,
  Table,
  DataType,
  Index,
  HasMany,
  Scopes,
} from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { OrganizationUserModel } from './organization-user.model';

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

  // Define relationships
  @HasMany(() => OrganizationUserModel)
  organizationUsers: OrganizationUserModel[];

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
