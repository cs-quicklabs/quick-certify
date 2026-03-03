import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Transaction } from 'sequelize';
import { FindAllOptions, PaginatedResult } from '@src/commons/base';
import { sanitizePagination, buildPaginatedResult } from '@src/commons/utils';
import { OrganizationEntity, UserEntity, RoleEntity } from '@src/entities';
import { StorageService } from '@src/commons/services';
import { extractDomain, generateNanoid } from '@src/commons/utils';
import { Role } from '@src/modules/role/enums';
import {
  UpdateOrganizationDto,
  UpdateGeneralInfoDto,
  UpdateSocialLinksDto,
  UpdateBrandingDto,
  UpdatePortalSettingsDto,
} from './dtos';
import { IOrganizationService } from './interfaces';

/**
 * Organization Service Implementation
 *
 * SRP: Handles all organization-related operations
 */
@Injectable()
export class OrganizationService implements IOrganizationService {
  constructor(
    @InjectModel(OrganizationEntity)
    private organizationModel: typeof OrganizationEntity,
    @InjectModel(UserEntity)
    private userModel: typeof UserEntity,
    private readonly storageService: StorageService,
  ) {}

  async resolveOrgFromRequestOrDb(identifier: string, orgFromRequest?: OrganizationEntity) {
    return orgFromRequest ?? (await this.resolveOrganization(identifier));
  }

  async findAll(options: FindAllOptions = {}): Promise<PaginatedResult<OrganizationEntity>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', where = {} } = options;

    const pagination = sanitizePagination(page, limit);

    const { count, rows } = await this.organizationModel.findAndCountAll({
      where: {
        ...where,
        is_active: true,
      },
      include: [
        {
          model: UserEntity,
          as: 'users',
          required: false,
          where: { status: 'active' },
          include: [
            {
              model: RoleEntity,
              as: 'role',
              required: true,
              where: { [Op.or]: [{ role: Role.SYSTEM_ADMIN }, { role: Role.SUPER_ADMIN }] },
            },
          ],
          attributes: ['uuid', 'first_name', 'last_name', 'email', 'avatar_url', 'role_id'],
        },
      ],
      order: [[sortBy, sortOrder]],
      limit: pagination.safeLimit,
      offset: pagination.offset,
      distinct: true,
    });

    // Select one admin per organization: prefer system_admin over super_admin
    const data = rows.map((org) => {
      const orgData = org.toJSON() as unknown as OrganizationEntity & {
        users: (UserEntity & { role: RoleEntity })[];
      };
      if (orgData.users && orgData.users.length > 0) {
        const systemAdmin = orgData.users.find((u) => u.role?.role === Role.SYSTEM_ADMIN);
        const selectedUser = systemAdmin || orgData.users[0];
        orgData.users = [selectedUser];
      }
      return orgData;
    });

    return buildPaginatedResult(data as unknown as OrganizationEntity[], count, pagination);
  }

  async findOne(id: number, transaction?: Transaction): Promise<OrganizationEntity | null> {
    return this.organizationModel.findOne({
      where: { id, is_active: true },
      ...(transaction && { transaction }),
    });
  }

  async resolveOrganization(identifier: string): Promise<OrganizationEntity | null> {
    // Lookup by slug OR UUID
    const org = await this.organizationModel.findOne({
      where: {
        [Op.or]: [{ slug: identifier }, { uuid: identifier }],
      },
    });
    return org;
  }

  async findByUuid(uuid: string): Promise<OrganizationEntity | null> {
    return this.organizationModel.findOne({
      where: { uuid, is_active: true },
    });
  }

  async findByUuidOrFail(uuid: string): Promise<OrganizationEntity> {
    const organization = await this.findByUuid(uuid);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }

  async findByIdOrFail(id: number): Promise<OrganizationEntity> {
    const organization = await this.organizationModel.findOne({
      where: { id, is_active: true },
    });
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    return organization;
  }

  async findBySlug(slug: string): Promise<OrganizationEntity | null> {
    return await this.organizationModel.findOne({
      where: { slug, is_active: true },
    });
  }

  async create(
    organization: Partial<OrganizationEntity>,
    options?: { transaction?: Transaction },
  ): Promise<OrganizationEntity> {
    const slug = organization.slug || this.generateSlug(organization?.name || '');

    const existingSlug = await this.organizationModel.findOne({
      where: { slug },
      ...(options?.transaction && { transaction: options.transaction }),
    });
    if (existingSlug) {
      throw new ConflictException('Organization with this slug already exists');
    }

    const existingName = await this.organizationModel.findOne({
      where: { name: organization?.name },
      ...(options?.transaction && { transaction: options.transaction }),
    });
    if (existingName) {
      throw new ConflictException('Organization with this name already exists');
    }

    const createdOrganization = (await this.organizationModel.create(
      {
        ...organization,
        name: organization?.name,
        slug,
        is_active: organization?.is_active !== undefined ? organization?.is_active : true,
        issuer_verified:
          organization?.issuer_verified !== undefined ? organization?.issuer_verified : false,
      },
      {
        ...(options?.transaction && { transaction: options.transaction }),
      },
    )) as OrganizationEntity;

    return createdOrganization;
  }

  async update(id: number, dto: UpdateOrganizationDto): Promise<OrganizationEntity> {
    const organization = await this.findByIdOrFail(id);
    const updateData: Partial<OrganizationEntity> = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name;

      // Checking Uniqueness of the name
      const existedOrgWithOrgName = await this.organizationModel.findOne({
        where: { name: { [Op.iLike]: dto.name } },
      });

      if (existedOrgWithOrgName && existedOrgWithOrgName.id !== id) {
        throw new ConflictException('Organization with this name already exists');
      }

      if (dto.name !== organization.name && !dto.slug) {
        updateData.slug = this.generateSlug(dto.name);
        const existingSlug = await this.getOrganizationsBySlug(updateData.slug);
        if (existingSlug && existingSlug.id !== id) {
          throw new ConflictException('Slug already taken');
        }
      }
    }

    if (dto.slug !== undefined) {
      const existingSlug = await this.getOrganizationsBySlug(dto.slug);
      if (existingSlug && existingSlug.id !== id) {
        throw new ConflictException('Slug already taken');
      }
      updateData.slug = dto.slug;
    }

    if (dto.is_active !== undefined) updateData.is_active = dto.is_active;
    if (dto.issuer_verified !== undefined) updateData.issuer_verified = dto.issuer_verified;

    await organization.update(updateData);

    return organization;
  }

  async getOrganizationsBySlug(slug: string) {
    return await this.organizationModel.findOne({
      where: { slug },
    });
  }

  async updateByUuid(uuid: string, dto: UpdateOrganizationDto): Promise<OrganizationEntity> {
    const organization = await this.findByUuidOrFail(uuid);
    return this.update(organization.id, dto);
  }

  /**
   * Permanently delete an organization from the database
   * This action is irreversible and removes all associated data
   * Deletes: users (cascades to sessions, password_resets), skills, and the organization
   * Only accessible by SYSTEM_ADMIN role
   */
  async permanentlyDelete(uuid: string): Promise<boolean> {
    const sequelize = this.organizationModel.sequelize;
    if (!sequelize) {
      throw new Error('Database connection not available');
    }
    const transaction = await sequelize.transaction();

    try {
      const organization = await this.findByUuidOrFail(uuid);

      // Delete all users in the organization (cascades to sessions, password_resets)
      await this.userModel.destroy({
        where: { organization_id: organization.id },
        transaction,
      });

      // Clean up associated storage files
      if (organization.logo_url) {
        await this.storageService.deleteFileByUrl(organization.logo_url).catch(() => {
          // Silently fail if deletion fails (file might not exist)
        });
      }
      if (organization.favicon_url) {
        await this.storageService.deleteFileByUrl(organization.favicon_url).catch(() => {
          // Silently fail if deletion fails (file might not exist)
        });
      }
      if (organization.banner_url) {
        await this.storageService.deleteFileByUrl(organization.banner_url).catch(() => {
          // Silently fail if deletion fails (file might not exist)
        });
      }

      // Delete organization (cascades to skills)
      await organization.destroy({ force: true, transaction });

      await transaction.commit();
      return true;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async searchOrganizations(
    searchQuery: string,
    options: FindAllOptions = {},
  ): Promise<PaginatedResult<OrganizationEntity>> {
    const searchCondition = {
      [Op.or]: [
        { name: { [Op.iLike]: `%${searchQuery}%` } },
        { slug: { [Op.iLike]: `%${searchQuery}%` } },
      ],
    };

    return this.findAll({
      ...options,
      where: {
        ...options.where,
        ...searchCondition,
      },
    });
  }

  // ============================================
  // Account Settings Methods
  // ============================================

  /**
   * Update organization general information
   */
  async updateGeneralInfo(uuid: string, dto: UpdateGeneralInfoDto): Promise<OrganizationEntity> {
    const org = await this.findByUuidOrFail(uuid);

    // Check if name is being changed and is unique
    if (dto.name && dto.name !== org.name) {
      const existingName = await this.organizationModel.findOne({
        where: { name: dto.name, id: { [Op.ne]: org.id } },
      });
      if (existingName) {
        throw new ConflictException('Organization with this name already exists');
      }

      // Auto-generate new slug when name changes
      const newSlug = this.generateSlug(dto.name);
      const existingSlug = await this.organizationModel.findOne({
        where: { slug: newSlug, id: { [Op.ne]: org.id } },
      });
      if (existingSlug) {
        throw new ConflictException('Organization with similar name already exists');
      }

      await org.update({
        name: dto.name,
        slug: newSlug,
        description: dto.description || null,
        support_email: dto.support_email || null,
        slogan: dto.slogan || null,
        linkedin_company_id: dto.linkedin_company_id || null,
      });
    } else {
      await org.update({
        description: dto.description || null,
        support_email: dto.support_email || null,
        slogan: dto.slogan || null,
        linkedin_company_id: dto.linkedin_company_id || null,
      });
    }

    return org.reload();
  }

  /**
   * Update organization social links
   */
  async updateSocialLinks(uuid: string, dto: UpdateSocialLinksDto): Promise<OrganizationEntity> {
    const org = await this.findByUuidOrFail(uuid);

    // Check if website domain is being changed and is unique
    if (dto.website) {
      await this.validateWebsiteDomain(org.id, dto.website);
    }

    await org.update({
      linkedin_url: dto.linkedin_url || null,
      facebook_url: dto.facebook_url || null,
      twitter_url: dto.twitter_url || null,
      ...(dto.website && { website: dto.website }),
    });

    return org.reload();
  }

  /**
   * Update organization branding
   * Deletes old images from storage when replaced
   */
  async updateBranding(uuid: string, dto: UpdateBrandingDto): Promise<OrganizationEntity> {
    const org = await this.findByUuidOrFail(uuid);

    // Delete old logo from storage if being replaced or removed
    if (dto.logo_url !== undefined && org.logo_url) {
      if (dto.logo_url !== org.logo_url || dto.logo_url === '') {
        // Old logo is being replaced or removed
        await this.storageService.deleteFileByUrl(org.logo_url).catch(() => {
          // Silently fail if deletion fails (file might not exist)
        });
      }
    }

    // Delete old favicon from storage if being replaced or removed
    if (dto.favicon_url !== undefined && org.favicon_url) {
      if (dto.favicon_url !== org.favicon_url || dto.favicon_url === '') {
        // Old favicon is being replaced or removed
        await this.storageService.deleteFileByUrl(org.favicon_url).catch(() => {
          // Silently fail if deletion fails (file might not exist)
        });
      }
    }

    // Convert empty strings to null for cleaner database storage
    await org.update({
      logo_url: dto.logo_url === '' ? null : dto.logo_url,
      favicon_url: dto.favicon_url === '' ? null : dto.favicon_url,
    });

    return org.reload();
  }

  /**
   * Update issuer portal settings
   * Deletes old banner from storage when replaced
   */
  async updatePortalSettings(
    uuid: string,
    dto: UpdatePortalSettingsDto,
  ): Promise<OrganizationEntity> {
    const org = await this.findByUuidOrFail(uuid);

    // Delete old banner from storage if being replaced or removed
    if (dto.banner_url !== undefined && org.banner_url) {
      if (dto.banner_url !== org.banner_url || dto.banner_url === '') {
        // Old banner is being replaced or removed
        await this.storageService.deleteFileByUrl(org.banner_url).catch(() => {
          // Silently fail if deletion fails (file might not exist)
        });
      }
    }

    // Convert empty strings to null for cleaner database storage
    await org.update({
      banner_url: dto.banner_url === '' ? null : dto.banner_url,
      portal_enabled: dto.portal_enabled,
    });

    return org.reload();
  }

  /**
   * Validate organization creation data (name, slug, website)
   * Centralizes validation logic to avoid duplication
   * @param name - The organization name to validate
   * @param websiteUrl - Optional website URL to validate
   * @throws ConflictException if name or slug already exists
   * @throws BadRequestException if website domain is invalid or already in use
   */
  async validateOrganizationCreation(name: string, websiteUrl?: string | null): Promise<void> {
    const slug = this.generateSlug(name);

    // Check if slug already exists
    const existingSlug = await this.findBySlug(slug);
    if (existingSlug) {
      throw new ConflictException('Organization with this name already exists');
    }

    // Check if name already exists
    const existingOrgName = await this.findAll({ where: { name } });
    if (existingOrgName.data.length > 0) {
      throw new ConflictException('Organization with this name already exists');
    }

    // Check if website URL is already in use
    if (websiteUrl) {
      await this.validateWebsiteDomain(null, websiteUrl);
    }
  }

  /**
   * Validate if a website domain is already in use
   * @param websiteUrl - The website URL to validate
   * @throws BadRequestException if the website URL is invalid
   * @throws ConflictException if the website domain is already in use
   */
  async validateWebsiteDomain(
    originalOrganizationId: number | null,
    websiteUrl: string,
  ): Promise<void> {
    const domain = extractDomain(websiteUrl);
    if (!domain) {
      throw new BadRequestException('Invalid website URL');
    }

    // Find all organizations and check if any has the same domain
    const organizations = await this.organizationModel.findAll({
      where: {
        is_active: true,
        ...(originalOrganizationId && { id: { [Op.ne]: originalOrganizationId } }),
        website: { [Op.like]: `%${domain}%` },
      },
      attributes: ['id', 'website'],
    });

    const existingOrg = organizations.find((org) => extractDomain(org.website) === domain);
    if (existingOrg) {
      throw new ConflictException('An organization with this domain already exists');
    }
  }

  /**
   * Generate a URL-friendly slug from an organization name
   * @param name - The organization name to generate a slug from
   * @returns A URL-friendly slug
   */
  generateSlug(name: string): string {
    if (!name) return '';

    const cleanedName = name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    return cleanedName.length < 125 ? cleanedName + '-' + generateNanoid() : generateNanoid();
  }
}
