import { UserModel } from './user.model';
import { OrganizationModel } from './organization.model';
import { SessionModel } from './session.model';
import { OrganizationUserModel } from './organization-user.model';
import { RoleModel } from './role.model';
import { PermissionModel } from './permission.model';
import { RolePermissionModel } from './role-permission.model';
import { UserResetTokenModel } from './user-reset-token.model';

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
  UserResetTokenModel
];

export {
  SessionModel,
  UserModel,
  OrganizationModel,
  OrganizationUserModel,
  RoleModel,
  PermissionModel,
  RolePermissionModel,
  UserResetTokenModel
};