import { UserModel } from './user.model';
import { OrganizationModel } from './organization.model';
import { SessionModel } from './session.model';
import { OrganizationUserModel } from './organization-user.model';
import { RoleModel } from './role.model';
import { PermissionModel } from './permission.model';
import { RolePermissionModel } from './role-permission.model';

/**
 * Export all models for Sequelize initialization
 */
export const Models = [
  SessionModel,
  UserModel,
  OrganizationModel,
  RoleModel,
  PermissionModel,
  RolePermissionModel,
  OrganizationUserModel,
];

export {
  SessionModel,
  UserModel,
  OrganizationModel,
  OrganizationUserModel,
  RoleModel,
  PermissionModel,
  RolePermissionModel,
};
