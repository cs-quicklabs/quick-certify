import { OrganizationEntity } from '@src/entities';
import { FindAllOptions, PaginatedResult } from '@src/commons/base';
import { CreateOrganizationDto, UpdateOrganizationDto } from '../dtos';

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
  findOne(id: string): Promise<OrganizationEntity | null>;

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
  update(id: string, dto: UpdateOrganizationDto): Promise<OrganizationEntity>;

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
  validateWebsiteDomain(originalOrganizationId: string | null, websiteUrl: string): Promise<void>;
}

export const ORGANIZATION_SERVICE = Symbol('IOrganizationService');

