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
    const { name, websiteUrl } = createOrganizationDto;
    const slug = this.createOrgSlug(name);

    // Check if an organization with the same name already exists
    const existingOrganization = await this.findBySlug(slug);
    if (existingOrganization) {
      throw new BadRequestException(
        'Organization with this name already exists'
      );
    }

    // Create the organization
    const organization = await this.model.create({ name, slug, websiteUrl });
    return organization;
  }

  async findBySlug(slug: string) {
    return this.getOne({ where: { slug } });
  }

  createOrgSlug(name: string) {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-'); // Replace non-alphanumeric characters with hyphens
  }
}
