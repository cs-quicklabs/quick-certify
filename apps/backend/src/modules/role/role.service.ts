import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RoleEntity } from '@src/entities/role.entity';
import { FindOptions } from 'sequelize';
import { t } from '@src/i18n/i18n.config';

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
  ) { }

  async findAll(options: FindOptions<RoleEntity> = {}): Promise<RoleEntity[] | Partial<RoleEntity>[]> {
    return this.roleModel.findAll(options);
  }

  async findOne(options: FindOptions<RoleEntity> = {}): Promise<RoleEntity | Partial<RoleEntity> | null> {
    return this.roleModel.findOne(options);
  }

  async ValidateRole(roleId: number): Promise<RoleEntity> {
    const role = await this.roleModel.findOne({ where: { id: roleId, is_active: true } });
    if (!role) {
      throw new BadRequestException(t('role.notFoundOrInactive'));
    }
    return role;
  }
}

