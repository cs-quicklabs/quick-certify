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
import { UserEntity, UserTypeEntity, OrganizationEntity, PasswordResetEntity } from '@src/entities';
import { EmailService } from '@src/commons/services';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dtos';
import { JwtTokens } from './interfaces';
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
export class AuthService {
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
    @InjectModel(UserTypeEntity)
    private readonly userTypeModel: typeof UserTypeEntity,
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
    // Validate email uniqueness
    const existingUser = await this.userModel.findOne({
      where: { email: dto.email.toLowerCase(), deleted_at: null },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Validate organization
    const organization = await this.organizationModel.findByPk(dto.organizationId);
    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Resolve user type
    const userTypeId = await this.resolveUserType(dto.userTypeId);

    // Create user with hashed password
    const hashedPassword = await this.passwordService.hash(dto.password);
    const user = await this.userModel.create({
      first_name: dto.firstName,
      last_name: dto.lastName,
      email: dto.email.toLowerCase(),
      phone: dto.phone || null,
      password: hashedPassword,
      organization_id: dto.organizationId,
      user_type_id: userTypeId,
    });

    // Send welcome email (fire and forget)
    this.emailService.sendWelcomeEmail(user.email, { name: user.first_name }).catch(console.error);

    // Create session and generate tokens
    const tokens = await this.createSessionAndTokens(user, ipAddress, userAgent);

    // Fetch user with relations
    const userWithRelations = await this.userModel.findByPk(user.id, {
      include: [UserTypeEntity, OrganizationEntity],
      attributes: { exclude: ['password'] },
    });

    return { user: userWithRelations, ...tokens };
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.userModel.findOne({
      where: { email: dto.email.toLowerCase(), deleted_at: null },
      include: [UserTypeEntity, OrganizationEntity],
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await this.passwordService.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokens = await this.createSessionAndTokens(user, ipAddress, userAgent);

    const userResponse = user.toJSON() as Record<string, unknown>;
    delete userResponse.password;

    return { user: userResponse, ...tokens };
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
      include: [UserTypeEntity],
    });

    if (!user || user.deleted_at) {
      throw new UnauthorizedException('User not found');
    }

    // Generate new tokens with same session hash
    const tokens = this.tokenService.generateTokens({
      userId: user.id,
      userUuid: user.uuid,
      email: user.email,
      organizationId: user.organization_id,
      userTypeCode: user.user_type?.code || '',
      sessionHash: session.hash,
    });

    // Update session metadata
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

  async logoutAll(userId: number) {
    await this.sessionService.revokeAllForUser(userId);
    return { success: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({
      where: { email: dto.email.toLowerCase(), deleted_at: null },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return { success: true, message: 'If the email exists, a reset link has been sent' };
    }

    // Invalidate existing tokens
    await this.passwordResetModel.update(
      { is_used: true },
      { where: { user_id: user.id, is_used: false } },
    );

    // Create new reset token
    const resetToken = this.passwordService.generateResetToken();
    await this.passwordResetModel.create({
      user_id: user.id,
      token: resetToken,
      expires_at: new Date(Date.now() + this.passwordResetExpiresIn * 1000),
    });

    // Send reset email
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

    // Update password
    const hashedPassword = await this.passwordService.hash(dto.newPassword);
    await this.userModel.update(
      { password: hashedPassword },
      { where: { id: passwordReset.user_id } },
    );

    // Mark token as used
    await passwordReset.update({ is_used: true, used_at: new Date() });

    // Revoke all sessions for security
    await this.sessionService.revokeAllForUser(passwordReset.user_id);

    return { success: true, message: 'Password reset successfully' };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.userModel.findByPk(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await this.passwordService.compare(dto.currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await this.passwordService.hash(dto.newPassword);
    await user.update({ password: hashedPassword });

    return { success: true, message: 'Password changed successfully' };
  }

  async getActiveSessions(userId: number) {
    return this.sessionService.getActiveForUser(userId);
  }

  async revokeSession(userId: number, sessionHash: string) {
    const revoked = await this.sessionService.revokeByHashAndUser(sessionHash, userId);
    if (!revoked) {
      throw new NotFoundException('Session not found');
    }
    return { success: true, message: 'Session revoked successfully' };
  }

  // Private helper methods

  private async resolveUserType(userTypeId?: number): Promise<number> {
    if (userTypeId) {
      return userTypeId;
    }

    const defaultUserType = await this.userTypeModel.findOne({
      where: { code: 'USER', is_active: true },
    });

    if (!defaultUserType) {
      throw new NotFoundException('Default user type not found');
    }

    return defaultUserType.id;
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

    return this.tokenService.generateTokens({
      userId: user.id,
      userUuid: user.uuid,
      email: user.email,
      organizationId: user.organization_id,
      userTypeCode: user.user_type?.code || '',
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
}
