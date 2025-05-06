import { Controller, Get, Param, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { OrganizationUserService } from './organization-user.service';
import { ApiResponse as ApiResponseDto } from '@/common/dto';

@ApiTags('Organization')
@Controller({
  path: 'organization',
  version: '1',
})
export class OrganizationController {
  constructor(
    private readonly organizationService: OrganizationService,
    private readonly organizationUserService: OrganizationUserService
  ) {}

  @Get('/:userId')
  @ApiOperation({ summary: 'Get organizations by user ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Organizations retrieved successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found',
    type: ApiResponseDto,
  })
  async getOrganizationsByUserId(@Param('userId') userId: number) {
    const organizations =
      await this.organizationUserService.getOrganizationsByUserId(userId);

    if (!organizations) {
      return new ApiResponseDto(
        HttpStatus.NOT_FOUND,
        'No organizations found for this user',
        null
      );
    }

    return new ApiResponseDto(
      HttpStatus.OK,
      'Organizations retrieved successfully',
      organizations
    );
  }
}
