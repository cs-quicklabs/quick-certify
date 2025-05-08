import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { BasicCrudService } from '@/common/services';
import { OrganizationModel } from '@/models';
import { CreateOrganizationDto } from './dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationUserService } from './organization-user.service';

// Extended interface that includes the slug property
interface UpdateWithSlug extends UpdateOrganizationDto {
  slug?: string;
}

@Injectable()
export class OrganizationService extends BasicCrudService<OrganizationModel> {
  constructor(
    private readonly organizationUserService: OrganizationUserService
  ) {
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

  async updateOrganization(
    id: string,
    updateOrganizationDto: UpdateOrganizationDto,
    userId: number
  ) {
    // Start a transaction
    const transaction = await this.model.sequelize.transaction();

    try {
      const organization = await OrganizationModel.findByPk(id, {
        transaction,
      });

      if (!organization) {
        throw new NotFoundException(`Organization with ID ${id} not found`);
      }

      // Check if user has permission to update this organization
      const canUpdate =
        await this.organizationUserService.canUserUpdateOrganization(
          userId,
          parseInt(id)
        );
      if (!canUpdate) {
        throw new UnauthorizedException(
          'You do not have permission to update this organization'
        );
      }

      // Create a copy with proper typing to allow slug property
      const updateData: UpdateWithSlug = { ...updateOrganizationDto };

      // If name is being updated, generate a new slug and check for conflicts
      if (
        updateOrganizationDto.name &&
        updateOrganizationDto.name !== organization.name
      ) {
        const slug = this.createOrgSlug(updateOrganizationDto.name);
        const existingOrganization = await this.findBySlug(slug);

        // Only throw if the existing org is different from the current one
        if (existingOrganization && existingOrganization.id.toString() !== id) {
          throw new BadRequestException(
            'Organization with this name already exists'
          );
        }

        // Add slug to update data only if name is changing
        updateData.slug = slug;
      }

      // DTOs are already validated by the ValidationPipe in the controller
      await organization.update(updateData, { transaction });

      // If everything succeeds, commit the transaction
      await transaction.commit();

      return {
        statusCode: 200,
        message: 'Organization updated successfully',
        data: organization,
      };
    } catch (error) {
      // If any error occurs, roll back the transaction
      await transaction.rollback();
      throw error;
    }
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
