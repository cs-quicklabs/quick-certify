import { PathwayEntity } from '@src/entities';
import { PaginatedResult } from '@src/commons/base';
import { CreatePathwayDto, UpdatePathwayDto } from '../dtos';

export interface PathwayFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * Pathway Service Interface
 * SRP: Single responsibility for pathway management
 */
export interface IPathwayService {
  /**
   * Find all pathways for an organization with pagination
   */
  findAll(
    organizationUuid: string,
    filters?: PathwayFilters,
  ): Promise<PaginatedResult<PathwayEntity>>;

  /**
   * Find a pathway by UUID within an organization
   */
  findByUuid(uuid: string, organizationUuid: string): Promise<PathwayEntity | null>;

  /**
   * Create a new pathway
   */
  create(organizationUuid: string, dto: CreatePathwayDto): Promise<PathwayEntity>;

  /**
   * Update a pathway by UUID
   */
  updateByUuid(
    uuid: string,
    organizationUuid: string,
    dto: UpdatePathwayDto,
  ): Promise<PathwayEntity>;

  /**
   * Soft-delete a pathway by UUID
   */
  deleteByUuid(uuid: string, organizationUuid: string): Promise<boolean>;

  /**
   * Find a pathway or throw NotFoundException
   */
  requirePathway(uuid: string, organizationUuid: string): Promise<PathwayEntity>;

  /**
   * List active pathways for an organization by slug (public, no auth)
   */
  findAllPublic(slug: string, filters?: PathwayFilters): Promise<PaginatedResult<PathwayEntity>>;

  /**
   * Get a single active pathway by UUID under the given org slug (public, no auth)
   */
  findOnePublic(slug: string, pathwayUuid: string): Promise<PathwayEntity | null>;
}
