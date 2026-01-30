import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@src/config/config.type';
import { UserEntity, SessionEntity, OrganizationEntity, RoleEntity } from '@src/entities';
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
import {
  PasswordService,
  TokenService,
  SessionService,
  GoogleOAuthService,
  GoogleUserInfo,
  PasswordResetService,
} from './services';
import { OrganizationService } from '../organization/organization.service';
import { UserService } from '../user/user.service';
import { RoleService } from '../role/role.service';
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
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly organizationService: OrganizationService,
    private readonly passwordResetService: PasswordResetService,
    @InjectModel(SessionEntity)
    private readonly sessionModel: typeof SessionEntity,
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

    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Validate organization creation data (name, slug, website)
    await this.organizationService.validateOrganizationCreation(dto.companyName, dto.websiteUrl);

    const superAdminRole = await this.getSuperAdminRole();
    const slug = this.organizationService.generateSlug(dto.companyName);

    // Use transaction to ensure atomicity of organization and user creation
    if (!this.sessionModel.sequelize) {
      throw new Error('Sequelize instance not available');
    }

    const sequelize = this.sessionModel.sequelize;
    const transaction = await sequelize.transaction();
    let transactionCommitted = false;

    try {
      const organization = await this.organizationService.create(
        {
          name: dto.companyName,
          slug,
          website: dto.websiteUrl,
          is_active: true,
          issuer_verified: false,
        },
        { transaction },
      );

      const user = await this.userService.create(
        {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          password: dto.password,
          organizationId: organization.id,
          roleId: superAdminRole.id,
        },
        undefined, // currentUser
        { transaction },
      );

      await transaction.commit();
      transactionCommitted = true;

      this.emailService
        .sendWelcomeEmail(user.email, { name: user.first_name })
        .catch(console.error);

      const tokens = await this.createSessionAndTokens(user, ipAddress, userAgent);

      return tokens;
    } catch (error) {
      if (!transactionCommitted) {
        await transaction.rollback();
      }
      throw error;
    }
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.userService.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Validate user status (extracted to avoid duplication)
    this.userService.validateUserStatusForAuth(user);

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

    const user = await this.userService.findByUuid(payload.sub, {
      include: [
        {
          model: OrganizationEntity,
          as: 'organization',
        },
        {
          model: RoleEntity,
          as: 'role',
        },
      ],
    });

    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('User not found or inactive');
    }

    const tokens = this.tokenService.generateTokens({
      userUuid: user.uuid,
      userId: user.id,
      email: user.email,
      organizationId: user.organization_id,
      organizationUuid: user.organization.uuid,
      roleId: user.role_id,
      roleUuid: user.role.uuid,
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

  async logoutAll(userUuid: string) {
    await this.sessionService.revokeAllForUser(userUuid);
    return { success: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userService.findByEmail(dto.email);

    if (!user) {
      return { success: true, message: 'If the email exists, a reset link has been sent' };
    }

    // Validate user status (extracted to avoid duplication)
    this.userService.validateUserStatusForPasswordReset(user);

    await this.passwordResetService.invalidateAllForUser(user.id); // user.id is now number

    const resetToken = this.passwordService.generateResetToken();
    await this.passwordResetService.create(
      user.uuid, // Use UUID instead of ID
      resetToken,
      new Date(Date.now() + this.passwordResetExpiresIn * 1000),
    );

    const resetLink = `${this.frontendDomain}/reset-password?token=${resetToken}`;
    const expiresInHours = Math.round(this.passwordResetExpiresIn / 3600);
    const expiresInMinutes = Math.round(this.passwordResetExpiresIn / 60);

    const expiresIn =
      this.passwordResetExpiresIn > 60
        ? `${expiresInMinutes} minute${expiresInMinutes > 1 ? 's' : ''}`
        : `${expiresInHours} hour${expiresInHours > 1 ? 's' : ''}`;

    this.emailService
      .sendPasswordResetEmail(user.email, {
        name: user.first_name,
        resetLink,
        expiresIn,
      })
      .catch(console.error);

    return { success: true, message: 'If the email exists, a reset link has been sent' };
  }

  async checkForgotPasswordToken(token: string) {
    return this.passwordResetService.validateToken(token);
  }

  async resetPassword(dto: ResetPasswordDto) {
    const passwordReset = await this.checkForgotPasswordToken(dto.token);

    const user = await this.userService.findOne(passwordReset.user_id);
    if (!user) {
      await this.passwordResetService.markAsUsed(passwordReset.id);
      throw new NotFoundException('User not found');
    }

    if (user.status === 'archived') {
      await this.passwordResetService.markAsUsed(passwordReset.id);
      throw new UnauthorizedException(
        'Your account is deactivated. For more queries reach out to admin.',
      );
    }

    if (user.status !== 'active') {
      await this.passwordResetService.markAsUsed(passwordReset.id);
      throw new UnauthorizedException(
        'Your account is not active yet. Please contact support or your organisation admin to proceed further.',
      );
    }

    // Use transaction to ensure atomicity of password update, token marking, and session revocation
    if (!this.sessionModel.sequelize) {
      throw new Error('Sequelize instance not available');
    }
    const sequelize = this.sessionModel.sequelize;
    const transaction = await sequelize.transaction();
    try {
      // Password will be hashed by userService.update()
      await this.userService.update(
        passwordReset.user_id,
        {
          password: dto.newPassword,
        },
        { transaction },
      );

      await this.passwordResetService.markAsUsed(passwordReset.id, transaction);

      // Convert user ID to UUID for revokeAllForUser
      const user = await this.userService.findOne(passwordReset.user_id);
      if (user) {
        await this.sessionService.revokeAllForUser(user.uuid, transaction);
      }

      await transaction.commit();

      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  async changePassword(userUuid: string, dto: ChangePasswordDto) {
    const user = await this.userService.findByUuid(userUuid, {
      attributes: { include: ['password_hash'] },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.password_hash) {
      throw new BadRequestException('Password authentication not available for this account');
    }

    const isPasswordValid = await this.passwordService.compare(
      dto.currentPassword,
      user.password_hash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Check if new password is same as old password
    const isSameAsOldPassword = await this.passwordService.compare(
      dto.newPassword,
      user.password_hash,
    );
    if (isSameAsOldPassword) {
      throw new BadRequestException("New password shouldn't be same as old password");
    }

    // If revokeAllSessions is true, use transaction to ensure atomicity
    if (dto.revokeAllSessions) {
      if (!this.sessionModel.sequelize) {
        throw new Error('Sequelize instance not available');
      }
      const sequelize = this.sessionModel.sequelize;
      const transaction = await sequelize.transaction();
      try {
        // Password will be hashed by userService.update()
        await this.userService.update(
          user.id, // Use number ID
          {
            password: dto.newPassword,
          },
          { transaction },
        );

        // Revoke all sessions for security (password changed)
        await this.sessionService.revokeAllForUser(user.uuid, transaction);

        await transaction.commit();
        return {
          success: true,
          message: 'Password changed successfully. All sessions have been revoked.',
          sessionsRevoked: true,
        };
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } else {
      // No session revocation needed, just update password
      // Password will be hashed by userService.update()
      await this.userService.update(user.id, {
        password: dto.newPassword,
      });

      return {
        success: true,
        message: 'Password changed successfully',
        sessionsRevoked: false,
      };
    }
  }

  async acceptInvitation(dto: AcceptInvitationDto, ipAddress?: string, userAgent?: string) {
    // Find user by token (token is the user's UUID)
    const user = await this.userService.findByUuid(dto.token);
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
      throw new BadRequestException(
        'This invitation has expired. Please contact your administrator for a new invitation.',
      );
    }

    // Password will be hashed by userService.update()
    await this.userService.update(user.id, {
      password: dto.password,
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

  async getActiveSessions(userUuid: string) {
    const user = await this.userService.findByUuid(userUuid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.sessionService.getActiveForUser(user.id);
  }

  async revokeSession(userUuid: string, sessionHash: string) {
    const user = await this.userService.findByUuid(userUuid);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const revoked = await this.sessionService.revokeByHashAndUser(sessionHash, user.id);
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
  initiateGoogleAuth(
    action: 'login' | 'signup',
    redirectUrl?: string,
  ): { url: string; state: string } {
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
    const existingUser = await this.userService.findByEmail(googleUser.email);

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
  async googleLogin(
    dto: GoogleLoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<JwtTokens> {
    const googleUser = await this.googleOAuthService.verifyIdToken(dto.idToken);

    const user = await this.userService.findByEmail(googleUser.email);

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
        throw new UnauthorizedException(
          'Invalid or expired temporary token. Please restart the signup process.',
        );
      }
      googleUser = tempData;
    } else {
      throw new BadRequestException('Either idToken or tempToken is required');
    }

    // Check if user already exists
    const existingUser = await this.userService.findByEmail(googleUser.email);

    if (existingUser) {
      // User exists, try to login instead
      // Validate user status (extracted to avoid duplication)
      this.userService.validateUserStatusForPasswordReset(existingUser);

      // Link Google account if not already linked
      if (!existingUser.google_id) {
        await this.userService.update(existingUser.id, {
          google_id: googleUser.id,
          auth_provider: existingUser.password_hash ? 'both' : 'google',
        });
      }

      return this.createSessionAndTokens(existingUser, ipAddress, userAgent);
    }

    // Validate organization creation data (name, slug, website)
    await this.organizationService.validateOrganizationCreation(dto.companyName, dto.websiteUrl);

    const superAdminRole = await this.getSuperAdminRole();
    const slug = this.organizationService.generateSlug(dto.companyName);

    // Use transaction to ensure atomicity of organization and user creation
    if (!this.sessionModel.sequelize) {
      throw new Error('Sequelize instance not available');
    }
    const sequelize = this.sessionModel.sequelize;
    const transaction = await sequelize.transaction();
    try {
      // Create organization
      const organization = await this.organizationService.create(
        {
          name: dto.companyName,
          slug,
          website: dto.websiteUrl,
          is_active: true,
          issuer_verified: false,
        },
        { transaction },
      );

      // Create user with Google auth
      // Use provided names from form, fallback to Google profile names
      const user = await this.userService.create(
        {
          firstName: dto.firstName || googleUser.given_name,
          lastName: dto.lastName || googleUser.family_name || '',
          email: googleUser.email,
          organizationId: organization.id,
          roleId: superAdminRole.id,
          google_id: googleUser.id,
          auth_provider: 'google',
        },
        undefined, // currentUser
        { transaction },
      );

      await transaction.commit();

      this.emailService
        .sendWelcomeEmail(user.email, { name: user.first_name })
        .catch(console.error);

      const tokens = await this.createSessionAndTokens(user, ipAddress, userAgent);

      return tokens;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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
    // Update last login time (user.id is now number)
    await this.userService.update(user.id, { last_login_at: new Date() });

    // Revoke all existing sessions for this user (single active session policy)
    // await this.sessionService.revokeAllForUser(user.id);

    const session = await this.sessionService.create({
      userId: user.id,
      expiresAt: new Date(Date.now() + this.refreshTokenExpiresIn * 1000),
      ipAddress,
      userAgent,
      deviceType: this.parseDeviceType(userAgent),
    });

    // Load organization and role to get their UUIDs for JWT payload
    const [organization, role] = await Promise.all([
      this.organizationService.findOne(user.organization_id),
      this.roleService.findOne(user.role_id),
    ]);

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return this.tokenService.generateTokens({
      userUuid: user.uuid,
      userId: user.id,
      email: user.email,
      organizationId: organization.id,
      organizationUuid: organization.uuid,
      roleId: role.id,
      roleUuid: role.uuid,
      role: role.role || '',
      sessionHash: session.hash,
    });
  }

  private async processGoogleLogin(
    user: UserEntity,
    googleUser: GoogleUserInfo,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<JwtTokens> {
    // Validate user status (extracted to avoid duplication)
    this.userService.validateUserStatusForPasswordReset(user);

    // Handle account linking
    if (user.auth_provider === 'email' && !user.google_id) {
      // User signed up with email, now trying Google login
      // Link Google account to existing email account
      await this.userService.update(user.id, {
        google_id: googleUser.id,
        auth_provider: 'both', // Support both auth methods
      });
    } else if (user.auth_provider === 'google' && user.google_id !== googleUser.id) {
      throw new UnauthorizedException('Google account mismatch');
    } else if (!user.google_id) {
      // First time Google login, update google_id
      await this.userService.update(user.id, {
        google_id: googleUser.id,
        auth_provider: user.password_hash ? 'both' : 'google',
      });
    }

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

  /**
   * Get Super Admin role - extracted to avoid duplication
   * @throws NotFoundException if Super Admin role not found
   */
  private async getSuperAdminRole() {
    const superAdminRole = await this.roleService.findByRole('super_admin');
    if (!superAdminRole) {
      throw new NotFoundException('Super Admin role not found. Please ensure roles are seeded.');
    }
    return superAdminRole;
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
