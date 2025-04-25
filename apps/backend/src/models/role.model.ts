// role.model.ts
import {
  Column,
  DataType,
  Table,
  HasMany,
  BelongsToMany,
  Scopes,
  Index,
} from 'sequelize-typescript';
import { BaseModelWithSoftDelete } from './base.model';
import { OrganizationUserModel } from './organization-user.model';
import { RolePermissionModel } from './role-permission.model';
import { PermissionModel } from './permission.model';

/**
 * Role model representing user roles within the system
 */
@Scopes(() => ({
  withPermissions: {
    include: [PermissionModel],
  },
}))
@Table({
  tableName: 'roles',
  indexes: [
    {
      fields: ['code'],
      unique: true,
      name: 'idx_roles_code',
    },
  ],
})
export class RoleModel extends BaseModelWithSoftDelete {
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100],
    },
    comment: 'Human-readable role name',
  })
  name: string;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      is: /^[A-Z][A-Z0-9_]*$/, // Must start with uppercase letter, then uppercase, numbers, or underscores
      len: [2, 50],
    },
    comment: 'Machine-readable role identifier',
  })
  @Index('idx_roles_code')
  code: string;

  // Define relationships
  @HasMany(() => OrganizationUserModel)
  organizationUsers: OrganizationUserModel[];

  @BelongsToMany(() => PermissionModel, () => RolePermissionModel)
  permissions: PermissionModel[];

  // Helper methods
  hasPermission(permissionCode: string): Promise<boolean> {
    return this.$get('permissions', {
      where: { code: permissionCode },
    }).then((permissions) => permissions.length > 0);
  }
}
