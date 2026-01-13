import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Patch,
  Post,
  Query,
  Res,
  Headers,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@src/config/config.type';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  GoogleLoginDto,
  GoogleSignupCompleteDto,
  GoogleAuthInitDto,
  GoogleCallbackDto,
  GoogleAuthAction,
  AcceptInvitationDto,
} from './dtos';
import { Public, CurrentUser } from './decorators';
import * as AuthInterfaces from './interfaces';
import { SuccessResponse } from '@src/commons/dtos';

@ApiTags('Authentication')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  private readonly frontendDomain: string;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {
    this.frontendDomain = this.configService.getOrThrow('app.frontendDomain', { infer: true });
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  async register(
    @Body() dto: RegisterDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.authService.register(dto, ipAddress, userAgent);
    return new SuccessResponse('Registration successful', result);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() dto: LoginDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.authService.login(dto, ipAddress, userAgent);
    return new SuccessResponse('Login successful', result);
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(
    @Body() dto: RefreshTokenDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.authService.refreshToken(dto.refreshToken, ipAddress, userAgent);
    return new SuccessResponse('Token refreshed successfully', result);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout current session' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@CurrentUser() user: AuthInterfaces.CurrentUser) {
    const result = await this.authService.logout(user.sessionHash);
    return new SuccessResponse('Logged out successfully', result);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout all sessions' })
  @ApiResponse({ status: 200, description: 'All sessions logged out' })
  async logoutAll(@CurrentUser() user: AuthInterfaces.CurrentUser) {
    const result = await this.authService.logoutAll(user.id);
    return new SuccessResponse('All sessions logged out successfully', result);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 200, description: 'Reset email sent if email exists' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    const result = await this.authService.forgotPassword(dto);
    return new SuccessResponse(result.message, result);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset password with token' })
  @ApiResponse({ status: 200, description: 'Password reset successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    const result = await this.authService.resetPassword(dto);
    return new SuccessResponse(result.message, result);
  }

  @Public()
  @Post('accept-invitation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept invitation and set password' })
  @ApiResponse({ status: 200, description: 'Invitation accepted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid invitation token' })
  async acceptInvitation(
    @Body() dto: AcceptInvitationDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.authService.acceptInvitation(dto, ipAddress, userAgent);
    return new SuccessResponse('Invitation accepted successfully', result);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Change password for authenticated user' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Current password is incorrect' })
  async changePassword(
    @CurrentUser() user: AuthInterfaces.CurrentUser,
    @Body() dto: ChangePasswordDto,
  ) {
    const result = await this.authService.changePassword(user.id, dto);
    return new SuccessResponse(result.message, result);
  }

  @Get('sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all active sessions' })
  @ApiResponse({ status: 200, description: 'Active sessions list' })
  async getSessions(@CurrentUser() user: AuthInterfaces.CurrentUser) {
    const sessions = await this.authService.getActiveSessions(user.id);
    return new SuccessResponse('Active sessions retrieved', sessions);
  }

  @Delete('sessions/:sessionHash')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke a specific session by hash' })
  @ApiResponse({ status: 200, description: 'Session revoked' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async revokeSession(
    @CurrentUser() user: AuthInterfaces.CurrentUser,
    @Param('sessionHash') sessionHash: string,
  ) {
    const result = await this.authService.revokeSession(user.id, sessionHash);
    return new SuccessResponse(result.message, result);
  }


  // ============================================
  // Google OAuth Routes - ID Token Flow
  // ============================================

  @Public()
  @Post('google/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with Google OAuth (ID Token Flow)' })
  @ApiResponse({ status: 200, description: 'Google login successful' })
  @ApiResponse({ status: 401, description: 'Invalid Google token or account not found' })
  async googleLogin(
    @Body() dto: GoogleLoginDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.authService.googleLogin(dto, ipAddress, userAgent);
    return new SuccessResponse('Google login successful', result);
  }

  @Public()
  @Post('google/signup/complete')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Complete Google signup with organization details' })
  @ApiResponse({ status: 201, description: 'Google signup completed successfully' })
  @ApiResponse({ status: 409, description: 'Email or organization already exists' })
  async completeGoogleSignup(
    @Body() dto: GoogleSignupCompleteDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.authService.completeGoogleSignup(dto, ipAddress, userAgent);
    return new SuccessResponse('Google signup completed successfully', result);
  }

  // ============================================
  // Google OAuth Routes - Authorization Code Flow
  // ============================================

  @Public()
  @Get('google/status')
  @ApiOperation({ summary: 'Check if Google OAuth is configured' })
  @ApiResponse({ status: 200, description: 'Returns Google OAuth status' })
  getGoogleOAuthStatus() {
    return new SuccessResponse('Google OAuth status', {
      configured: this.authService.isGoogleOAuthConfigured(),
    });
  }

  @Public()
  @Post('google/init')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Initiate Google OAuth flow (Authorization Code Flow)' })
  @ApiResponse({ status: 200, description: 'Returns authorization URL' })
  initiateGoogleAuth(@Body() dto: GoogleAuthInitDto) {
    const action = dto.action === GoogleAuthAction.SIGNUP ? 'signup' : 'login';
    const result = this.authService.initiateGoogleAuth(action, dto.redirectUrl);
    return new SuccessResponse('Google OAuth URL generated', result);
  }

  @Public()
  @Get('google/redirect')
  @ApiOperation({ summary: 'Redirect to Google OAuth (Authorization Code Flow)' })
  @ApiQuery({ name: 'action', enum: GoogleAuthAction, required: false })
  @ApiQuery({ name: 'redirectUrl', required: false })
  @ApiResponse({ status: 302, description: 'Redirects to Google' })
  redirectToGoogle(
    @Query('action') action: GoogleAuthAction = GoogleAuthAction.LOGIN,
    @Query('redirectUrl') redirectUrl: string | undefined,
    @Res() res: Response,
  ) {
    const authAction = action === GoogleAuthAction.SIGNUP ? 'signup' : 'login';
    const { url } = this.authService.initiateGoogleAuth(authAction, redirectUrl);
    res.redirect(url);
  }

  @Public()
  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback handler (Authorization Code Flow)' })
  @ApiResponse({ status: 302, description: 'Redirects to frontend with tokens or temp token' })
  @ApiResponse({ status: 401, description: 'Invalid state or code' })
  async handleGoogleCallback(
    @Query() query: GoogleCallbackDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
    @Res() res: Response,
  ) {
    try {
      const result = await this.authService.handleGoogleCallback(
        query.code,
        query.state,
        ipAddress,
        userAgent,
      );

      // Build redirect URL with appropriate parameters
      let redirectUrl = result.redirectUrl || this.frontendDomain;

      if (result.tokens) {
        // Successful login - redirect with tokens
        const params = new URLSearchParams({
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
          expiresAt: result.tokens.accessTokenExpiresAt.toISOString(),
        });
        redirectUrl = `${redirectUrl}?${params.toString()}`;
      } else if (result.requiresSignup && result.tempToken) {
        // New user - redirect to complete signup with temp token
        const signupUrl = `${this.frontendDomain}/signup/complete`;
        const params = new URLSearchParams({
          tempToken: result.tempToken,
        });
        redirectUrl = `${signupUrl}?${params.toString()}`;
      }

      res.redirect(redirectUrl);
    } catch (error) {
      // Redirect to frontend with error
      const errorUrl = `${this.frontendDomain}/auth/error`;
      const params = new URLSearchParams({
        error: error instanceof Error ? error.message : 'Authentication failed',
      });
      res.redirect(`${errorUrl}?${params.toString()}`);
    }
  }

  @Public()
  @Post('google/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Google OAuth callback handler (POST - for API clients)' })
  @ApiResponse({ status: 200, description: 'Returns tokens or temp token' })
  @ApiResponse({ status: 401, description: 'Invalid state or code' })
  async handleGoogleCallbackPost(
    @Body() dto: GoogleCallbackDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const result = await this.authService.handleGoogleCallback(
      dto.code,
      dto.state,
      ipAddress,
      userAgent,
    );

    if (result.tokens) {
      return new SuccessResponse('Google authentication successful', {
        action: result.action,
        tokens: result.tokens,
      });
    }

    return new SuccessResponse('Additional information required', {
      action: result.action,
      tempToken: result.tempToken,
      requiresSignup: result.requiresSignup,
    });
  }
}
