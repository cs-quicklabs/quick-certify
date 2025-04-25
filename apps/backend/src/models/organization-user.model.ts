import {
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  Table,
  Index,
  Scopes,
} from 'sequelize-typescript';
import { BaseModel } from './base.model';
import { OrganizationModel } from './organization.model';
import { UserModel } from './user.model';
import { RoleModel } from './role.model';
import { PermissionModel } from './permission.model';

/**
 * Mapping table connecting users to organizations with roles
 * Uses BaseModel without soft delete support
 */
@Scopes(() => ({
  withUser: {
    include: [UserModel],
  },
  withOrganization: {
    include: [OrganizationModel],
  },
  withRole: {
    include: [RoleModel],
  },
  withAll: {
    include: [UserModel, OrganizationModel, RoleModel],
  },
}))
@Table({
  tableName: 'organization_users',
  indexes: [
    {
      fields: ['organization_id', 'user_id'],
      unique: true,
      name: 'idx_org_user_composite',
    },
    {
      fields: ['user_id'],
      name: 'idx_org_user_user_id',
    },
    {
      fields: ['organization_id'],
      name: 'idx_org_user_org_id',
    },
    {
      fields: ['role_id'],
      name: 'idx_org_user_role_id',
    },
  ],
})
export class OrganizationUserModel extends BaseModel {
  @ForeignKey(() => OrganizationModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Foreign key to organizations table',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @Index('idx_org_user_org_id')
  organizationId: number;

  @ForeignKey(() => UserModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment: 'Foreign key to users table',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @Index('idx_org_user_user_id')
  userId: number;

  @ForeignKey(() => RoleModel)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    comment:
      'Foreign key to roles table defining user permissions in this organization',
    onDelete: 'RESTRICT', // Don't allow role deletion if users have this role
    onUpdate: 'CASCADE',
  })
  @Index('idx_org_user_role_id')
  roleId: number;

  // Define relationships
  @BelongsTo(() => OrganizationModel)
  organization: OrganizationModel;

  @BelongsTo(() => UserModel)
  user: UserModel;

  @BelongsTo(() => RoleModel)
  role: RoleModel;

  // Helper methods
  async hasPermission(permissionCode: string): Promise<boolean> {
    const role = await this.$get('role', {
      include: [
        {
          model: PermissionModel,
          where: { code: permissionCode },
          required: false,
        },
      ],
    });

    return role?.permissions?.length > 0;
  }
}
