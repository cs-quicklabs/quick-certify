import { OrganizationEntity } from '@src/entities';
import { FindAllOptions, PaginatedResult } from '@src/commons/base';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../dtos';
import type { CurrentUser as CurrentUserType } from '@src/modules/auth/interfaces';

/**
 * Organization Service Interface
 * SRP: Single responsibility for organization management
 */
export interface IOrganizationService {
  /**
   * Find all organizations with pagination
   */
  findAll(options?: FindAllOptions): Promise<PaginatedResult<OrganizationEntity>>;

  /**
   * Find organization by ID
   */
  findOne(id: number): Promise<OrganizationEntity | null>;

  /**
   * Find organization by UUID
   */
  findByUuid(uuid: string): Promise<OrganizationEntity | null>;

  /**
   * Find organization by UUID or throw NotFoundException
   */
  findByUuidOrFail(uuid: string): Promise<OrganizationEntity>;

  /**
   * Find organization by slug
   */
  findBySlug(slug: string): Promise<OrganizationEntity | null>;

  /**
   * Create a new organization
   */
  create(dto: CreateOrganizationDto): Promise<OrganizationEntity>;

  /**
   * Update an organization
   */
  update(id: number, dto: UpdateOrganizationDto): Promise<OrganizationEntity>;

  /**
   * Update an organization by UUID
   */
  updateByUuid(uuid: string, dto: UpdateOrganizationDto): Promise<OrganizationEntity>;

  /**
   * Search organizations by query
   */
  searchOrganizations(
    searchQuery: string,
    options?: FindAllOptions,
  ): Promise<PaginatedResult<OrganizationEntity>>;

  /**
   * Validate organization creation data (name, slug, website)
   * @throws ConflictException if name or slug already exists
   * @throws BadRequestException if website domain is invalid or already in use
   */
  validateOrganizationCreation(name: string, websiteUrl?: string | null): Promise<void>;

  /**
   * Generate a URL-friendly slug from an organization name
   */
  generateSlug(name: string): string;

  /**
   * Validate if a website domain is already in use
   */
  validateWebsiteDomain(originalOrganizationId: number | null, websiteUrl: string): Promise<void>;

  /**
   * Permanently delete an organization
   * Only accessible by SYSTEM_ADMIN role
   */
  permanentlyDelete(uuid: string, currentUser: CurrentUserType): Promise<boolean>;
}

export const ORGANIZATION_SERVICE = Symbol('IOrganizationService');
