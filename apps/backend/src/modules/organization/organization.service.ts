import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { FindAllOptions, PaginatedResult } from '@src/commons/base';
import { OrganizationEntity } from '@src/entities';
import {
  CreateOrganizationDto,
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
  ) {}

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

  async create(dto: CreateOrganizationDto): Promise<OrganizationEntity> {
    const slug = dto.slug || this.generateSlug(dto.name);

    const existingSlug = await this.organizationModel.findOne({ where: { slug } });
    if (existingSlug) {
      throw new ConflictException('Organization with this slug already exists');
    }

    const existingName = await this.organizationModel.findOne({ where: { name: dto.name } });
    if (existingName) {
      throw new ConflictException('Organization with this name already exists');
    }

    const organization = await this.organizationModel.create({
      name: dto.name,
      slug,
      is_active: dto.is_active !== undefined ? dto.is_active : true,
      issuer_verified: dto.issuer_verified !== undefined ? dto.issuer_verified : false,
    });

    return organization;
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
        description: dto.description,
        support_email: dto.support_email,
        slogan: dto.slogan,
        linkedin_company_id: dto.linkedin_company_id,
      });
    } else {
      await organization.update({
        description: dto.description,
        support_email: dto.support_email,
        slogan: dto.slogan,
        linkedin_company_id: dto.linkedin_company_id,
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

    await organization.update({
      linkedin_url: dto.linkedin_url,
      facebook_url: dto.facebook_url,
      twitter_url: dto.twitter_url,
      website: dto.website,
    });

    return organization.reload();
  }

  /**
   * Update organization branding
   */
  async updateBranding(id: string, dto: UpdateBrandingDto): Promise<OrganizationEntity> {
    const organization = await this.organizationModel.findOne({
      where: { id, is_active: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    await organization.update({
      logo_url: dto.logo_url,
      favicon_url: dto.favicon_url,
    });

    return organization.reload();
  }

  /**
   * Update issuer portal settings
   */
  async updatePortalSettings(id: string, dto: UpdatePortalSettingsDto): Promise<OrganizationEntity> {
    const organization = await this.organizationModel.findOne({
      where: { id, is_active: true },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    await organization.update({
      banner_url: dto.banner_url,
      portal_enabled: dto.portal_enabled,
    });

    return organization.reload();
  }

  /**
   * Generate URL-friendly slug from organization name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
