import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { FindAllOptions, PaginatedResult } from '@src/commons/base';
import { RoleEntity } from '@src/entities/role.entity';
import { Role, SYSTEM_ROLES } from './enums';

/**
 * Role Service
 *
 * SRP: Manages user roles
 * Note: Roles are simple - just id and role name
 */
@Injectable()
export class RoleService {
  constructor(
    @InjectModel(RoleEntity)
    private readonly roleModel: typeof RoleEntity,
  ) {}

  async findAll(options: FindAllOptions = {}): Promise<PaginatedResult<RoleEntity>> {
    const { page = 1, limit = 10, sortBy = 'role', sortOrder = 'ASC', where = {} } = options;

    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * safeLimit;

    const { count, rows } = await this.roleModel.findAndCountAll({
      where,
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

  async findOne(id: number): Promise<RoleEntity | null> {
    return this.roleModel.findByPk(id);
  }

  async findByUuid(uuid: string): Promise<RoleEntity | null> {
    return this.roleModel.findOne({ where: { uuid } });
  }

  async findByRole(role: Role | string): Promise<RoleEntity | null> {
    const roleName = typeof role === 'string' ? role.toLowerCase() : role;
    return this.roleModel.findOne({
      where: { role: roleName },
    });
  }

  async create(dto: Partial<RoleEntity>): Promise<RoleEntity> {
    // Check for duplicate role
    const existingRole = await this.roleModel.findOne({
      where: { role: dto.role },
    });

    if (existingRole) {
      throw new ConflictException(`Role "${dto.role}" already exists`);
    }

    return this.roleModel.create({
      role: dto.role,
    });
  }

  async update(id: number, dto: Partial<RoleEntity>): Promise<RoleEntity> {
    const role = await this.requireById(id);

    if (dto.role !== undefined) {
      // Check for duplicate role (excluding current)
      const existingRole = await this.roleModel.findOne({
        where: { role: dto.role, id: { [Op.ne]: id } },
      });

      if (existingRole) {
        throw new ConflictException(`Role "${dto.role}" already exists`);
      }

      await role.update({ role: dto.role });
    }

    return role;
  }

  async updateByUuid(uuid: string, dto: Partial<RoleEntity>): Promise<RoleEntity> {
    const role = await this.findByUuidOrFail(uuid);
    return this.update(role.id, dto);
  }

  async delete(id: number): Promise<boolean> {
    const role = await this.requireById(id);

    // Check if it's a system role
    if (this.isSystemRole(role.role)) {
      throw new ConflictException('Cannot delete system roles');
    }

    await role.destroy();
    return true;
  }

  async deleteByUuid(uuid: string): Promise<boolean> {
    const role = await this.findByUuidOrFail(uuid);
    return this.delete(role.id);
  }

  async searchRoles(
    searchQuery: string,
    options: FindAllOptions = {},
  ): Promise<PaginatedResult<RoleEntity>> {
    const searchCondition = {
      role: { [Op.iLike]: `%${searchQuery}%` },
    };

    return this.findAll({
      ...options,
      where: {
        ...options.where,
        ...searchCondition,
      },
    });
  }

  // Private helper methods

  private async requireById(id: number): Promise<RoleEntity> {
    const role = await this.roleModel.findByPk(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  private async findByUuidOrFail(uuid: string): Promise<RoleEntity> {
    const role = await this.findByUuid(uuid);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  private isSystemRole(role: string): boolean {
    return SYSTEM_ROLES.includes(role as Role);
  }
}
