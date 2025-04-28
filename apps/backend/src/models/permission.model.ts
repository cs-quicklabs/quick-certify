import {
  Column,
  Table,
  DataType,
  BelongsToMany,
  Index,
  Scopes,
} from 'sequelize-typescript';
import { BaseModelWithSoftDelete } from './base.model';
import { RoleModel } from './role.model';
import { RolePermissionModel } from './role-permission.model';

/**
 * Permission model representing system permissions that can be assigned to roles
 */
@Scopes(() => ({
  withRoles: {
    include: [RoleModel],
  },
}))
@Table({
  tableName: 'permissions',
  indexes: [
    {
      fields: ['code'],
      unique: true,
      name: 'idx_permissions_code',
    },
  ],
})
export class PermissionModel extends BaseModelWithSoftDelete {
  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100],
    },
    comment: 'Human-readable permission name',
  })
  name: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      is: /^[A-Z][A-Z0-9_]*$/, // Must start with uppercase letter, then uppercase, numbers, or underscores
      len: [2, 100],
    },
    comment: 'Machine-readable permission identifier',
  })
  @Index('idx_permissions_code')
  code: string;

  @Column({
    type: DataType.STRING(500),
    allowNull: true,
    validate: {
      len: [0, 500],
    },
    comment: 'Detailed description of what this permission allows',
  })
  description: string;

  // Define relationships
  @BelongsToMany(() => RoleModel, () => RolePermissionModel)
  roles: RoleModel[];
}
