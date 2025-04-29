import { BadRequestException, Injectable } from '@nestjs/common';
import { BasicCrudService } from '@/common/services';
import { UserModel } from '@/models';
import { RegisterUserDto } from './dto/register-user.dto';
import { OrganizationService } from '../organization/organization.service';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@/config/config.type';
import { RoleService } from '../role/role.service';
import { RoleEnum } from '@/common/enums';
import { OrganizationUserService } from '../organization/organization-user.service';

@Injectable()
export class UserService extends BasicCrudService<UserModel> {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly roleService: RoleService,
    private readonly orgUserService: OrganizationUserService
  ) {
    super(UserModel);
  }

  async register(registerUserDto: RegisterUserDto) {
    const { organizationName, ...userDetails } = registerUserDto;

    // Check if a user with the same email already exists
    const existingUser = await this.findByEmail(userDetails.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const orgSlug = this.organizationService.createOrgSlug(organizationName);

    // Check if organization with the same name already exists
    const existingOrg = await this.organizationService.findBySlug(orgSlug);
    if (existingOrg) {
      throw new BadRequestException(
        'Organization with this name already exists'
      );
    }

    // Create the organization
    const newOrganization = await this.organizationService.createOrganization({
      name: organizationName,
    });

    // Get the SUPER_ADMIN role
    const superAdminRole = await this.roleService.findByCode(
      RoleEnum.SUPER_ADMIN
    );
    if (!superAdminRole) {
      throw new BadRequestException('Super admin role not found');
    }

    // Save new user details
    const newUser = await this.create(userDetails);

    // Map user to organization and role in OrganizationUserModel
    await this.orgUserService.create({
      userId: newUser.id,
      organizationId: newOrganization.id,
      roleId: superAdminRole.id,
    });

    // TODO: send email to the user for verification

    return this.getOneByPk(newUser.id);
  }

  async findByUUId(uuid: string) {
    return this.getOne({ where: { uuid } });
  }

  async findByEmail(email: string) {
    return this.getOne({ where: { email } });
  }
}
