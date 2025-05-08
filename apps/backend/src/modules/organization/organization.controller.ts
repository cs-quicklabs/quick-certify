import {
  Controller,
  Get,
  Param,
  HttpStatus,
  Put,
  Body,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { OrganizationService } from './organization.service';
import { OrganizationUserService } from './organization-user.service';
import { ApiResponse as ApiResponseDto } from '@/common/dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '@/modules/auth/guards';
import { CurrentUser } from '@/common/decorators';
import { UserModel } from '@/models';

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

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update organization details' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Organization updated successfully',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Organization not found',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid data provided',
    type: ApiResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User does not have permission to update this organization',
    type: ApiResponseDto,
  })
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true }))
    updateOrganizationDto: UpdateOrganizationDto,
    @CurrentUser() user: UserModel
  ) {
    return this.organizationService.updateOrganization(
      id,
      updateOrganizationDto,
      user.id
    );
  }
}
