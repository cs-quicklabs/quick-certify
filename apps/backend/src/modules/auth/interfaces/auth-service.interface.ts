import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from '../dtos';
import { JwtTokens } from './jwt-payload.interface';
import { SessionEntity } from '@src/entities';

/**
 * Auth Service Interface
 * SRP: Single responsibility for authentication orchestration
 */
export interface IAuthService {
  /**
   * Register a new user
   */
  register(
    dto: RegisterDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ accessToken: string; refreshToken: string; accessTokenExpiresAt: Date; refreshTokenExpiresAt: Date }>;

  /**
   * Login a user
   */
  login(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ accessToken: string; refreshToken: string; accessTokenExpiresAt: Date; refreshTokenExpiresAt: Date }>;

  /**
   * Refresh access token using refresh token
   */
  refreshToken(refreshToken: string, ipAddress?: string, userAgent?: string): Promise<JwtTokens>;

  /**
   * Logout a user session
   */
  logout(sessionHash: string): Promise<{ success: boolean }>;

  /**
   * Logout all user sessions
   */
  logoutAll(userId: string): Promise<{ success: boolean }>;

  /**
   * Request password reset
   */
  forgotPassword(dto: ForgotPasswordDto): Promise<{ success: boolean; message: string }>;

  /**
   * Reset password using token
   */
  resetPassword(dto: ResetPasswordDto): Promise<{ success: boolean; message: string }>;

  /**
   * Change password for authenticated user
   */
  changePassword(userId: string, dto: ChangePasswordDto): Promise<{ success: boolean; message: string }>;

  /**
   * Get active sessions for a user
   */
  getActiveSessions(userId: string): Promise<SessionEntity[]>;

  /**
   * Revoke a specific session
   */
  revokeSession(userId: string, sessionHash: string): Promise<{ success: boolean; message: string }>;
}

export const AUTH_SERVICE = Symbol('IAuthService');

