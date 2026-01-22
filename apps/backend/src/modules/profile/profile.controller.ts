import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { CurrentUser } from '../auth/decorators';
import type { CurrentUser as CurrentUserType } from '../auth/interfaces';
import { SuccessResponse } from '@src/commons/dtos';
import { UpdateProfileDto, UpdateEmailPreferencesDto } from './dto';

/**
 * Profile Controller
 *
 * Handles user profile-related endpoints:
 * - GET /profile/me - Get current user profile
 * - PATCH /profile/me - Update user profile
 * - GET /profile/email-preferences - Get email preferences
 * - PATCH /profile/email-preferences - Update email preferences
 */
@ApiTags('Profile')
@ApiBearerAuth()
@Controller({ path: 'profile', version: '1' })
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Current user information' })
  async getCurrentUser(@CurrentUser() user: CurrentUserType) {
    const fullProfile = await this.profileService.getFullProfile(user.id);
    return new SuccessResponse('User information retrieved', fullProfile);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@CurrentUser() user: CurrentUserType, @Body() dto: UpdateProfileDto) {
    const result = await this.profileService.updateProfile(user.id, dto);
    return new SuccessResponse(result.message, result.user);
  }

  @Get('email-preferences')
  @ApiOperation({ summary: 'Get email preferences' })
  @ApiResponse({ status: 200, description: 'Email preferences retrieved' })
  async getEmailPreferences(@CurrentUser() user: CurrentUserType) {
    const result = await this.profileService.getEmailPreferences(user.id);
    return new SuccessResponse('Email preferences retrieved', result);
  }

  @Patch('email-preferences')
  @ApiOperation({ summary: 'Update email preferences' })
  @ApiResponse({ status: 200, description: 'Email preferences updated successfully' })
  async updateEmailPreferences(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: UpdateEmailPreferencesDto,
  ) {
    const result = await this.profileService.updateEmailPreferences(user.id, dto);
    return new SuccessResponse(result.message, result);
  }
}
