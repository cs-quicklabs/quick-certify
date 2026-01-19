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
import { generateNanoid } from '@src/commons/utils';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  GoogleLoginDto,
  GoogleSignupCompleteDto,
  AcceptInvitationDto,
} from './dtos';
import { JwtTokens, IAuthService } from './interfaces';
import { PasswordService, TokenService, SessionService, GoogleOAuthService, GoogleUserInfo } from './services';

/**
 * Temporary Google user data stored during signup flow
 */
interface TempGoogleUserData {
  googleUser: GoogleUserInfo;
  timestamp: number;
}

/**
 * Auth Service - Orchestrator
 *
 * SRP: This service orchestrates authentication flows by delegating to:
 * - PasswordService: password hashing/validation
 * - TokenService: JWT token generation/validation
 * - SessionService: session management
 * - EmailService: email notifications
 * - GoogleOAuthService: Google OAuth operations
 *
 * OCP: New authentication methods can be added without modifying existing code
 * DIP: Depends on abstractions (services) rather than concrete implementations
 */
@Injectable()
export class AuthService implements IAuthService {
  private readonly refreshTokenExpiresIn: number;
  private readonly passwordResetExpiresIn: number;
  private readonly invitationExpiresIn: number;
  private readonly frontendDomain: string;

  // Temporary store for Google user data during signup flow
  // In production, use Redis for scalability
  private readonly tempGoogleUserStore = new Map<string, TempGoogleUserData>();
  private readonly TEMP_TOKEN_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

  constructor(
    private readonly configService: ConfigService<AllConfigType>,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly sessionService: SessionService,
    private readonly emailService: EmailService,
    private readonly googleOAuthService: GoogleOAuthService,
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
    this.invitationExpiresIn = this.configService.getOrThrow('auth.invitationExpiresIn', {
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
      is_email_notifications_enabled: true,
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

    if (user.status === 'archived' || user.status === 'inactive') {
      throw new UnauthorizedException('Your account is deactivated. Please connect with your admin.');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException(
        'Your account is not active yet. Please contact support or your organisation admin to proceed further.',
      );
    }

    // Handle mixed auth providers
    if (user.auth_provider === 'google' && !user.password_hash) {
      throw new UnauthorizedException(
        'This account uses Google authentication. Please sign in with Google.',
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
    const expiresInMinutes = Math.round(this.passwordResetExpiresIn / 60);

    const expiresIn = this.passwordResetExpiresIn > 60 ? `${expiresInMinutes} minute${expiresInMinutes > 1 ? 's' : ''}` : `${expiresInHours} hour${expiresInHours > 1 ? 's' : ''}`;

    this.emailService
      .sendPasswordResetEmail(user.email, {
        name: user.first_name,
        resetLink,
        expiresIn,
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

    // Check if new password is same as old password
    const isSameAsOldPassword = await this.passwordService.compare(dto.newPassword, user.password_hash);
    if (isSameAsOldPassword) {
      throw new BadRequestException("New password shouldn't be same as old password");
    }

    const hashedPassword = await this.passwordService.hash(dto.newPassword);
    await user.update({ password_hash: hashedPassword });

    return { success: true, message: 'Password changed successfully' };
  }

  async acceptInvitation(dto: AcceptInvitationDto, ipAddress?: string, userAgent?: string) {
    // Find user by token (token is the user's ID)
    const user = await this.userModel.findByPk(dto.token, {
      include: [RoleEntity],
    });
    if (!user) {
      throw new NotFoundException('Invalid invitation token');
    }

    // Verify user is in invited status
    if (user.status !== 'invited') {
      if (user.status === 'archived') {
        throw new UnauthorizedException('Your account has been deactivated');
      }
      throw new BadRequestException('This invitation has already been accepted or is invalid');
    }

    // Check if invitation has expired based on created_at timestamp
    const invitationAge = Math.floor((Date.now() - user.createdAt.getTime()) / 1000); // in seconds
    if (invitationAge > this.invitationExpiresIn) {
      throw new BadRequestException('This invitation has expired. Please contact your administrator for a new invitation.');
    }

    // Hash and set password
    const hashedPassword = await this.passwordService.hash(dto.password);
    await user.update({
      password_hash: hashedPassword,
      status: 'active',
    });

    // Create session and return tokens using helper method
    const tokens = await this.createSessionAndTokens(user, ipAddress, userAgent);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenExpiresAt: tokens.accessTokenExpiresAt,
      refreshTokenExpiresAt: tokens.refreshTokenExpiresAt,
    };
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

  // ============================================
  // Google OAuth Methods
  // ============================================

  /**
   * Initiate Google OAuth flow (Authorization Code Flow)
   * Returns URL to redirect user to Google
   */
  initiateGoogleAuth(action: 'login' | 'signup', redirectUrl?: string): { url: string; state: string } {
    return this.googleOAuthService.generateAuthUrl(action, redirectUrl);
  }

  /**
   * Handle Google OAuth callback (Authorization Code Flow)
   * Exchanges code for tokens and processes user
   */
  async handleGoogleCallback(
    code: string,
    state: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{
    action: 'login' | 'signup';
    tokens?: JwtTokens;
    tempToken?: string;
    redirectUrl?: string;
    requiresSignup?: boolean;
  }> {
    // Validate state for CSRF protection
    const stateData = this.googleOAuthService.validateState(state);
    if (!stateData) {
      throw new UnauthorizedException('Invalid or expired state parameter');
    }

    // Exchange code for Google user info
    const googleUser = await this.googleOAuthService.exchangeCodeForTokens(code);

    // Check if user exists
    const existingUser = await this.userModel.findOne({
      where: { email: googleUser.email.toLowerCase() },
      include: [RoleEntity, OrganizationEntity],
    });

    // If user exists, log them in (regardless of login or signup action)
    if (existingUser) {
      return {
        action: stateData.action,
        tokens: await this.processGoogleLogin(existingUser, googleUser, ipAddress, userAgent),
        redirectUrl: stateData.redirectUrl,
      };
    }

    // New user - redirect to signup completion to collect organization details
    // This handles both "Sign in with Google" and "Sign up with Google" for new users
    const tempToken = this.createTempGoogleToken(googleUser);
    return {
      action: 'signup',
      tempToken,
      requiresSignup: true,
      redirectUrl: stateData.redirectUrl,
    };
  }

  /**
   * Google OAuth Login (ID Token Flow)
   * Handles login for existing users who signed up with Google
   */
  async googleLogin(dto: GoogleLoginDto, ipAddress?: string, userAgent?: string): Promise<JwtTokens> {
    const googleUser = await this.googleOAuthService.verifyIdToken(dto.idToken);

    const user = await this.userModel.findOne({
      where: { email: googleUser.email.toLowerCase() },
      include: [RoleEntity, OrganizationEntity],
    });

    if (!user) {
      throw new UnauthorizedException(
        'No account found with this Google email. Please sign up first.',
      );
    }

    return this.processGoogleLogin(user, googleUser, ipAddress, userAgent);
  }

  /**
   * Complete Google Signup (Both flows)
   * Creates organization and user after Google OAuth authentication
   */
  async completeGoogleSignup(
    dto: GoogleSignupCompleteDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<JwtTokens> {
    let googleUser: GoogleUserInfo;

    // Determine which flow is being used
    if (dto.idToken) {
      // ID Token flow - verify the token
      googleUser = await this.googleOAuthService.verifyIdToken(dto.idToken);
    } else if (dto.tempToken) {
      // Authorization Code flow - retrieve stored user data
      const tempData = this.getTempGoogleUser(dto.tempToken);
      if (!tempData) {
        throw new UnauthorizedException('Invalid or expired temporary token. Please restart the signup process.');
      }
      googleUser = tempData;
    } else {
      throw new BadRequestException('Either idToken or tempToken is required');
    }

    // Check if user already exists
    const existingUser = await this.userModel.findOne({
      where: { email: googleUser.email.toLowerCase() },
    });

    if (existingUser) {
      // User exists, try to login instead
      if (existingUser.status === 'archived') {
        throw new UnauthorizedException(
          'Your account is deactivated. For more queries reach out to admin.',
        );
      }

      if (existingUser.status !== 'active') {
        throw new UnauthorizedException(
          'Your account is not active yet. Please contact support or your organisation admin to proceed further.',
        );
      }

      // Link Google account if not already linked
      if (!existingUser.google_id) {
        await existingUser.update({
          google_id: googleUser.id,
          auth_provider: existingUser.password_hash ? 'both' : 'google',
        });
      }

      await existingUser.update({ last_login_at: new Date() });
      return this.createSessionAndTokens(existingUser, ipAddress, userAgent);
    }

    // Validate organization name uniqueness
    const slug = this.generateSlug(dto.companyName);
    const existingSlug = await this.organizationModel.findOne({ where: { slug } });
    if (existingSlug) {
      throw new ConflictException('Organization with this name already exists');
    }

    const existingOrgName = await this.organizationModel.findOne({ where: { name: dto.companyName } });
    if (existingOrgName) {
      throw new ConflictException('Organization with this name already exists');
    }

    // Get Super Admin role
    const superAdminRole = await this.roleModel.findOne({
      where: { role: 'super_admin' },
    });

    if (!superAdminRole) {
      throw new NotFoundException('Super Admin role not found. Please ensure roles are seeded.');
    }

    // Create organization
    const organization = await this.organizationModel.create({
      name: dto.companyName,
      slug,
      website: dto.websiteUrl,
      is_active: true,
      issuer_verified: false,
    });

    // Create user with Google auth
    // Use provided names from form, fallback to Google profile names
    const user = await this.userModel.create({
      first_name: dto.firstName || googleUser.given_name,
      last_name: dto.lastName || googleUser.family_name || null,
      email: googleUser.email.toLowerCase(),
      password_hash: null, // No password for Google auth
      auth_provider: 'google',
      google_id: googleUser.id,
      organization_id: organization.id,
      role_id: superAdminRole.id,
      status: 'active',
      is_email_notifications_enabled: true,
    });

    this.emailService.sendWelcomeEmail(user.email, { name: user.first_name }).catch(console.error);

    const tokens = await this.createSessionAndTokens(user, ipAddress, userAgent);

    return tokens;
  }

  /**
   * Check if Google OAuth is configured
   */
  isGoogleOAuthConfigured(): boolean {
    return this.googleOAuthService.isConfigured();
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  private async createSessionAndTokens(
    user: UserEntity,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<JwtTokens> {
    // Revoke all existing sessions for this user (single active session policy)
    await this.sessionService.revokeAllForUser(user.id);

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

  private async processGoogleLogin(
    user: UserEntity,
    googleUser: GoogleUserInfo,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<JwtTokens> {
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

    // Handle account linking
    if (user.auth_provider === 'email' && !user.google_id) {
      // User signed up with email, now trying Google login
      // Link Google account to existing email account
      await user.update({
        google_id: googleUser.id,
        auth_provider: 'both', // Support both auth methods
      });
    } else if (user.auth_provider === 'google' && user.google_id !== googleUser.id) {
      throw new UnauthorizedException('Google account mismatch');
    } else if (!user.google_id) {
      // First time Google login, update google_id
      await user.update({
        google_id: googleUser.id,
        auth_provider: user.password_hash ? 'both' : 'google',
      });
    }

    await user.update({ last_login_at: new Date() });

    return this.createSessionAndTokens(user, ipAddress, userAgent);
  }


  private createTempGoogleToken(googleUser: GoogleUserInfo): string {
    const tempToken = `temp_${generateNanoid()}`;
    this.tempGoogleUserStore.set(tempToken, {
      googleUser,
      timestamp: Date.now(),
    });

    // Clean up expired tokens
    this.cleanExpiredTempTokens();

    return tempToken;
  }

  private getTempGoogleUser(tempToken: string): GoogleUserInfo | null {
    const data = this.tempGoogleUserStore.get(tempToken);

    if (!data) {
      return null;
    }

    // Check expiry
    if (Date.now() - data.timestamp > this.TEMP_TOKEN_EXPIRY_MS) {
      this.tempGoogleUserStore.delete(tempToken);
      return null;
    }

    // Remove used token (one-time use)
    this.tempGoogleUserStore.delete(tempToken);
    return data.googleUser;
  }

  private cleanExpiredTempTokens(): void {
    const now = Date.now();
    for (const [key, value] of this.tempGoogleUserStore.entries()) {
      if (now - value.timestamp > this.TEMP_TOKEN_EXPIRY_MS) {
        this.tempGoogleUserStore.delete(key);
      }
    }
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
