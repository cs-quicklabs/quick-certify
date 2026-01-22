import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op, Transaction } from 'sequelize';
import { FindAllOptions, PaginatedResult } from '@src/commons/base';
import { OrganizationEntity } from '@src/entities';
import { StorageService } from '@src/commons/services';
import { extractDomain } from '@src/commons/utils';
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
    private readonly storageService: StorageService,
  ) { }

  async findAll(options: FindAllOptions = {}): Promise<PaginatedResult<OrganizationEntity>> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', where = {} } = options;

    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    const { count, rows } = await this.organizationModel.findAndCountAll({
      where: {
        ...where,
        is_active: true,
      },
      order: [[sortBy, sortOrder]],
      limit: safeLimit,
      offset,
    });

    const totalPages = Math.ceil(count / safeLimit);

    return {
      data: rows,
      meta: {
        total: count,
        page: safePage,
        limit: safeLimit,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1,
      },
    };
  }

  async findOne(id: string): Promise<OrganizationEntity | null> {
    return this.organizationModel.findOne({
      where: { id, is_active: true },
    });
  }

  async findBySlug(slug: string): Promise<OrganizationEntity | null> {
    return this.organizationModel.findOne({
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

    const createdOrganization = await this.organizationModel.create(
      {
        name: organization?.name,
        slug,
        is_active: organization?.is_active !== undefined ? organization?.is_active : true,
        issuer_verified: organization?.issuer_verified !== undefined ? organization?.issuer_verified : false,
      },
      {
        ...(options?.transaction && { transaction: options.transaction }),
      },
    ) as OrganizationEntity;

    return createdOrganization;
  }

  async update(id: string, dto: UpdateOrganizationDto): Promise<OrganizationEntity> {
    const organization = await this.organizationModel.findOne({
      where: { id, is_active: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const updateData: Partial<OrganizationEntity> = {};

    if (dto.name !== undefined) {
      updateData.name = dto.name;
      if (dto.name !== organization.name && !dto.slug) {
        updateData.slug = this.generateSlug(dto.name);
        const existingSlug = await this.organizationModel.findOne({
          where: { slug: updateData.slug, id: { [Op.ne]: id } },
        });
        if (existingSlug) {
          throw new ConflictException('Organization with this name already exists');
        }
      }
    }
    if (dto.slug !== undefined) {
      const existingSlug = await this.organizationModel.findOne({
        where: { slug: dto.slug, id: { [Op.ne]: id } },
      });
      if (existingSlug) {
        throw new ConflictException('Slug already taken');
      }
      updateData.slug = dto.slug;
    }
    if (dto.is_active !== undefined) updateData.is_active = dto.is_active;
    if (dto.issuer_verified !== undefined) updateData.issuer_verified = dto.issuer_verified;

    await organization.update(updateData);

    return organization;
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
  async updateGeneralInfo(id: string, dto: UpdateGeneralInfoDto): Promise<OrganizationEntity> {
    const organization = await this.organizationModel.findOne({
      where: { id, is_active: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check if name is being changed and is unique
    if (dto.name && dto.name !== organization.name) {
      const existingName = await this.organizationModel.findOne({
        where: { name: dto.name, id: { [Op.ne]: id } },
      });
      if (existingName) {
        throw new ConflictException('Organization with this name already exists');
      }

      // Auto-generate new slug when name changes
      const newSlug = this.generateSlug(dto.name);
      const existingSlug = await this.organizationModel.findOne({
        where: { slug: newSlug, id: { [Op.ne]: id } },
      });
      if (existingSlug) {
        throw new ConflictException('Organization with similar name already exists');
      }

      await organization.update({
        name: dto.name,
        slug: newSlug,
        description: dto.description || null,
        support_email: dto.support_email || null,
        slogan: dto.slogan || null,
        linkedin_company_id: dto.linkedin_company_id || null,
      });
    } else {
      await organization.update({
        description: dto.description || null,
        support_email: dto.support_email || null,
        slogan: dto.slogan || null,
        linkedin_company_id: dto.linkedin_company_id || null,
      });
    }

    return organization.reload();
  }

  /**
   * Update organization social links
   */
  async updateSocialLinks(id: string, dto: UpdateSocialLinksDto): Promise<OrganizationEntity> {
    const organization = await this.organizationModel.findOne({
      where: { id, is_active: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check if website domain is being changed and is unique
    if (dto.website) {
      await this.validateWebsiteDomain(id, dto.website);
    }

    await organization.update({
      linkedin_url: dto.linkedin_url || null,
      facebook_url: dto.facebook_url || null,
      twitter_url: dto.twitter_url || null,
      ...(dto.website && { website: dto.website }),
    });

    return organization.reload();
  }

  /**
   * Update organization branding
   * Deletes old images from storage when replaced
   */
  async updateBranding(id: string, dto: UpdateBrandingDto): Promise<OrganizationEntity> {
    const organization = await this.organizationModel.findOne({
      where: { id, is_active: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Delete old logo from storage if being replaced or removed
    if (dto.logo_url !== undefined && organization.logo_url) {
      if (dto.logo_url !== organization.logo_url || dto.logo_url === '') {
        // Old logo is being replaced or removed
        await this.storageService.deleteFileByUrl(organization.logo_url).catch(() => {
          // Silently fail if deletion fails (file might not exist)
        });
      }
    }

    // Delete old favicon from storage if being replaced or removed
    if (dto.favicon_url !== undefined && organization.favicon_url) {
      if (dto.favicon_url !== organization.favicon_url || dto.favicon_url === '') {
        // Old favicon is being replaced or removed
        await this.storageService.deleteFileByUrl(organization.favicon_url).catch(() => {
          // Silently fail if deletion fails (file might not exist)
        });
      }
    }

    // Convert empty strings to null for cleaner database storage
    await organization.update({
      logo_url: dto.logo_url === '' ? null : dto.logo_url,
      favicon_url: dto.favicon_url === '' ? null : dto.favicon_url,
    });

    return organization.reload();
  }

  /**
   * Update issuer portal settings
   * Deletes old banner from storage when replaced
   */
  async updatePortalSettings(id: string, dto: UpdatePortalSettingsDto): Promise<OrganizationEntity> {
    const organization = await this.organizationModel.findOne({
      where: { id, is_active: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Delete old banner from storage if being replaced or removed
    if (dto.banner_url !== undefined && organization.banner_url) {
      if (dto.banner_url !== organization.banner_url || dto.banner_url === '') {
        // Old banner is being replaced or removed
        await this.storageService.deleteFileByUrl(organization.banner_url).catch(() => {
          // Silently fail if deletion fails (file might not exist)
        });
      }
    }

    // Convert empty strings to null for cleaner database storage
    await organization.update({
      banner_url: dto.banner_url === '' ? null : dto.banner_url,
      portal_enabled: dto.portal_enabled,
    });

    return organization.reload();
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
  async validateWebsiteDomain(originalOrganizationId: string | null, websiteUrl: string): Promise<void> {
    const domain = extractDomain(websiteUrl);
    if (!domain) {
      throw new BadRequestException('Invalid website URL');
    }

    // Find all organizations and check if any has the same domain
    const organizations = await this.organizationModel.findAll({
      where: { is_active: true, ...(originalOrganizationId && { id: { [Op.ne]: originalOrganizationId } }), website: { [Op.like]: `%${domain}%` } },
      attributes: ['id', 'website'],
    });

    const existingOrg = organizations.find(org => extractDomain(org.website) === domain);
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
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
