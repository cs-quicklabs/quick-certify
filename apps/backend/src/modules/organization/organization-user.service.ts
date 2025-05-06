import { Injectable } from '@nestjs/common';
import { BasicCrudService } from '@/common/services/basic-crud.service';
import { OrganizationUserModel } from '@/models/organization-user.model';

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

  private transformOrganizationUser(orgUser: OrganizationUserModel) {
    return {
      id: orgUser.organization.id,
      name: orgUser.organization.name,
      slug: orgUser.organization.slug,
      websiteUrl: orgUser.organization.websiteUrl,
      linkedInUrl: orgUser.organization.linkedInUrl,
      facebookUrl: orgUser.organization.facebookUrl,
      twitterUrl: orgUser.organization.twitterUrl,
      role: {
        id: orgUser.role.id,
        name: orgUser.role.name,
        code: orgUser.role.code,
      },
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
