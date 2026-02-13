import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CredentialService } from './credential.service';
import { CreateCredentialDto, UpdateCredentialDto, CredentialFilterDto } from './dtos';
import { SuccessResponse } from '@src/commons/dtos';
import { CurrentUser, Roles } from '@src/modules/auth/decorators';
import { RolesGuard } from '@src/modules/auth/guards';
import { Role } from '@src/modules/role/enums';
import type { CurrentUser as CurrentUserType } from '@src/modules/auth/interfaces';

@ApiTags('Credentials')
@ApiBearerAuth()
@Controller({ path: 'credentials', version: '1' })
@UseGuards(RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.ADMIN)
export class CredentialController {
  constructor(private readonly credentialService: CredentialService) {}

  @Post()
  @ApiOperation({ summary: 'Issue a new credential' })
  @ApiResponse({ status: 201, description: 'Credential created successfully' })
  async create(@CurrentUser() user: CurrentUserType, @Body() dto: CreateCredentialDto) {
    const credential = await this.credentialService.create(user.organizationUuid, dto);
    return new SuccessResponse('Credential created successfully', credential);
  }

  @Get()
  @ApiOperation({ summary: 'Get all credentials for current organization' })
  @ApiResponse({ status: 200, description: 'Credentials list' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'eventId', required: false })
  async findAll(@CurrentUser() user: CurrentUserType, @Query() filters: CredentialFilterDto) {
    const result = await this.credentialService.findAll(user.organizationUuid, filters);
    return new SuccessResponse('Credentials retrieved successfully', result);
  }

  @Get(':uuid')
  @ApiOperation({ summary: 'Get credential by UUID' })
  @ApiResponse({ status: 200, description: 'Credential found' })
  @ApiResponse({ status: 404, description: 'Credential not found' })
  async findOne(@CurrentUser() user: CurrentUserType, @Param('uuid') uuid: string) {
    const credential = await this.credentialService.findByUuid(uuid, user.organizationUuid);
    if (!credential) {
      return new SuccessResponse('Credential not found', null);
    }
    return new SuccessResponse('Credential retrieved successfully', credential);
  }

  @Patch(':uuid')
  @ApiOperation({ summary: 'Update credential' })
  @ApiResponse({ status: 200, description: 'Credential updated successfully' })
  @ApiResponse({ status: 404, description: 'Credential not found' })
  async update(
    @CurrentUser() user: CurrentUserType,
    @Param('uuid') uuid: string,
    @Body() dto: UpdateCredentialDto,
  ) {
    const credential = await this.credentialService.updateByUuid(uuid, user.organizationUuid, dto);
    return new SuccessResponse('Credential updated successfully', credential);
  }

  @Delete(':uuid')
  @ApiOperation({ summary: 'Soft delete credential' })
  @ApiResponse({ status: 200, description: 'Credential deleted successfully' })
  @ApiResponse({ status: 404, description: 'Credential not found' })
  async remove(@CurrentUser() user: CurrentUserType, @Param('uuid') uuid: string) {
    await this.credentialService.deleteByUuid(uuid, user.organizationUuid);
    return new SuccessResponse('Credential deleted successfully', { deleted: true });
  }
}
