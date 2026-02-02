import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Post,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  AcceptInvitationDto,
  CheckForgotPasswordTokenDto,
} from './dtos';
import { Public, CurrentUser } from './decorators';
import * as AuthInterfaces from './interfaces';
import { SuccessResponse } from '@src/commons/dtos';

@ApiTags('Authentication')
@Controller({ path: 'auth', version: '1' })
@ApiBearerAuth()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  @ApiOperation({ summary: 'Logout current session' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@CurrentUser() user: AuthInterfaces.CurrentUser) {
    const result = await this.authService.logout(user.sessionHash);
    return new SuccessResponse('Logged out successfully', result);
  }

  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout all sessions' })
  @ApiResponse({ status: 200, description: 'All sessions logged out' })
  async logoutAll(@CurrentUser() user: AuthInterfaces.CurrentUser) {
    const result = await this.authService.logoutAll(user.uuid);
    return new SuccessResponse('All sessions logged out successfully', result);
  }

  @Public()
  @Post('check-forgot-password-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Check if forgot password token is valid' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 400, description: 'Token is invalid' })
  async checkForgotPasswordToken(@Body() dto: CheckForgotPasswordTokenDto) {
    await this.authService.checkForgotPasswordToken(dto.token);
    return new SuccessResponse('Token is valid', { token: dto.token });
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
  @ApiOperation({ summary: 'Change password for authenticated user' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 401, description: 'Current password is incorrect' })
  async changePassword(
    @CurrentUser() user: AuthInterfaces.CurrentUser,
    @Body() dto: ChangePasswordDto,
  ) {
    const result = await this.authService.changePassword(user.uuid, dto);
    return new SuccessResponse(result.message, result);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get all active sessions' })
  @ApiResponse({ status: 200, description: 'Active sessions list' })
  async getSessions(@CurrentUser() user: AuthInterfaces.CurrentUser) {
    const sessions = await this.authService.getActiveSessions(user.uuid);
    return new SuccessResponse('Active sessions retrieved', sessions);
  }

  @Delete('sessions/:sessionHash')
  @ApiOperation({ summary: 'Revoke a specific session by hash' })
  @ApiResponse({ status: 200, description: 'Session revoked' })
  @ApiResponse({ status: 404, description: 'Session not found' })
  async revokeSession(
    @CurrentUser() user: AuthInterfaces.CurrentUser,
    @Param('sessionHash') sessionHash: string,
  ) {
    const result = await this.authService.revokeSession(user.uuid, sessionHash);
    return new SuccessResponse(result.message, result);
  }
}
