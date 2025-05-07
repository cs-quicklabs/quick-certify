import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserModel, SessionModel, UserResetTokenModel } from '@/models';
import { UserService } from '@/modules/user/user.service';
import { LoginDto, RegisterUserDto } from './dto';
import Helpers from '@/utils/helper';
import { SessionService } from '@/modules/session/session.service';
import { AllConfigType } from '@/config/config.type';
import ms from 'ms';
import { OrganizationService } from '../organization/organization.service';
import { RoleService } from '../role/role.service';
import { RoleEnum } from '@/common/enums';
import { OrganizationUserService } from '../organization/organization-user.service';
import { EmailService } from '../email/email.service';
import { randomUUID } from 'crypto';
import { addMinutes } from 'date-fns';
import { Op } from 'sequelize';

@Injectable()
export class AuthService {
  private accessTokenSecret: string;
  private accessTokenExpiresIn: string;

  private refreshTokenSecret: string;
  private refreshTokenExpiresIn: string;
  private refreshTokenRememberMeExpiresIn: string;

  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<AllConfigType>,
    private readonly sessionService: SessionService,
    private readonly organizationService: OrganizationService,
    private readonly roleService: RoleService,
    private readonly orgUserService: OrganizationUserService,
    private readonly emailService: EmailService
  ) {
    this.accessTokenSecret = this.configService.get('auth.accessTokenSecret', {
      infer: true,
    });
    this.accessTokenExpiresIn = this.configService.get(
      'auth.accessTokenExpires',
      { infer: true }
    );

    this.refreshTokenSecret = this.configService.get(
      'auth.refreshTokenSecret',
      {
        infer: true,
      }
    );
    this.refreshTokenExpiresIn = this.configService.get(
      'auth.refreshTokenExpires',
      { infer: true }
    );
    this.refreshTokenRememberMeExpiresIn = this.configService.get(
      'auth.refreshTokenRememberMeExpires',
      { infer: true }
    );
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const hash = Helpers.generateRandomHash();
    const refreshTokenExpiresIn = loginDto.rememberMe
      ? this.refreshTokenRememberMeExpiresIn
      : this.refreshTokenExpiresIn;
    const session = await this.sessionService.create({
      userId: user.id,
      hash,
      expiresAt: new Date(Date.now() + ms(refreshTokenExpiresIn)),
    });
    session.user = user;

    const accessToken = await this.generateAccessToken(session);
    const refreshToken = await this.generateRefreshToken(
      session,
      loginDto.rememberMe
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async logout(token: string): Promise<void> {
    const session = await this.jwtService.decode(token);
    if (session) {
      const data = await this.sessionService.getOneByPk(session.sessionId);
      if (data) {
        await data.destroy();
      }
    }
  }

  async validateUser(email: string, password: string): Promise<UserModel> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new ForbiddenException('User is not active');
    }

    return user;
  }

  generateRefreshToken(session: SessionModel, rememberMe: boolean) {
    const payload = {
      sessionId: session.id,
      hash: session.hash,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.refreshTokenSecret,
      expiresIn: rememberMe
        ? this.refreshTokenRememberMeExpiresIn
        : this.refreshTokenExpiresIn,
    });
  }

  generateAccessToken(session: SessionModel) {
    const user = session.user;

    const payload = {
      id: user.id,
      sessionId: session.id,
      email: user.email,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.accessTokenSecret,
      expiresIn: this.accessTokenExpiresIn,
    });
  }

  async register(registerUserDto: RegisterUserDto) {
    const { organizationName, organizationWebsite, ...userDetails } =
      registerUserDto;

    // Check if a user with the same email already exists
    const existingUser = await this.usersService.findByEmail(userDetails.email);
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
      websiteUrl: organizationWebsite,
    });

    // Get the SUPER_ADMIN role
    const superAdminRole = await this.roleService.findByCode(
      RoleEnum.SUPER_ADMIN
    );
    if (!superAdminRole) {
      throw new BadRequestException('Super admin role not found');
    }

    // Save new user details
    const newUser = await this.usersService.create(userDetails);

    // Map user to organization and role in OrganizationUserModel
    await this.orgUserService.create({
      userId: newUser.id,
      organizationId: newOrganization.id,
      roleId: superAdminRole.id,
    });

    // send welcome email
    this.emailService.welcomeEmail(newUser.email);

    return this.usersService.getOneByPk(newUser.id);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.usersService.findByEmail(email);
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
