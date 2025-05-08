import { Injectable } from '@nestjs/common';
import { BasicCrudService } from '@/common/services/basic-crud.service';
import { OrganizationUserModel } from '@/models/organization-user.model';
import { RoleModel } from '@/models/role.model';
import { PermissionEnum, RoleEnum } from '@/common/enums';

@Injectable()
export class OrganizationUserService extends BasicCrudService<OrganizationUserModel> {
  constructor() {
    super(OrganizationUserModel);
  }

  // You can add custom methods here as needed, for example:
  async findByUserAndOrg(userId: number, organizationId: number) {
    return this.getOne({ where: { userId, organizationId } });
  }

  async findAllByUser(userId: number) {
    return this.getAll({
      where: { userId },
      include: ['organization', 'role'],
    });
  }

  async findAllByOrganization(organizationId: number) {
    return this.getAll({ where: { organizationId } });
  }

  /**
   * Checks if a user can update an organization by verifying they have the Super Admin role
   * and the EDIT_ORGANIZATION_DETAILS permission
   */
  async canUserUpdateOrganization(
    userId: number,
    organizationId: number
  ): Promise<boolean> {
    // Get the organization-user record with role included
    const orgUser = await this.getOne({
      where: { userId, organizationId },
      include: [
        {
          model: RoleModel,
          as: 'role',
        },
      ],
    });

    if (!orgUser) {
      return false;
    }

    // Check if user is Super Admin
    const isSuperAdmin = orgUser.role.code === RoleEnum.SUPER_ADMIN;

    // Check if user has the required permission
    const hasEditPermission = await orgUser.hasPermission(
      PermissionEnum.EDIT_ORGANIZATION_DETAILS
    );

    return isSuperAdmin && hasEditPermission;
  }

  private transformOrganizationUser(orgUser: OrganizationUserModel) {
    return {
      id: orgUser.organization.id,
      name: orgUser.organization.name,
      slug: orgUser.organization.slug,
      websiteUrl: orgUser.organization.websiteUrl,
      linkedInUrl: orgUser.organization.linkedInUrl,
      linkedInCompanyId: orgUser.organization.linkedInCompanyId,
      facebookUrl: orgUser.organization.facebookUrl,
      twitterUrl: orgUser.organization.twitterUrl,
      isVerified: orgUser.organization.isVerified,
      description: orgUser.organization.description,
      supportEmail: orgUser.organization.supportEmail,
      slogan: orgUser.organization.slogan,
      issuerLogo: orgUser.organization.issuerLogo,
      favIcon: orgUser.organization.favIcon,
      bannerImage: orgUser.organization.bannerImage,
      isEnabledIssuerPortal: orgUser.organization.isEnabledIssuerPortal,
    };
  }

  async getOrganizationsByUserId(userId: number) {
    const orgUsers = await this.findAllByUser(userId);

    if (!orgUsers || orgUsers.length === 0) {
      return null;
    }

    return orgUsers.map((orgUser) => this.transformOrganizationUser(orgUser));
  }
}
