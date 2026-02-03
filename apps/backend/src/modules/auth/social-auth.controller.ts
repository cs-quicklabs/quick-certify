import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Query,
  Res,
  Headers,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AllConfigType } from '@src/config/config.type';
import { AuthService } from './auth.service';
import {
  GoogleLoginDto,
  GoogleSignupCompleteDto,
  GoogleAuthInitDto,
  GoogleCallbackDto,
  GoogleAuthAction,
} from './dtos';
import { CurrentUser, Public } from './decorators';
import { SuccessResponse } from '@src/commons/dtos';
import type { CurrentUser as CurrentUserType } from './interfaces';

@ApiTags('Social Authentication')
@Controller({ path: 'auth', version: '1' })
export class SocialAuthController {
  private readonly frontendDomain: string;

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {
    this.frontendDomain = this.configService.getOrThrow('app.frontendDomain', { infer: true });
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

  @Post('google/disconnect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Disconnect Google account from user' })
  @ApiResponse({ status: 200, description: 'Google account disconnected successfully' })
  @ApiResponse({ status: 401, description: 'Invalid Google token or account not found' })
  async disconnectGoogle(@CurrentUser() currentUser: CurrentUserType) {
    await this.authService.disconnectGoogle(currentUser.uuid);
    return new SuccessResponse('Google account disconnected & reset link shared successfully');
  }
}
