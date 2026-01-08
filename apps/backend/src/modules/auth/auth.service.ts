import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { AllConfigType } from '@src/config/config.type';
import { UserEntity, RoleEntity, OrganizationEntity, PasswordResetEntity } from '@src/entities';
import { EmailService } from '@src/commons/services';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dtos';
import { JwtTokens, IAuthService } from './interfaces';
import { PasswordService, TokenService, SessionService } from './services';

/**
 * Auth Service - Orchestrator
 *
 * SRP: This service orchestrates authentication flows by delegating to:
 * - PasswordService: password hashing/validation
 * - TokenService: JWT token generation/validation
 * - SessionService: session management
 * - EmailService: email notifications
 *
 * OCP: New authentication methods can be added without modifying existing code
 * DIP: Depends on abstractions (services) rather than concrete implementations
 */
@Injectable()
export class AuthService implements IAuthService {
  private readonly refreshTokenExpiresIn: number;
  private readonly passwordResetExpiresIn: number;
  private readonly frontendDomain: string;

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly emailService: EmailService,
    @InjectModel(UserEntity)
    private readonly userModel: typeof UserEntity,
    @InjectModel(RoleEntity)
    private readonly roleModel: typeof RoleEntity,
    @InjectModel(OrganizationEntity)
    private readonly organizationModel: typeof OrganizationEntity,
    @InjectModel(PasswordResetEntity)
    private readonly passwordResetModel: typeof PasswordResetEntity,
  ) {
    this.refreshTokenExpiresIn = this.configService.getOrThrow('auth.jwtRefreshTokenExpiresIn', {
      infer: true,
    });
    this.passwordResetExpiresIn = this.configService.getOrThrow('auth.passwordResetExpiresIn', {
      infer: true,
    });
    this.frontendDomain = this.configService.getOrThrow('app.frontendDomain', { infer: true });
  }

  async register(dto: RegisterDto, ipAddress?: string, userAgent?: string) {
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Password and confirm password do not match');
    }

    const existingUser = await this.userModel.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const slug = this.generateSlug(dto.companyName);
    const existingSlug = await this.organizationModel.findOne({ where: { slug } });
    if (existingSlug) {
      throw new ConflictException('Organization with this name already exists');
    }

    const existingOrgName = await this.organizationModel.findOne({ where: { name: dto.companyName } });
    if (existingOrgName) {
      throw new ConflictException('Organization with this name already exists');
    }

    const superAdminRole = await this.roleModel.findOne({
      where: { role: 'super_admin' },
    });

    if (!superAdminRole) {
      throw new NotFoundException('Super Admin role not found. Please ensure roles are seeded.');
    }

    const organization = await this.organizationModel.create({
      name: dto.companyName,
      slug,
      is_active: true,
      issuer_verified: false,
    });

    const hashedPassword = await this.passwordService.hash(dto.password);
    const user = await this.userModel.create({
      first_name: dto.firstName,
      last_name: dto.lastName,
      email: dto.email.toLowerCase(),
      password_hash: hashedPassword,
      auth_provider: 'email',
      organization_id: organization.id,
      role_id: superAdminRole.id,
      status: 'active',
      email_notifications: true,
    });

    this.emailService.sendWelcomeEmail(user.email, { name: user.first_name }).catch(console.error);

    const tokens = await this.createSessionAndTokens(user, ipAddress, userAgent);

    return tokens;
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.userModel.findOne({
      where: { email: dto.email.toLowerCase() },
      include: [RoleEntity, OrganizationEntity],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === 'archived') {
      throw new UnauthorizedException(
        'Your account is deactivated. For more queries reach out to admin.',
      );
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException(
        'Your account is not active yet. Please contact support or your organisation admin to proceed further.',
      );
    }

    if (!user.password_hash) {
      throw new UnauthorizedException('Password authentication not available for this account');
    }

    const isPasswordValid = await this.passwordService.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    await user.update({ last_login_at: new Date() });

    const tokens = await this.createSessionAndTokens(user, ipAddress, userAgent);

    return tokens;
  }

  async refreshToken(refreshToken: string, ipAddress?: string, userAgent?: string) {
    const payload = this.tokenService.verifyToken(refreshToken);

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const session = await this.sessionService.validate(payload.sessionHash, payload.sub);
    if (!session) {
      throw new UnauthorizedException('Invalid or expired session');
    }

    const user = await this.userModel.findByPk(payload.sub, {
      include: [RoleEntity, OrganizationEntity],
    });

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User not found or inactive');
    }

    const tokens = this.tokenService.generateTokens({
      userId: user.id,
      email: user.email,
      organizationId: user.organization_id,
      roleId: user.role_id,
      role: user.role?.role || '',
      sessionHash: session.hash,
    });

    await session.update({
      ip_address: ipAddress || session.ip_address,
      user_agent: userAgent || session.user_agent,
      last_activity_at: new Date(),
    });

    return tokens;
  }

  async logout(sessionHash: string) {
    await this.sessionService.revoke(sessionHash);
    return { success: true };
  }

  async logoutAll(userId: string) {
    await this.sessionService.revokeAllForUser(userId);
    return { success: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      return { success: true, message: 'If the email exists, a reset link has been sent' };
    }

    if (user.status === 'archived') {
      throw new UnauthorizedException(
        'Your account is deactivated. For more queries reach out to admin.',
      );
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException(
        'Your account is not active yet. Please contact support or your organisation admin to proceed further.',
      );
    }

    await this.passwordResetModel.update(
      { is_used: true },
      { where: { user_id: user.id, is_used: false } },
    );

    const resetToken = this.passwordService.generateResetToken();
    await this.passwordResetModel.create({
      user_id: user.id,
      token: resetToken,
      expires_at: new Date(Date.now() + this.passwordResetExpiresIn * 1000),
    });

    const resetLink = `${this.frontendDomain}/reset-password?token=${resetToken}`;
    const expiresInHours = Math.round(this.passwordResetExpiresIn / 3600);

    this.emailService
      .sendPasswordResetEmail(user.email, {
        name: user.first_name,
        resetLink,
        expiresIn: `${expiresInHours} hour${expiresInHours > 1 ? 's' : ''}`,
      })
      .catch(console.error);

    return { success: true, message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const passwordReset = await this.passwordResetModel.findOne({
      where: { token: dto.token, is_used: false },
      include: [UserEntity],
    });

    if (!passwordReset) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (passwordReset.isExpired) {
      await passwordReset.update({ is_used: true });
      throw new BadRequestException('Reset token has expired');
    }

    const user = await this.userModel.findByPk(passwordReset.user_id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status === 'archived') {
      await passwordReset.update({ is_used: true });
      throw new UnauthorizedException(
        'Your account is deactivated. For more queries reach out to admin.',
      );
    }

    if (user.status !== 'active') {
      await passwordReset.update({ is_used: true });
      throw new UnauthorizedException(
        'Your account is not active yet. Please contact support or your organisation admin to proceed further.',
      );
    }

    const hashedPassword = await this.passwordService.hash(dto.newPassword);
    await this.userModel.update(
      { password_hash: hashedPassword },
      { where: { id: passwordReset.user_id } },
    );

    await passwordReset.update({ is_used: true, used_at: new Date() });

    await this.sessionService.revokeAllForUser(passwordReset.user_id);

    return { success: true, message: 'Password reset successfully' };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.password_hash) {
      throw new BadRequestException('Password authentication not available for this account');
    }

    const isPasswordValid = await this.passwordService.compare(dto.currentPassword, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await this.passwordService.hash(dto.newPassword);
    await user.update({ password_hash: hashedPassword });

    return { success: true, message: 'Password changed successfully' };
  }

  async getActiveSessions(userId: string) {
    return this.sessionService.getActiveForUser(userId);
  }

  async revokeSession(userId: string, sessionHash: string) {
    const revoked = await this.sessionService.revokeByHashAndUser(sessionHash, userId);
    if (!revoked) {
      throw new NotFoundException('Session not found');
    }
    return { success: true, message: 'Session revoked successfully' };
  }

  private async createSessionAndTokens(
    user: UserEntity,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<JwtTokens> {
    const session = await this.sessionService.create({
      userId: user.id,
      expiresAt: new Date(Date.now() + this.refreshTokenExpiresIn * 1000),
      ipAddress,
      userAgent,
      deviceType: this.parseDeviceType(userAgent),
    });

    const role = await this.roleModel.findByPk(user.role_id);

    return this.tokenService.generateTokens({
      userId: user.id,
      email: user.email,
      organizationId: user.organization_id,
      roleId: user.role_id,
      role: role?.role || '',
      sessionHash: session.hash,
    });
  }

  private parseDeviceType(userAgent?: string): string | undefined {
    if (!userAgent) return undefined;

    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return 'mobile';
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return 'tablet';
    }
    return 'desktop';
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
