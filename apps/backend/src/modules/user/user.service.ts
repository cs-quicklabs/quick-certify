import { BadRequestException, Injectable } from '@nestjs/common';
import { BasicCrudService } from '@/common/services';
import { UserModel } from '@/models';
import { RegisterUserDto } from './dto/register-user.dto';
import { OrganizationService } from '../organization/organization.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@/config/config.type';

@Injectable()
export class UserService extends BasicCrudService<UserModel> {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly configService: ConfigService<AllConfigType>
  ) {
    super(UserModel);
  }

  async register(registerUserDto: RegisterUserDto) {
    const { organizationName, password, ...userDetails } = registerUserDto;

    // Check if a user with the same email already exists
    const existingUser = await this.findByEmail(userDetails.email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Create the organization
    const newOrganization = await this.organizationService.createOrganization({
      name: organizationName,
    });

    const saltOrRounds = this.configService.get('auth.saltOrRounds', {
      infer: true,
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltOrRounds);

    // Save the user details with the new organization ID
    const newUser = await this.create({
      ...userDetails,
      password: hashedPassword,
      organizationId: newOrganization.id,
    });

    // TODO: send email to the user for verification

    return newUser;
  }

  async findByUUId(uuid: string) {
    return this.getOne({ where: { uuid } });
  }

  async findByEmail(email: string) {
    return this.getOne({ where: { email } });
  }
}
