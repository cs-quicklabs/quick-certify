import { BadRequestException, Injectable } from '@nestjs/common';
import { BasicCrudService } from '@/common/services';
import { UserModel, UserResetTokenModel } from '@/models';
import { RegisterUserDto } from './dto/register-user.dto';
import { OrganizationService } from '../organization/organization.service';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@/config/config.type';
import { EmailService } from '../email/email.service';
import { randomUUID } from 'crypto';
import { addMinutes } from 'date-fns';
import { Op } from 'sequelize';

@Injectable()
export class UserService extends BasicCrudService<UserModel> {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly emailService: EmailService,
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

    this.emailService.welcomeEmail(newUser.email);

    // TODO: send email to the user for verification

    return newUser;
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
    const saltOrRounds = this.configService.get('auth.saltOrRounds', {
      infer: true,
    });

    // Update password and invalidate the token
    await Promise.all([
      user.update({
        password: await bcrypt.hash(newPassword, saltOrRounds),
      }),
      resetToken.update({ isValid: false }),
    ]);
  }
}
