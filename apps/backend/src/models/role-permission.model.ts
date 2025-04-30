import {
  Column,
  Table,
  DataType,
  ForeignKey,
  BelongsTo,
  Index,
} from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { RoleModel } from './role.model';
import { PermissionModel } from './permission.model';

/**
 * Mapping table connecting roles to permissions (many-to-many)
 * Uses BaseModel without soft delete support
 */
@Table({
  tableName: 'role_permissions',
  indexes: [
    {
      unique: true,
      fields: ['role_id', 'permission_id'],
      name: 'idx_role_permissions_composite',
    },
  ],
})
export class RolePermissionModel extends BaseModel {
  @ForeignKey(() => RoleModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Foreign key to roles table',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @Index('idx_role_permissions_role_id')
  roleId: number;

  @ForeignKey(() => PermissionModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Foreign key to permissions table',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @Index('idx_role_permissions_permission_id')
  permissionId: number;

  // Define relationships
  @BelongsTo(() => RoleModel)
  role: RoleModel;

  @BelongsTo(() => PermissionModel)
  permission: PermissionModel;
}
