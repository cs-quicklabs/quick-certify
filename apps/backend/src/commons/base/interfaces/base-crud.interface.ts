import { Model, FindOptions, CreateOptions, UpdateOptions, DestroyOptions } from 'sequelize';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface FindAllOptions extends PaginationOptions {
  where?: Record<string, unknown>;
  include?: unknown[];
  attributes?: string[];
}

export interface BaseCrudServiceInterface<T extends Model, CreateDto, UpdateDto> {
  findAll(options?: FindAllOptions): Promise<PaginatedResult<T>>;
  findOne(id: number | string, options?: FindOptions): Promise<T | null>;
  findOneOrFail(id: number | string, options?: FindOptions): Promise<T>;
  findByUuid(uuid: string, options?: FindOptions): Promise<T | null>;
  findByUuidOrFail(uuid: string, options?: FindOptions): Promise<T>;
  create(dto: CreateDto, options?: CreateOptions): Promise<T>;
  update(id: number | string, dto: UpdateDto, options?: UpdateOptions): Promise<T>;
  updateByUuid(uuid: string, dto: UpdateDto, options?: UpdateOptions): Promise<T>;
  delete(id: number | string, options?: DestroyOptions): Promise<boolean>;
  softDelete?(id: number | string): Promise<boolean>;
  restore?(id: number | string): Promise<T>;
  count(where?: Record<string, unknown>): Promise<number>;
  exists(id: number | string): Promise<boolean>;
  existsByUuid(uuid: string): Promise<boolean>;
}
