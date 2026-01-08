import { Body, Controller, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { CurrentUser } from '../auth/decorators';
import type { CurrentUser as CurrentUserType } from '../auth/interfaces';
import { SuccessResponse } from '@src/commons/dtos';
import { UpdateProfileDto } from './dto';

@ApiTags('Profile')
@ApiBearerAuth()
@Controller({ path: 'profile', version: '1' })
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Patch()
  @ApiOperation({ summary: 'Update profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(
    @CurrentUser() user: CurrentUserType,
    @Body() dto: UpdateProfileDto,
  ): Promise<SuccessResponse> {
    const updatedProfile = await this.profileService.updateProfile(user.id, dto);
    return new SuccessResponse('Profile updated successfully', updatedProfile);
  }
}
