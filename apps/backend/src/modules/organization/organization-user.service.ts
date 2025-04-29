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
    return this.getAll({ where: { userId } });
  }

  async findAllByOrganization(organizationId: number) {
    return this.getAll({ where: { organizationId } });
  }
}
