import { BadRequestException, Injectable } from '@nestjs/common';
import { BasicCrudService } from '@/common/services';
import { UserModel, UserResetTokenModel } from '@/models';
import { RegisterUserDto } from './dto/register-user.dto';
import { OrganizationService } from '../organization/organization.service';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@/config/config.type';
import { RoleService } from '../role/role.service';
import { RoleEnum } from '@/common/enums';
import { OrganizationUserService } from '../organization/organization-user.service';
import { EmailService } from '../email/email.service';
import { randomUUID } from 'crypto';
import { addMinutes } from 'date-fns';
import { Op } from 'sequelize';

@Injectable()
export class UserService extends BasicCrudService<UserModel> {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly roleService: RoleService,
    private readonly orgUserService: OrganizationUserService,
    private readonly emailService: EmailService
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

    // send welcome email
    this.emailService.welcomeEmail(newUser.email);

    return this.getOneByPk(newUser.id);
  }

  async findByUUId(uuid: string) {
    return this.getOne({ where: { uuid } });
  }

  async findByEmail(email: string) {
    return this.getOne({ where: { email } });
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists or not
      return;
    }

    // Generate reset token hash
    const hash = randomUUID();

    const expiryAt = addMinutes(new Date(), 10); // 10 minutes from now

    // Invalidate all previous reset tokens for this user
    await UserResetTokenModel.update(
      { isValid: false },
      { where: { userId: user.id, isValid: true } }
    );

    // Create new reset token
    await UserResetTokenModel.create({
      userId: user.id,
      hash,
      expiryAt,
      isValid: true,
    });

    // Send reset email with token containing hash and expiry time
    const token = `${hash}.${expiryAt.getTime()}`;
    await this.emailService.forgetPasswordEmail(email, token);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const [hash, expiryTime] = token.split('.');
    const expiryAt = new Date(parseInt(expiryTime, 10));

    // Check if token has expired
    if (expiryAt < new Date()) {
      throw new BadRequestException('Password reset link has expired');
    }

    // Find valid reset token
    const resetToken = await UserResetTokenModel.findOne({
      where: {
        hash,
        isValid: true,
        expiryAt: {
          [Op.gt]: new Date(),
        },
      },
      include: [UserModel],
    });

    if (!resetToken) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const user = resetToken.user;

    // Update password and invalidate the token
    await Promise.all([
      user.update({ password: newPassword }),
      resetToken.update({ isValid: false }),
    ]);
  }
}
