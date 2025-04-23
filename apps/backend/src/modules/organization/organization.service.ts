import { BadRequestException, Injectable } from '@nestjs/common';
import { BasicCrudService } from '@/common/services';
import { OrganizationModel } from '@/models';
import { CreateOrganizationDto } from './dto';

@Injectable()
export class OrganizationService extends BasicCrudService<OrganizationModel> {
  constructor() {
    super(OrganizationModel);
  }

  async createOrganization(createOrganizationDto: CreateOrganizationDto) {
    const { name } = createOrganizationDto;
    const slug = this.getSlug(name);

    // Check if an organization with the same name already exists
    const existingOrganization = await this.getOne({ where: { slug } });
    if (existingOrganization) {
      throw new BadRequestException(
        'Organization with this name already exists'
      );
    }

    // Create the organization
    const organization = await this.model.create({ name, slug });
    return organization;
  }

  getSlug(name: string) {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-'); // Replace non-alphanumeric characters with hyphens
  }
}
