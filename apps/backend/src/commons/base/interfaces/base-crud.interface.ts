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
  findOne(id: number, options?: FindOptions): Promise<T | null>;
  findByUuid(uuid: string, options?: FindOptions): Promise<T | null>;
  create(dto: CreateDto, options?: CreateOptions): Promise<T>;
  update(id: number, dto: UpdateDto, options?: UpdateOptions): Promise<T>;
  delete(id: number, options?: DestroyOptions): Promise<boolean>;
  softDelete?(id: number): Promise<boolean>;
  restore?(id: number): Promise<T>;
  count(where?: Record<string, unknown>): Promise<number>;
  exists(id: number): Promise<boolean>;
}
