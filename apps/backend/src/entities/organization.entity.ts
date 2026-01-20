import { Column, DataType, Index, Table } from 'sequelize-typescript';
import { BaseNanoidEntity } from './base-nanoid.entity';

/**
 * Organization Entity
 *
 * Represents an organization/company in the multi-tenant system.
 * Contains general information, social links, branding, and portal settings.
 */
@Table({
  tableName: 'organization',
})
export class OrganizationEntity extends BaseNanoidEntity {
  // ============================================
  // General Information
  // ============================================

  @Index({ name: 'IDX_ORGANIZATION_NAME', unique: true })
  @Column({
    type: DataType.STRING(150),
    allowNull: false,
  })
  declare name: string;

  @Index({ name: 'IDX_ORGANIZATION_SLUG', unique: true })
  @Column({
    type: DataType.STRING(150),
    allowNull: false,
  })
  declare slug: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare description: string | null;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare support_email: string | null;

  @Column({
    type: DataType.STRING(255),
    allowNull: true,
  })
  declare slogan: string | null;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
  })
  declare linkedin_company_id: string | null;

  @Index({ name: 'IDX_ORGANIZATION_WEBSITE', unique: true })
  @Column({
    type: DataType.STRING(500),
    allowNull: false,
  })
  declare website: string;

  // ============================================
  // Social Links
  // ============================================

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  declare linkedin_url: string | null;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  declare facebook_url: string | null;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  declare twitter_url: string | null;

  // ============================================
  // Branding
  // ============================================

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  declare logo_url: string | null;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  declare favicon_url: string | null;

  // ============================================
  // Issuer Portal Settings
  // ============================================

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
  })
  declare banner_url: string | null;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare portal_enabled: boolean;

  // ============================================
  // Status Fields
  // ============================================

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  declare is_active: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  declare issuer_verified: boolean;
}
